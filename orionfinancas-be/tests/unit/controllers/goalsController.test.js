const goalsController = require('../../../controllers/goalsController');
const { getDB } = require('../../../config/database');
const { ObjectId } = require('mongodb');

jest.mock('../../../config/database');
jest.mock('../../../services/missionService');

describe('Goals Controller Unit Tests', () => {
    let req, res, mockDb, mockGoalsCollection;

    beforeEach(() => {
        mockGoalsCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            insertOne: jest.fn(),
            updateOne: jest.fn(),
            deleteOne: jest.fn(),
            findOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockGoalsCollection),
        };
        getDB.mockReturnValue(mockDb);

        req = { user: { id: new ObjectId().toString() }, body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getAllGoals', () => {
        it('should return user goals', async () => {
            const mockGoals = [{ goalName: 'Save for car', targetAmount: 10000 }];
            mockGoalsCollection.toArray.mockResolvedValue(mockGoals);

            await goalsController.getAllGoals(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                data: mockGoals
            }));
        });
    });

    describe('createGoal', () => {
        it('should return 400 if fields missing', async () => {
            req.body = { goalName: 'Test' };
            await goalsController.createGoal(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
});
