const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');
const express = require('express');
const cors = require('cors');

const router = express.Router();

router.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { 
        message: 'Muitas tentativas. Tente novamente em 15 minutos.',
        status: 'ERROR'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

router.use('/login', authLimiter);
router.use('/forgot-password', authLimiter);
router.use('/reset-password', authLimiter);

// Rotas autenticação
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/register', authController.register);

// Rotas recovery
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;

// http://localhost:3001/login