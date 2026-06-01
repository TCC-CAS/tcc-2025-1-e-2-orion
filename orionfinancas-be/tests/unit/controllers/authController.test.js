const authController = require('../../../controllers/authController');
const { getDB } = require('../../../config/database');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const missionService = require('../../../services/missionService');

jest.mock('../../../config/database');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../../../services/missionService');
jest.mock('../../../services/notificationService');

describe('Auth Controller Unit Tests', () => {
    let req, res, mockDb, mockUsersCollection;

    beforeEach(() => {
        mockUsersCollection = {
            findOne: jest.fn(),
            updateOne: jest.fn(),
            insertOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockUsersCollection),
        };
        getDB.mockReturnValue(mockDb);

        req = { body: {}, cookies: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return 400 if email or password missing', async () => {
            req.body = { email: 'test@test.com' };
            await authController.login(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should return 401 if user not found', async () => {
            req.body = { email: 'wrong@test.com', password: 'password' };
            mockUsersCollection.findOne.mockResolvedValue(null);
            await authController.login(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        it('should login successfully if credentials correct', async () => {
            const mockUser = { _id: new ObjectId(), email: 'test@test.com', password: 'hashed_password', isActive: true };
            req.body = { email: 'test@test.com', password: 'password' };
            mockUsersCollection.findOne.mockResolvedValue(mockUser);
            bcrypt.compare = jest.fn().mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock_token');

            await authController.login(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                message: 'Login realizado com sucesso'
            }));
        });
    });

    describe('register', () => {
        it('should return 400 if name, email or password missing', async () => {
            req.body = { name: 'Test' };
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        // Payload base válido conforme RF01/RN01 atual: nome, email, senha, data de nascimento (15-25), termos
        const validPayload = () => ({
            name: 'Test User',
            email: 'new@test.com',
            password: 'senha1234',
            birthdate: '2005-01-01',
            acceptedTerms: true,
            acceptedPrivacy: true
        });

        it('should return 400 if email is invalid', async () => {
            req.body = { ...validPayload(), email: 'invalid' };
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email inválido' }));
        });

        it('should return 400 if email already exists', async () => {
            req.body = { ...validPayload(), email: 'exists@test.com' };
            mockUsersCollection.findOne.mockResolvedValue({ email: 'exists@test.com', isActive: true });
            await authController.register(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email já cadastrado' }));
        });

        it('should register successfully', async () => {
            req.body = validPayload();
            mockUsersCollection.findOne.mockResolvedValue(null);
            mockUsersCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });
            bcrypt.hash = jest.fn().mockResolvedValue('hashed_pass');

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'OK' }));
        });
    });

    describe('validateEmail', () => {
        it('should return true for valid email', () => {
            expect(authController.validateEmail('test@example.com')).toBe(true);
        });
        it('should return false for invalid email', () => {
            expect(authController.validateEmail('invalid-email')).toBe(false);
        });
    });
});
