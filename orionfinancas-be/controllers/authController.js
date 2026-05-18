const emailService = require('../services/emailService');
const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const missionService = require('../services/missionService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');
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

    validatePassword: function(password) {
        if (typeof password !== 'string' || password.length < 8) {
            return { valid: false, message: 'A senha deve ter no mínimo 8 caracteres' };
        }
        if (!/[A-Za-z]/.test(password)) {
            return { valid: false, message: 'A senha deve conter pelo menos uma letra' };
        }
        if (!/\d/.test(password)) {
            return { valid: false, message: 'A senha deve conter pelo menos um dígito' };
        }
        return { valid: true };
    },

    // RN — Nome: apenas letras (incluindo acentuadas), espaços, hifens e apóstrofos
    validateName: function(name) {
        if (typeof name !== 'string') return { valid: false, message: 'Nome inválido' };
        const trimmed = name.trim();
        if (trimmed.length < 3) {
            return { valid: false, message: 'O nome deve ter ao menos 3 caracteres' };
        }
        if (trimmed.length > 60) {
            return { valid: false, message: 'O nome não pode ultrapassar 60 caracteres' };
        }
        // Permite letras latinas (incluindo acentuadas), espaços, hifens e apóstrofos
        if (!/^[A-Za-zÀ-ÿ\s'\-]+$/.test(trimmed)) {
            return { valid: false, message: 'O nome deve conter apenas letras, espaços e hifens' };
        }
        return { valid: true };
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

            // Equaliza timing entre email cadastrado e não-cadastrado: se o usuário
            // não existe, ainda executa um bcrypt.compare contra um hash dummy.
            // Isso evita enumeração de e-mails via análise de tempo de resposta.
            const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8U6wU5T6fZYg3v0UszWxv8RdLJiJBy';
            const passwordHashToCompare = user ? user.password : DUMMY_HASH;
            const isValidPassword = await authController.comparePasswords(password, passwordHashToCompare);

            if (!user || !isValidPassword) {
                return res.status(401).json({
                    message: 'Email ou senha inválidos',
                    status: 'ERROR',
                    token: null
                });
            }

            const wasInactive = user.isActive === false;

            if (wasInactive) {
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

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 12 * 60 * 60 * 1000 // 12h
            });

            await auditService.log({
                action: 'AUTH_LOGIN',
                actorId: user._id.toString(),
                actorRole: 'user',
                metadata: { ip: req.ip, reactivated: wasInactive }
            });

            res.json({
                message: wasInactive ?
                'Conta reativada e login realizado com sucesso' :
                'Login realizado com sucesso',
                status: "OK",
                accountReactivated: wasInactive
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

            const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8U6wU5T6fZYg3v0UszWxv8RdLJiJBy';
            const passwordHashToCompare = user ? user.password : DUMMY_HASH;
            const isValidPassword = await authController.comparePasswords(password, passwordHashToCompare);

            if (!user || !isValidPassword) {
                return res.status(401).json({
                    message: 'Email ou senha inválidos',
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

            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 12 * 60 * 60 * 1000 // 12h
            });

            await auditService.log({
                action: 'AUTH_ADMIN_LOGIN',
                actorId: user._id.toString(),
                actorRole: 'admin',
                metadata: { ip: req.ip }
            });

            res.json({
                message: 'Login de administrador realizado com sucesso',
                status: "OK"
            });

        } catch (error) {
            console.error('Erro no login admin:', error);
            res.status(500).json({ message: 'Erro interno do servidor', status: 'ERROR'});
        }
    },

    register: async function(req, res) {
        try {
            const { name, email, password, birthdate, acceptedTerms, acceptedPrivacy, parentalConsent } = req.body;
            const db = getDB();
            const usersCollection = db.collection('users');

            if (!name || !email || !password || !birthdate) {
                return res.status(400).json({
                    message: 'Campos obrigatórios não foram preenchidos (nome, email, senha e data de nascimento)',
                    status: 'ERROR'
                });
            }

            const nameCheck = authController.validateName(name);
            if (!nameCheck.valid) {
                return res.status(400).json({ message: nameCheck.message, status: 'ERROR' });
            }

            if (!authController.validateEmail(email)) {
                return res.status(400).json({
                    message: 'Email inválido',
                    status: 'ERROR'
                })
            }

            const passwordCheck = authController.validatePassword(password);
            if (!passwordCheck.valid) {
                return res.status(400).json({
                    message: passwordCheck.message,
                    status: 'ERROR'
                });
            }

            if (acceptedTerms !== true || acceptedPrivacy !== true) {
                return res.status(400).json({
                    message: 'É necessário aceitar os Termos de Uso e a Política de Privacidade',
                    status: 'ERROR'
                });
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

            if (!authController.validateDate(birthdate)) {
                return res.status(400).json({
                    message: 'Data de nascimento inválida',
                    status: 'ERROR'
                });
            }

            const birthdateDate = new Date(birthdate);

            // RN01 — Validação de faixa etária (público-alvo: 15-25 anos)
            const today = new Date();
            let age = today.getFullYear() - birthdateDate.getFullYear();
            const m = today.getMonth() - birthdateDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthdateDate.getDate())) {
                age--;
            }

            if (age < 15 || age > 25) {
                return res.status(400).json({
                    message: 'A plataforma é destinada a jovens de 15 a 25 anos.',
                    status: 'ERROR'
                });
            }

            // LGPD Art. 14 — menores de 18 exigem consentimento dos responsáveis
            const isMinor = age < 18;
            if (isMinor && parentalConsent !== true) {
                return res.status(400).json({
                    message: 'Para usuários menores de 18 anos, é necessário o consentimento dos responsáveis (LGPD art. 14).',
                    status: 'ERROR',
                    requiresParentalConsent: true
                });
            }

            const TERMS_VERSION = process.env.TERMS_VERSION || '1.0';

            const payload = {
                name: name,
                email: email.toLowerCase(),
                password: await authController.hashPassword(password),
                birthdate: birthdateDate,
                isActive: true,
                isMinor,
                parentalConsent: isMinor ? { granted: true, grantedAt: new Date() } : null,
                profile: { level: 1, points: 0, avatarUrl: "", lives: 5, streak: 0, lastActivity: null },
                wallet: { coins: 0, xp: 0, balance: 0},
                inventory: [],
                equippedAvatar: "",
                termsAcceptedAt: new Date(),
                privacyAcceptedAt: new Date(),
                termsVersion: TERMS_VERSION,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            const registerUser = await usersCollection.insertOne(payload);

            await notificationService.createNotification(registerUser.insertedId, "Bem-vindo(a) ao Órion!", "Ficamos muito felizes em ter você aqui. Explore nossos cursos e comece sua jornada financeira!", "GENERAL");

            await auditService.log({
                action: 'AUTH_REGISTER',
                actorId: registerUser.insertedId.toString(),
                actorRole: 'user',
                metadata: { ip: req.ip, termsVersion: TERMS_VERSION }
            });

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

            const passwordCheck = authController.validatePassword(newPassword);
            if (!passwordCheck.valid) {
                return res.status(400).json({
                    message: passwordCheck.message,
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
    },

    logout: async function(req, res) {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        };
        res.clearCookie('token', cookieOptions);
        res.clearCookie('adminToken', cookieOptions);
        res.json({ message: 'Logout realizado com sucesso', status: 'OK' });
    },

    adminMe: async function(req, res) {
        // middleware verifies the token and role
        res.json({ message: 'Admin authenticated', status: 'OK', user: req.user });
    }
};

module.exports = authController;