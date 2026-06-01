const lessonsController = require('../../../controllers/lessonsController');
const { getDB } = require('../../../config/database');
const { ObjectId } = require('mongodb');
const missionService = require('../../../services/missionService');
const rewardService = require('../../../services/rewardService');
const streakService = require('../../../services/streakService');

jest.mock('../../../config/database');
jest.mock('../../../services/missionService');
jest.mock('../../../services/rewardService');
jest.mock('../../../services/streakService');

describe('Lessons Controller Unit Tests', () => {
    let req, res, mockDb, mockLessonsCollection;

    beforeEach(() => {
        mockLessonsCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            findOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockLessonsCollection),
        };
        getDB.mockReturnValue(mockDb);

        req = { params: {}, user: { id: new ObjectId().toString() } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getLessonProgress', () => {
        it('should return lesson progress', async () => {
            const mockProgress = [{ lessonId: new ObjectId(), status: 'COMPLETED' }];
            mockLessonsCollection.toArray.mockResolvedValue(mockProgress);

            await lessonsController.getLessonProgress(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                data: mockProgress
            }));
        });
    });

    describe('completeLesson', () => {
        it('should return 404 if lesson not found', async () => {
            req.body = { lessonId: new ObjectId().toString() };
            mockDb.collection.mockReturnValueOnce({ findOne: jest.fn().mockResolvedValue(null) }); // trail search
            
            await lessonsController.completeLesson(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should complete lesson and grant rewards', async () => {
            const lessonId = new ObjectId();
            const moduleId = new ObjectId();
            const trailId = new ObjectId();
            req.body = { lessonId: lessonId.toString() };
            
            // Mock getLessonContext
            mockDb.collection.mockImplementation((name) => {
                if (name === 'content_trails') return { findOne: jest.fn().mockResolvedValue({ 
                    _id: trailId,
                    modulos: [{ _id: moduleId, isActive: true, licoes: [{ _id: lessonId }] }] 
                }) };
                if (name === 'user_lesson_progress') return { findOne: jest.fn().mockResolvedValue(null), updateOne: jest.fn() };
                if (name === 'subscriptions') return { findOne: jest.fn().mockResolvedValue(null) };
                return {};
            });

            await lessonsController.completeLesson(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                message: 'Aula marcada como concluída'
            }));
        });
    });

    describe('submitReview', () => {
        it('should return 400 if rating missing', async () => {
            req.body = { moduleId: new ObjectId().toString() };
            await lessonsController.submitReview(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should submit review successfully', async () => {
            req.body = { moduleId: new ObjectId().toString(), rating: 5, comment: 'Great!' };
            const mockReviewsCollection = { insertOne: jest.fn() };
            mockDb.collection.mockReturnValue(mockReviewsCollection);

            await lessonsController.submitReview(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
        });
    });
});
