const usersController = require('../../../controllers/usersController');
const adminUsersService = require('../../../services/adminUsersService');

jest.mock('../../../services/adminUsersService');

describe('Users Controller Unit Tests', () => {
    let req, res;

    beforeEach(() => {
        req = { query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getAdminUsers', () => {
        it('should return users list', async () => {
            const mockUsers = [{ name: 'User 1' }];
            adminUsersService.getAdminUsers.mockResolvedValue(mockUsers);

            await usersController.getAdminUsers(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                data: mockUsers
            }));
        });
    });
});
