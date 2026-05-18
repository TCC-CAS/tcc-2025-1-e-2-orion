const request = require('supertest');
const app = require('../../index');

describe('Account Integration Tests', () => {
    let cookie;

    beforeEach(async () => {
        // Register and login to get the auth cookie (RF01/RN01 atualizado)
        await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Account Test User',
                email: 'accounttest@example.com',
                password: 'password123',
                birthdate: '2005-06-15',
                acceptedTerms: true,
                acceptedPrivacy: true
            });

        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'accounttest@example.com',
                password: 'password123'
            });

        cookie = res.headers['set-cookie'];
    });

    it('should get the user profile', async () => {
        const res = await request(app)
            .get('/api/account/profile')
            .set('Cookie', cookie);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');
        expect(res.body.data).toBeDefined();
        expect(res.body.data.email).toBe('accounttest@example.com');
        expect(res.body.data.name).toBe('Account Test User');
    });

    it('should update the user account', async () => {
        const res = await request(app)
            .put('/api/account/updateAccount')
            .set('Cookie', cookie)
            .send({
                name: 'Updated Name'
            });

        if (res.status !== 200) {
            console.log("updateAccount error:", res.status, res.body);
        }

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('OK');

        // Fetch profile to verify update
        const profileRes = await request(app)
            .get('/api/account/profile')
            .set('Cookie', cookie);

        expect(profileRes.body.data.name).toBe('Updated Name');
    });

    it('should return 401 for unauthorized access', async () => {
        const res = await request(app).get('/api/account/profile');
        expect(res.status).toBe(401);
    });
});
