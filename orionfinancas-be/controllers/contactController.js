const emailService = require('../services/emailService');

const contactController = {
    sendContactForm: async (req, res) => {
        try {
            const { name, email, subject, message } = req.body;

            if (!name || !email || !subject || !message) {
                return res.status(400).json({
                    message: "Todos os campos são obrigatórios",
                    status: "ERROR"
                });
            }

            const sent = await emailService.sendContactEmail(name, email, subject, message);

            if (sent) {
                return res.json({
                    message: "Sua mensagem foi enviada com sucesso!",
                    status: "OK"
                });
            } else {
                return res.status(500).json({
                    message: "Erro ao enviar mensagem. Tente novamente mais tarde.",
                    status: "ERROR"
                });
            }
        } catch (error) {
            console.error("Erro no contactController:", error);
            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            });
        }
    }
};

module.exports = contactController;
