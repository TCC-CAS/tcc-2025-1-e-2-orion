const crypto = require('crypto');
const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');
const auditService = require('../services/auditService');
const notificationService = require('../services/notificationService');

const WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET;

/**
 * Valida assinatura HMAC do webhook AbacatePay.
 * O cliente envia X-Abacate-Signature: sha256=<hex>
 * Calcula HMAC-SHA256 do corpo cru com WEBHOOK_SECRET e compara em
 * tempo constante (timingSafeEqual) para evitar timing attacks.
 */
function verifyAbacatepaySignature(req) {
    if (!WEBHOOK_SECRET) {
        console.warn('[Webhook] ABACATEPAY_WEBHOOK_SECRET não definido — recusando webhook por segurança');
        return false;
    }

    const signatureHeader = req.headers['x-abacate-signature'] || req.headers['x-webhook-signature'] || '';
    if (!signatureHeader) return false;

    const provided = signatureHeader.replace(/^sha256=/, '');
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const computed = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

    try {
        const a = Buffer.from(provided, 'hex');
        const b = Buffer.from(computed, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch {
        return false;
    }
}

const webhooksController = {
    abacatepay: async (req, res) => {
        try {
            if (!verifyAbacatepaySignature(req)) {
                return res.status(401).json({ message: 'Assinatura inválida', status: 'ERROR' });
            }

            const event = req.body || {};
            const eventId = event.id || event.event_id;
            const eventType = event.event || event.type;

            if (!eventId || !eventType) {
                return res.status(400).json({ message: 'Payload inválido', status: 'ERROR' });
            }

            const db = getDB();

            // Idempotência: evita processar o mesmo evento mais de uma vez
            const dedup = await db.collection('processed_webhooks').updateOne(
                { eventId, source: 'abacatepay' },
                { $setOnInsert: { eventId, source: 'abacatepay', receivedAt: new Date() } },
                { upsert: true }
            );

            if (dedup.upsertedCount === 0) {
                // Já processamos
                return res.status(200).json({ status: 'OK', alreadyProcessed: true });
            }

            // Processa eventos de pagamento confirmado
            if (eventType === 'billing.paid' || eventType === 'payment.succeeded') {
                const externalId = event.data?.product?.externalId || event.data?.externalId;
                const customerEmail = event.data?.customer?.email;

                if (!externalId) {
                    console.warn('[Webhook] billing.paid sem externalId', eventId);
                    return res.status(200).json({ status: 'OK', warning: 'externalId ausente' });
                }

                // externalId formato: PRO-MONTHLY-<ts> ou PRO-ANNUAL-<ts>
                const isAnnual = /ANNUAL/i.test(externalId);
                const planType = isAnnual ? 'PRO' : 'monthly';

                let user = null;
                if (customerEmail) {
                    user = await db.collection('users').findOne({ email: customerEmail.toLowerCase() });
                }

                if (!user) {
                    console.warn('[Webhook] usuário não encontrado para o evento', eventId);
                    return res.status(200).json({ status: 'OK', warning: 'usuário não encontrado' });
                }

                const expiresAt = new Date();
                if (isAnnual) {
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                } else {
                    expiresAt.setMonth(expiresAt.getMonth() + 1);
                }

                await db.collection('subscriptions').insertOne({
                    userId: user._id,
                    planType,
                    status: 'ACTIVE',
                    source: 'abacatepay',
                    externalId,
                    eventId,
                    activatedAt: new Date(),
                    expiresAt
                });

                await notificationService.createNotification(
                    user._id,
                    'Assinatura PRO ativada!',
                    'Pagamento confirmado. Aproveite todos os benefícios PRO.',
                    'GENERAL'
                );

                await auditService.log({
                    action: 'SUBSCRIPTION_ACTIVATED_VIA_WEBHOOK',
                    actorId: user._id.toString(),
                    actorRole: 'system',
                    metadata: { eventId, externalId, planType }
                });
            }

            return res.status(200).json({ status: 'OK' });
        } catch (error) {
            console.error('[Webhook] Erro ao processar abacatepay:', error);
            return res.status(500).json({ message: 'Erro ao processar webhook', status: 'ERROR' });
        }
    }
};

module.exports = webhooksController;
