const quizzesController = require('../../../controllers/quizzesController');
const { getDB } = require('../../../config/database');
const { ObjectId } = require('mongodb');
const missionService = require('../../../services/missionService');
const rewardService = require('../../../services/rewardService');
const streakService = require('../../../services/streakService');

jest.mock('../../../config/database');
jest.mock('../../../services/adminQuizzesService');
jest.mock('../../../services/missionService');
jest.mock('../../../services/rewardService');
jest.mock('../../../services/streakService');

describe('Quizzes Controller Unit Tests', () => {
    let req, res, mockDb, mockQuizzesCollection;

    beforeEach(() => {
        mockQuizzesCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            findOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockQuizzesCollection),
        };
        getDB.mockReturnValue(mockDb);

        req = { params: {}, user: { id: new ObjectId().toString() } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getAllQuizzes', () => {
        it('should return quizzes list', async () => {
            mockDb.collection.mockReturnValueOnce({ find: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) }); // trails
            mockQuizzesCollection.toArray.mockResolvedValue([]);
            mockDb.collection.mockReturnValueOnce(mockQuizzesCollection);
            
            await quizzesController.getAllQuizzes(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK'
            }));
        });
    });

    describe('getQuizById', () => {
        it('should return 404 if quiz not found', async () => {
            req.params.id = new ObjectId().toString();
            mockQuizzesCollection.findOne.mockResolvedValue(null);
            
            await quizzesController.getQuizById(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('should return 403 if quiz is unavailable (inactive lesson)', async () => {
            const quizId = new ObjectId();
            const lessonId = new ObjectId();
            req.params.id = quizId.toString();
            mockQuizzesCollection.findOne.mockResolvedValue({ _id: quizId, lessonId, isActive: true });
            
            // Mock trails to return no active lessons
            mockDb.collection.mockImplementation((name) => {
                if (name === 'content_trails') return { find: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) };
                if (name === 'quizzes') return mockQuizzesCollection;
                return {};
            });

            await quizzesController.getQuizById(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('completeQuiz', () => {
        it('should complete quiz and grant normal rewards if passed', async () => {
            const quizId = new ObjectId();
            const lessonId = new ObjectId();
            req.body = { quizId: quizId.toString(), score: 100, lessonId: lessonId.toString() };
            
            const mockQuiz = { _id: quizId, lessonId, isActive: true, questions: [{}, {}, {}, {}] };
            mockQuizzesCollection.findOne.mockResolvedValue(mockQuiz);

            // Mock multiple collections
            mockDb.collection.mockImplementation((name) => {
                if (name === 'quizzes') return mockQuizzesCollection;
                if (name === 'content_trails') return {
                    find: jest.fn().mockReturnThis(),
                    toArray: jest.fn().mockResolvedValue([{
                        modulos: [{ isActive: true, licoes: [{ _id: lessonId }] }]
                    }]),
                    // BUG-A2: completeQuiz agora consulta trail.isPremium via findOne
                    findOne: jest.fn().mockResolvedValue({ isPremium: false })
                };
                if (name === 'settings') return { findOne: jest.fn().mockResolvedValue({ minPassingScore: 70 }) };
                if (name === 'user_quiz_attempts') return { findOne: jest.fn().mockResolvedValue(null), insertOne: jest.fn() };
                if (name === 'subscriptions') return { findOne: jest.fn().mockResolvedValue(null) };
                if (name === 'users') return { findOne: jest.fn().mockResolvedValue({ profile: { lives: 5 } }), updateOne: jest.fn() };
                return {};
            });

            await quizzesController.completeQuiz(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                passed: true
            }));
        });
    });
});
