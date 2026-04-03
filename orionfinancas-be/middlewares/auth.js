const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY;

const authMiddleware = { 
    verifyToken: (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    message: 'Token de acesso não fornecido',
                    status: 'ERROR'
                });
            }

            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: 'Formato do token inválido. Use: Bearer <token>',
                    status: "ERROR"
                });
            }

            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, SECRET_KEY);

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Token expirado',
                    status: 'ERROR'
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    message: 'Token inválido',
                    status: 'ERROR'
                });
            } else {
                return res.status(500).json({
                    message: 'Erro interno do servidor',
                    status: 'ERROR'
                });
            }
        }
    },

    verifyAdminToken: (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    message: 'Token de acesso não fornecido',
                    status: 'ERROR'
                });
            }

            if (!authHeader.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: 'Formato do token inválido. Use: Bearer <token>',
                    status: "ERROR"
                });
            }

            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, SECRET_KEY);

            if (decoded.role !== 'Admin') {
                return res.status(403).json({
                    message: 'Acesso negado. Esta rota é exclusiva para administradores.',
                    status: 'ERROR'
                });
            }

            req.user = {
                id: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };

            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Token expirado',
                    status: 'ERROR'
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    message: 'Token inválido',
                    status: 'ERROR'
                });
            } else {
                return res.status(500).json({
                    message: 'Erro interno do servidor',
                    status: 'ERROR'
                });
            }
        }
    }
};

module.exports = authMiddleware;