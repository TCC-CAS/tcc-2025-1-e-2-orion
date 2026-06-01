const adminSubscriptionsService = require("../services/adminSubscriptionsService.js");

const subscriptionsController = {
    // Admin: list premium subscriptions
    getAdminSubscriptions: async (req, res) => {
        try {
            const { status } = req.query;
            const subscriptions = await adminSubscriptionsService.getAdminSubscriptions({ status });

            return res.json({
                message: "Assinaturas obtidas com sucesso",
                status: "OK",
                data: subscriptions
            });
        } catch (error) {
            console.error("Erro ao obter assinaturas no admin:", error);

            if (error.message?.includes("status inválido")) {
                return res.status(400).json({
                    message: error.message,
                    status: "ERROR"
                });
            }

            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            });
        }
    }
};

module.exports = subscriptionsController;
