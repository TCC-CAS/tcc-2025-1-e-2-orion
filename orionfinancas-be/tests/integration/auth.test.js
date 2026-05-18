const request = require('supertest');
const app = require('../../index');

describe('Auth Integration Tests', () => {

    // Payload base alinhado a RF01/RN01 (REV 023): birthdate obrigatório, faixa 15-25, termos
    const baseUser = (overrides = {}) => ({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        birthdate: '2005-06-15',
        acceptedTerms: true,
        acceptedPrivacy: true,
        ...overrides
    });

    beforeEach(async () => {
        await request(app).post('/api/auth/register').send(baseUser());
    });

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(baseUser({ name: 'New User', email: 'newuser@example.com' }));

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('OK');
    });

    it('should login the registered user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail to login with wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            });

        expect(res.status).toBe(401);
        expect(res.body.status).toBe('ERROR');
    });
});
