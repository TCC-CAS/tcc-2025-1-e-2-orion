const contactController = require('../../../controllers/contactController');
const emailService = require('../../../services/emailService');

// Mock the email service
jest.mock('../../../services/emailService');

describe('Contact Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should return 400 if any field is missing', async () => {
        req.body = { name: 'Test', email: 'test@example.com', subject: 'Hello' }; // missing message

        await contactController.sendContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "Todos os campos são obrigatórios",
            status: "ERROR"
        });
    });

    it('should return 200 and success message when email is sent successfully', async () => {
        req.body = { name: 'Test', email: 'test@example.com', subject: 'Hello', message: 'World' };
        emailService.sendContactEmail.mockResolvedValue(true);

        await contactController.sendContactForm(req, res);

        expect(emailService.sendContactEmail).toHaveBeenCalledWith('Test', 'test@example.com', 'Hello', 'World');
        expect(res.json).toHaveBeenCalledWith({
            message: "Sua mensagem foi enviada com sucesso!",
            status: "OK"
        });
        expect(res.status).not.toHaveBeenCalled(); // defaults to 200
    });

    it('should return 500 if email service fails to send', async () => {
        req.body = { name: 'Test', email: 'test@example.com', subject: 'Hello', message: 'World' };
        emailService.sendContactEmail.mockResolvedValue(false);

        await contactController.sendContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Erro ao enviar mensagem. Tente novamente mais tarde.",
            status: "ERROR"
        });
    });

    it('should return 500 if email service throws an exception', async () => {
        req.body = { name: 'Test', email: 'test@example.com', subject: 'Hello', message: 'World' };
        emailService.sendContactEmail.mockRejectedValue(new Error('SMTP Error'));

        await contactController.sendContactForm(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Erro interno do servidor",
            status: "ERROR"
        });
    });
});
