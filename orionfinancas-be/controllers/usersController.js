const adminUsersService = require("../services/adminUsersService.js");

const usersController = {
    // Admin: list all users with role + account status
    getAdminUsers: async (req, res) => {
        try {
            const { status } = req.query;
            const users = await adminUsersService.getAdminUsers({ status });

            return res.json({
                message: "Usuários obtidos com sucesso",
                status: "OK",
                data: users
            });
        } catch (error) {
            console.error("Erro ao obter usuários no admin:", error);

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

module.exports = usersController;
