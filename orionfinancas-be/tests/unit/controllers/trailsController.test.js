const trailsController = require('../../../controllers/trailsController');
const { getDB } = require('../../../config/database');

jest.mock('../../../config/database');

describe('Trails Controller Unit Tests', () => {
    let req, res, mockDb, mockTrailsCollection;

    beforeEach(() => {
        mockTrailsCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            findOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockTrailsCollection),
        };
        getDB.mockReturnValue(mockDb);

        req = { params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getAllTrails', () => {
        it('should return trails list', async () => {
            const mockTrails = [{ title: 'Trail 1', modulos: [{ isActive: true }] }];
            mockTrailsCollection.toArray.mockResolvedValue(mockTrails);

            await trailsController.getAllTrails(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK'
            }));
        });
    });
});
