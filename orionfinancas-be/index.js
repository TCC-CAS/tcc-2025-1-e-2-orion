require('dotenv').config();
const { default: rateLimit } = require('express-rate-limit');
const { connectDB, getDB } = require('./config/database.js');
const goalsRoutes = require('./routes/goals.js');
const accountRoutes = require('./routes/account.js');
const missionsRoutes = require('./routes/missions.js');
const quizzesRoutes = require('./routes/quizzes.js');
const lessonsRoutes = require('./routes/lessons.js');
const trailsRoutes = require('./routes/trails.js');
const usersRoutes = require('./routes/users.js');
const subscriptionsRoutes = require('./routes/subscriptions.js');
const shopRoutes = require('./routes/shop.js');
const financesRoutes = require('./routes/finances.js');
const { contentSecurityPolicy } = require('helmet');
const authRoutes = require('./routes/auth.js');
const contactRoutes = require('./routes/contact.js');
const webhooksRoutes = require('./routes/webhooks.js');
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();

app.set('trust proxy', 1); // Confia no proxy do Render (necessário para o Rate Limit funcionar por usuário e não bloquear todos)

app.use(cookieParser());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"]
            }
        }
}));

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 10000 : 1000,
    message: { message: 'Muitas requisições. Tente novamente mais tarde.', status: 'ERROR' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limiter mais restrito para endpoints autenticados de usuário (evita abuso mesmo com cookie válido)
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'test' ? 10000 : 300,
    message: { message: 'Muitas requisições. Tente novamente mais tarde.', status: 'ERROR' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(globalLimiter);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);
// Rotas autenticadas — limiter adicional de 300 req/15min por IP
app.use('/api/account', userLimiter, accountRoutes);
app.use('/api/goals', userLimiter, goalsRoutes);
app.use('/api/missions', userLimiter, missionsRoutes);
app.use('/api/quizzes', userLimiter, quizzesRoutes);
app.use('/api/lessons', userLimiter, lessonsRoutes);
app.use('/api/trails', userLimiter, trailsRoutes);
app.use('/api/users', userLimiter, usersRoutes);
app.use('/api/subscriptions', userLimiter, subscriptionsRoutes);
app.use('/api/shop', userLimiter, shopRoutes);
app.use('/api/finances', userLimiter, financesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Funcionando',
        status: 'OK'
    })
})

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

if (require.main === module) {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        await connectDB();

        // Keep-alive: evita cold start em serviços free tier (Render, Railway)
        if (process.env.BASE_URL) {
            setInterval(() => {
                fetch(`${process.env.BASE_URL}/health`).catch(() => {});
            }, 14 * 60 * 1000);
        }
    });
}

module.exports = app;
