const auditService = require('../services/auditService');

/**
 * Middleware que registra ações administrativas em audit_logs.
 * Usar APÓS verifyAdminToken. Captura o resultado da resposta para
 * logar apenas operações bem-sucedidas (status 2xx).
 *
 * Uso:
 *   router.put('/admin/settings', verifyAdminToken, auditAdmin('UPDATE_SETTINGS'), handler)
 */
function auditAdmin(action) {
    return (req, res, next) => {
        const originalJson = res.json.bind(res);

        res.json = (body) => {
            // Loga somente respostas de sucesso (status 2xx)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                auditService.log({
                    action: `ADMIN_${action}`,
                    actorId: req.user?.id || null,
                    actorRole: 'admin',
                    targetId: req.params?.id || req.body?._id || req.body?.id || null,
                    metadata: {
                        method: req.method,
                        path: req.originalUrl,
                        ip: req.ip,
                        bodyKeys: req.body ? Object.keys(req.body) : []
                    }
                });
            }
            return originalJson(body);
        };

        next();
    };
}

module.exports = auditAdmin;
