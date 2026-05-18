const subscriptionsController = require('../../../controllers/subscriptionsController');
const adminSubscriptionsService = require('../../../services/adminSubscriptionsService');

jest.mock('../../../services/adminSubscriptionsService');

describe('Subscriptions Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should return 200 and subscriptions list', async () => {
        const mockSubs = [{ id: 1, status: 'ACTIVE' }];
        req.query.status = 'ACTIVE';
        adminSubscriptionsService.getAdminSubscriptions.mockResolvedValue(mockSubs);

        await subscriptionsController.getAdminSubscriptions(req, res);

        expect(adminSubscriptionsService.getAdminSubscriptions).toHaveBeenCalledWith({ status: 'ACTIVE' });
        expect(res.json).toHaveBeenCalledWith({
            message: "Assinaturas obtidas com sucesso",
            status: "OK",
            data: mockSubs
        });
    });

    it('should return 400 for invalid status', async () => {
        req.query.status = 'INVALID';
        adminSubscriptionsService.getAdminSubscriptions.mockRejectedValue(new Error('status inválido'));

        await subscriptionsController.getAdminSubscriptions(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            message: "status inválido",
            status: "ERROR"
        });
    });

    it('should return 500 for generic error', async () => {
        adminSubscriptionsService.getAdminSubscriptions.mockRejectedValue(new Error('Database error'));

        await subscriptionsController.getAdminSubscriptions(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            message: "Erro interno do servidor",
            status: "ERROR"
        });
    });
});
