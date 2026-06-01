const { MongoMemoryServer } = require('mongodb-memory-server');
const { connectDB, getDB, closeDB } = require('../config/database');

let mongoServer;

// Env vars de teste — definidos antes de qualquer require que dependa deles
process.env.NODE_ENV = 'test';
process.env.RESEND_KEY = process.env.RESEND_KEY || 're_test_dummy_key_for_jest';
process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-jwt-secret';
process.env.JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'test-reset-secret';
process.env.ABACATEPAY_KEY = process.env.ABACATEPAY_KEY || 'abc_test_dummy';
process.env.ABACATEPAY_WEBHOOK_SECRET = process.env.ABACATEPAY_WEBHOOK_SECRET || 'whsec_test_dummy';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
process.env.ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
process.env.TERMS_VERSION = process.env.TERMS_VERSION || '1.0';

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;
    await connectDB();
});

afterAll(async () => {
    // Disconnect and stop memory server
    await closeDB();
    await mongoServer.stop();
});

afterEach(async () => {
    // Clear all collections after each test to ensure isolation
    const db = getDB();
    if (db) {
        const collections = await db.collections();
        for (let collection of collections) {
            await collection.deleteMany({});
        }
    }
});
