const emailService = require('../services/emailService');
const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const missionService = require('../services/missionService');
require('dotenv').config();

const RESET_SECRET = process.env.JWT_RESET_SECRET;
const SECRET_KEY = process.env.SECRET_KEY;

const authController = { 

    hashPassword: async function(password) {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    },

    comparePasswords: async function(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    },

    validateEmail: function(email) { 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    validateDate: function(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    },

    login: async function(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email e senha são obrigatórios',
                    status: 'ERROR'
                });
            }

            const db = getDB();
            const usersCollection = db.collection('users');

            const user = await usersCollection.findOne({email: email.toLowerCase()});

            if (!user) {
                return res.status(401).json({
                    message: 'Email ou senha inválidos',
                    status: 'ERROR',
                    token: null
                });
            }

            const isValidPassword = await authController.comparePasswords(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({
                    message: 'Email ou senha Inválidos',
                    status: 'ERROR',
                    token: null
                });
            }

            if (user.isActive === false) {
                await usersCollection.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            isActive: true,
                            deactivatedAt: null,
                            updatedAt: new Date()
                        }
                    }
                );
            }

            const token = await authController.generateToken(email, password);

            // Trigger mission progress for daily login
            await missionService.updateProgress(user._id.toString(), 'DAILY_LOGIN');

            res.json({
                message: user.isActive === false ? 
                'Conta reativada e login realizado com sucesso' :
                'Login realizado com sucesso',
                status: "OK",
                token: token,
                accountReactivated: user.isActive === false
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ message: 'Erro interno do servidor', status: 'ERROR'});
        }
    },

    adminLogin: async function(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: 'Email e senha são obrigatórios',
                    status: 'ERROR'
                });
            }

            const db = getDB();
            const adminsCollection = db.collection('admins');

            const user = await adminsCollection.findOne({email: email.toLowerCase()});

            if (!user) {
                return res.status(401).json({
                    message: 'Email ou senha inválidos',
                    status: 'ERROR',
                    token: null
                });
            }

            const isValidPassword = await authController.comparePasswords(password, user.password);

            if (!isValidPassword) {
                return res.status(401).json({
                    message: 'Email ou senha Inválidos',
                    status: 'ERROR',
                    token: null
                });
            }

            // Generate token specifically for admin
            const payload = {
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                role: 'Admin'
            };

            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '12h' });

            res.json({
                message: 'Login de administrador realizado com sucesso',
                status: "OK",
                token: token
            });

        } catch (error) {
            console.error('Erro no login admin:', error);
            res.status(500).json({ message: 'Erro interno do servidor', status: 'ERROR'});
        }
    },

    register: async function(req, res) {
        try {
            const { name, email, password, birthdate } = req.body;
            const db = getDB();
            const usersCollection = db.collection('users');

            if (!name || !email || !password) {
                return res.status(400).json({ 
                    message: 'Campos não foram preenchidos', 
                    status: 'ERROR'
                });
            }

            if (!authController.validateEmail(email)) {
                return res.status(400).json({
                    message: 'Email inválido',
                    status: 'ERROR'
                })
            }

            const existingUser = await usersCollection.findOne({
                email: email.toLowerCase()
            });

            if (existingUser) {
                if (existingUser.isActive === false) {
                    return res.status(400).json({
                        message: 'Este email já possui uma conta inativa. Faça login para reativar sua conta.',
                        status: 'ERROR',
                        canReactivate: true
                    });
                }

                return res.status(400).json({
                    message: 'Email já cadastrado',
                    status: 'ERROR'
                });
            }

            let birthdateDate = null

            if (birthdate) {
                if (!authController.validateDate(birthdate)) {
                    return res.status(400).json({
                        message: 'Data de nascimento inválida',
                        status: 'ERROR'
                    });
                }
                birthdateDate = new Date(birthdate);
            }

            const payload = { 
                name: name,
                email: email.toLowerCase(),
                password: await authController.hashPassword(password),
                birthdate: birthdateDate,
                isActive: true,
                profile: { level: 1, points: 0, avatarUrl: "", lives: 5, streak: 0, lastActivity: null },
                wallet: { coins: 0, xp: 0, balance: 0},
                inventory: [],
                equippedAvatar: "",
                createdAt: new Date(),
                updatedAt: new Date()
            }

            const registerUser = await usersCollection.insertOne(payload);

            res.status(201).json({
                message: 'Usuário registrado com sucesso',
                status: 'OK',
                userId: registerUser.insertedId
            })

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    },

    generateToken: async function(email, password) {
        try {
            const db = getDB();
            const usersCollection = db.collection('users');
            
            const user = await usersCollection.findOne({
                email: email.toLowerCase()
            });
    
            if (!user) {
                return null;
            }
    
            const isValidPassword = await authController.comparePasswords(password, user.password);

            if (!isValidPassword) {
                return null;
            }

            const userRole = user?.role
                || user?.userType
                || user?.profile?.role
                || user?.profile?.type
                || user?.profile?.perfil
                || user?.profile?.userType
                || "";

            const normalizedRole = String(userRole).trim().toLowerCase();
            const role = ["admin", "administrador"].includes(normalizedRole) ? "Admin" : 
                        (["mentor", "mentora"].includes(normalizedRole) ? "Mentor" : "Aluno");

            const payload = {
                userId: user._id.toString(),
                email: user.email,
                name: user.name,
                role: role
            }
    
            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '12h' });
            return token;

        } catch (error) {
            return null;
        }
    },

    verifyToken: function(token) {
         try {
            const decoded = jwt.verify(token, SECRET_KEY);
            return decoded;
         } catch (error) {
            return null;
         }
    },

    forgotPassword: async function(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    message: 'Email é obrigatório',
                    status: 'ERROR'
                });
            }

            if (!authController.validateEmail(email)) {
                return res.status(400).json({
                    message: 'Email inválido',
                    status: 'ERROR'
                })
            }

            const db = getDB();
            const usersCollection = db.collection('users');

            const user = await usersCollection.findOne({
                email: email.toLowerCase()
            });

            if (!user) {
                return res.json({
                    message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha',
                    status: 'OK'
                });
            }

            const resetToken = jwt.sign(
                {
                    userId: user._id.toString(),
                    email: user.email,
                    type: 'password_reset'
                },
                RESET_SECRET,
                { expiresIn: '1h' }
            );

            await usersCollection.updateOne(
                { _id: user._id },
                { 
                    $set: {
                        resetToken: resetToken,
                        resetTokenExpires: new Date(Date.now() + 3600000),
                        updatedAt: new Date()
                    }
                }
            );

            const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

            if (!emailSent) {
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $unset: { resetToken: "", resetTokenExpires: "" } }
                );

                return res.status(500).json({
                    message: 'Erro ao enviar email de recuperação',
                    status: 'ERROR'
                });
            }

            res.json({
                message: 'Email de recuperação enviado com sucesso. Verifique sua caixa de entrada',
                status: 'OK'
            })
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    resetPassword: async function(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({
                    message: 'Token e nova senha são obrigatórios',
                    status: 'ERROR'
                })
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    message: 'Nova senha dever ter no minimo 6 caracteres',
                    status: 'ERROR'
                });
            }

            let decoded;
            try {
                decoded = jwt.verify(token, RESET_SECRET);
            } catch (error) {
                return res.status(400).json({
                    message: 'Token inválido ou expirado',
                    status: 'ERROR'
                });
            }

            if (decoded.type !== 'password_reset') {
                return res.status(400).json({
                    message: 'Tipo de token inválido',
                    status: 'ERROR'
                });
            }

            const db = getDB();
            const usersCollection = db.collection('users');

            const user = await usersCollection.findOne({
                _id: new ObjectId(decoded.userId),
                email: decoded.email,
                resetToken: token,
                resetTokenExpires: { $gt: new Date() }
            });

            if (!user) {
                return res.status(400).json({
                    message: 'Token inválido ou expirado',
                    status: 'ERROR'
                });
            }

            const hashedPassword = await authController.hashPassword(newPassword);

            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        password: hashedPassword,
                        updatedAt: new Date()
                    },
                    $unset: {
                        resetToken: "",
                        resetTokenExpires: ""
                    }
                }
            );
            
            res.json({
                message: 'Senha redefinida com sucesso! Você já pode fazer login.',
                status: 'OK'
            });

        } catch (error) {
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = authController;