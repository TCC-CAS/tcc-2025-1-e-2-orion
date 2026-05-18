const { getDB } = require('../config/database');

const COLLECTION = 'audit_logs';
const RETENTION_DAYS = 190; // RNF03 / Marco Civil — retenção mínima de 6 meses (margem para variação de calendário)
let indexEnsured = false;

async function ensureIndex() {
    if (indexEnsured) return;
    try {
        const db = getDB();
        await db.collection(COLLECTION).createIndex(
            { createdAt: 1 },
            { expireAfterSeconds: RETENTION_DAYS * 24 * 60 * 60 }
        );
        await db.collection(COLLECTION).createIndex({ actorId: 1, createdAt: -1 });
        await db.collection(COLLECTION).createIndex({ action: 1, createdAt: -1 });
        indexEnsured = true;
    } catch (error) {
        console.error('Erro ao criar índice TTL audit_logs:', error);
    }
}

const auditService = {
    /**
     * Grava um evento de auditoria.
     * @param {Object} entry
     * @param {string} entry.action — ex: 'AUTH_LOGIN', 'ADMIN_UPDATE_SETTINGS'
     * @param {string} entry.actorId — id do usuário/admin que executou
     * @param {string} [entry.actorRole] — 'user' | 'admin'
     * @param {string} [entry.targetId] — id do recurso afetado
     * @param {Object} [entry.metadata] — dados extras (endpoint, IP, payload)
     */
    log: async (entry) => {
        try {
            await ensureIndex();
            const db = getDB();
            await db.collection(COLLECTION).insertOne({
                action: entry.action,
                actorId: entry.actorId || null,
                actorRole: entry.actorRole || null,
                targetId: entry.targetId || null,
                metadata: entry.metadata || {},
                createdAt: new Date()
            });
        } catch (error) {
            console.error('Erro ao gravar audit log:', error);
        }
    }
};

module.exports = auditService;
