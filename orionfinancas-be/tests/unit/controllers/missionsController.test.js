const missionsController = require('../../../controllers/missionsController');
const { getDB } = require('../../../config/database');
const { ObjectId } = require('mongodb');
const missionService = require('../../../services/missionService');

jest.mock('../../../config/database');
jest.mock('../../../services/missionService');

describe('Missions Controller Unit Tests', () => {
    let req, res, mockDb, mockMissionsCollection;

    beforeEach(() => {
        mockMissionsCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            insertOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockMissionsCollection),
        };
        getDB.mockReturnValue(mockDb);

        req = { user: { id: new ObjectId().toString() } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getUserMissions', () => {
        it('should return user missions', async () => {
            const missionId = new ObjectId();
            const mockMissions = [{ _id: missionId, title: 'First Mission' }];
            mockMissionsCollection.toArray.mockResolvedValue(mockMissions);
            
            const mockUserMissionsCollection = {
                find: jest.fn().mockReturnThis(),
                toArray: jest.fn().mockResolvedValue([{ missionId, status: 'COMPLETED' }])
            };
            
            mockDb.collection.mockImplementation((name) => {
                if (name === 'missions') return mockMissionsCollection;
                if (name === 'user_missions') return mockUserMissionsCollection;
                return {};
            });

            await missionsController.getUserMissions(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK'
            }));
        });
    });

    describe('claimReward', () => {
        it('should claim reward successfully', async () => {
            const missionId = new ObjectId();
            req.body = { missionId: missionId.toString() };
            missionService.claimReward.mockResolvedValue({ xp: 100, coins: 50 });

            await missionsController.claimReward(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                reward: { xp: 100, coins: 50 }
            }));
        });

        it('should return 400 if mission already completed', async () => {
            req.body = { missionId: new ObjectId().toString() };
            missionService.claimReward.mockRejectedValue(new Error('Missão já concluída'));

            await missionsController.claimReward(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Missão já concluída' }));
        });
    });

    describe('createMission', () => {
        it('should return 400 if fields missing', async () => {
            req.body = { title: 'Test' };
            await missionsController.createMission(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should create mission successfully', async () => {
            req.body = { 
                title: 'New', description: 'Desc', frequency: 'DAILY', 
                targetCount: 1, reward: { xp: 10, coins: 10 }, actionTrigger: 'LOGIN' 
            };
            mockMissionsCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });
            mockDb.collection.mockReturnValue(mockMissionsCollection);

            await missionsController.createMission(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
        });
    });
});
