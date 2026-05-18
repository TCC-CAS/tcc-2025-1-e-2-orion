const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const streakService = require("../services/streakService.js");
const notificationService = require("../services/notificationService.js");

const accountController = { 
    getProfile: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;

            const user = await db.collection('users').findOne(
                { _id: new ObjectId(userId) },
                { projection: { password: 0 } }
            );

            if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado',
                    status: 'ERROR'
                });
            }

            // --- REGENERATION LOGIC ---
            const MAX_LIVES = 5;
            const REGEN_INTERVAL = 10 * 60 * 1000; // 10 minutes
            let currentLives = user.profile?.lives ?? MAX_LIVES;

            if (currentLives < MAX_LIVES) {
                const now = new Date();
                let lastRegen = user.profile?.lastRegen ? new Date(user.profile.lastRegen) : null;

                if (!lastRegen) {
                    // If lives < 5 but no lastRegen, set it to now to start the cycle
                    lastRegen = now;
                    await db.collection('users').updateOne(
                        { _id: new ObjectId(userId) },
                        { $set: { "profile.lastRegen": now } }
                    );
                    user.profile.lastRegen = now;
                }

                const elapsed = now.getTime() - lastRegen.getTime();
                const livesToAdd = Math.floor(elapsed / REGEN_INTERVAL);

                if (livesToAdd > 0) {
                    const newLives = Math.min(MAX_LIVES, currentLives + livesToAdd);
                    const newLastRegen = newLives === MAX_LIVES ? null : new Date(lastRegen.getTime() + (livesToAdd * REGEN_INTERVAL));

                    await db.collection('users').updateOne(
                        { _id: new ObjectId(userId) },
                        { 
                            $set: { 
                                'profile.lives': newLives,
                                'profile.lastRegen': newLastRegen,
                                'updatedAt': new Date()
                            } 
                        }
                    );

                    // Update memory object for response
                    user.profile.lives = newLives;
                    user.profile.lastRegen = newLastRegen;
                }
            }
            // --------------------------
            
            // --- STREAK VALIDATION ---
            const validatedStreak = await streakService.validateStreak(userId, user);
            user.profile.streak = validatedStreak;
            // --------------------------

            // --- SUBSCRIPTION ---
            const subscription = await db.collection('subscriptions').findOne({ userId: new ObjectId(userId), status: 'ACTIVE' });
            if (subscription) {
                // Normalize legacy 'plan' field to 'planType' and ensure PRO name
                if (!subscription.planType && subscription.plan === 'ANNUAL') {
                    subscription.planType = 'PRO';
                } else if (subscription.planType === 'ANNUAL') {
                    subscription.planType = 'PRO';
                }
                user.subscription = subscription;
            } else {
                user.subscription = null;
            }
            // --------------------------

            return res.json({
                message: 'Perfil obtido com sucesso',
                status: 'OK',
                data: user
            });

        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            return res.status(500).json({
                message: 'Erro interno do servidor',
                status: 'ERROR'
            });
        }
    },

    deactivateAccount: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;

            const user = await db.collection('users').findOne(
                { _id: new ObjectId(userId) } 
            )

            if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado',
                    status: 'ERROR'
                });
            }

            const userDeactivated = await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                { $set: { isActive: false, deactivatedAt: new Date() } }
            );

            return res.json({
                message: "Conta deletada com sucesso",
                status: 'OK'
            });

        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message: 'Erro interno do servidor',
                status: 'ERROR'
            });
        }
    },

    updateAccount: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;

            const updates = req.body;

            if (!updates || Object.keys(updates).length === 0) {
                return res.status(400).json({
                    message: 'Nenhum dado fornecido para atualização',
                    status: 'ERROR'
                });
            }

            const ALLOWED_FIELDS = ['name', 'birthdate', 'avatarUrl'];

            const allowedUpdates = {};
            Object.keys(updates).forEach(field => {
                if (ALLOWED_FIELDS.includes(field)) {
                    allowedUpdates[field] = updates[field];
                }
            });

            if (Object.keys(allowedUpdates).length === 0) {
                return res.status(400).json({
                    message: 'Nenhum campo válido para atualização',
                    status: 'ERROR'
                });
            }

            if (allowedUpdates.name !== undefined) {
                const trimmed = (allowedUpdates.name || '').trim();
                if (trimmed.length < 3 || trimmed.length > 60 || !/^[A-Za-zÀ-ÿ\s'\-]+$/.test(trimmed)) {
                    return res.status(400).json({
                        message: 'O nome deve ter 3–60 caracteres e conter apenas letras, espaços e hifens',
                        status: 'ERROR'
                    });
                }
                allowedUpdates.name = trimmed;
            }

            if (allowedUpdates.birthdate) {
                const date = new Date(allowedUpdates.birthdate);
                if (isNaN(date.getTime())) {
                    return res.status(400).json({
                        message: 'Data de nascimento inválida',
                        status: 'ERROR'
                    });
                }
                allowedUpdates.birthdate = date;
            }

            allowedUpdates.updatedAt = new Date();

            const user = await db.collection('users').findOne(
                { _id: new ObjectId(userId) } 
            )

            if (!user) {
                return res.status(404).json({
                    message: 'Usuário não encontrado',
                    status: 'ERROR'
                });
            }

            const result = await db.collection('users').updateOne(
                { _id: new ObjectId(userId)},
                { $set: allowedUpdates }
            );

            if (result.modifiedCount === 0) {
                return res.status(400).json({
                    message: 'Nenhuma alteração realizada',
                    status: 'ERROR'
                })
            }

            const updatedUser = await db.collection('users').findOne(
                { _id: new ObjectId(userId) },
                { projection: { password: 0 } }
            );

            return res.json({
                message: 'Conta atualizada com sucesso',
                status: 'OK',
                data: updatedUser
            });
            
        } catch (error) {
            console.error(error)
            return res.status(500).json({
                message: 'Erro interno do servidor',
                status: 'ERROR'
            });
        }
    },

    subtractLife: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);

            // Check if user is PRO first
            const subscription = await db.collection('subscriptions').findOne({ userId, status: 'ACTIVE' });
            if (subscription) {
                return res.json({
                    message: 'Usuário PRO tem vidas infinitas!',
                    status: 'OK',
                    lives: 5 // Returns full lives as representation of infinite
                });
            }

            const user = await db.collection('users').findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });
            }

            const currentLives = user.profile?.lives ?? 5;
            if (currentLives <= 0) {
                return res.status(400).json({ message: 'Sem vidas restantes', status: 'ERROR', lives: 0 });
            }

            const newLives = currentLives - 1;
            const update = {
                $set: { "profile.lives": newLives, "updatedAt": new Date() }
            };

            // If we just dropped below 5, start the regen timer
            if (currentLives === 5) {
                update.$set["profile.lastRegen"] = new Date();
            }

            await db.collection('users').updateOne({ _id: new ObjectId(userId) }, update);

            return res.json({
                message: 'Vida subtraída',
                status: 'OK',
                lives: newLives
            });
        } catch (error) {
            console.error('Erro ao subtrair vida:', error);
            return res.status(500).json({ message: 'Erro interno do servidor', status: 'ERROR' });
        }
    },

    getStatistics: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const user = await db.collection('users').findOne({ _id: userId });

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });
            }

            const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : "Desconhecido";

            const progressList = await db.collection("user_lesson_progress").find({ userId, status: "COMPLETED" }).toArray();
            const lessonsCompleted = progressList.length;

            const daysMap = { 0: 'DOM', 1: 'SEG', 2: 'TER', 3: 'QUA', 4: 'QUI', 5: 'SEX', 6: 'SAB' };
            const weeklyLessonsCounts = { 'DOM': 0, 'SEG': 0, 'TER': 0, 'QUA': 0, 'QUI': 0, 'SEX': 0, 'SAB': 0 };
            
            const now = new Date();
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);

            let xpWeekly = 0;

            progressList.forEach(p => {
                if (p.completedAt) {
                    const compDate = new Date(p.completedAt);
                    if (compDate >= oneWeekAgo) {
                        const day = daysMap[compDate.getDay()];
                        weeklyLessonsCounts[day]++;
                        xpWeekly += 50;
                    }
                }
            });

            const attempts = await db.collection("user_quiz_attempts").find({ userId }).toArray();
            
            attempts.forEach(a => {
                if (a.attemptedAt) {
                    const attDate = new Date(a.attemptedAt);
                    if (attDate >= oneWeekAgo && a.passed) {
                        xpWeekly += a.score || 0;
                    }
                }
            });

            let bestModuleId = null;
            let toughestModuleId = null;

            if (attempts.length > 0) {
                const moduleStats = {};
                attempts.forEach(a => {
                    const mId = a.moduleId ? a.moduleId.toString() : 'unknown';
                    if (!moduleStats[mId]) {
                        moduleStats[mId] = { totalScore: 0, count: 0, attemptsCount: 0 };
                    }
                    moduleStats[mId].totalScore += (a.score || 0);
                    moduleStats[mId].count++;
                    moduleStats[mId].attemptsCount++;
                });

                let bestAvg = -1;
                let maxAttempts = -1;
                
                for (const [mId, stats] of Object.entries(moduleStats)) {
                    if (mId !== 'unknown') {
                        const avg = stats.totalScore / stats.count;
                        if (avg > bestAvg) { bestAvg = avg; bestModuleId = mId; }
                        if (stats.attemptsCount > maxAttempts) { maxAttempts = stats.attemptsCount; toughestModuleId = mId; }
                    }
                }
            }

            const trails = await db.collection("content_trails").find({}).toArray();
            
            let bestPerformanceName = "N/A";
            let toughestModuleName = "N/A";
            let suggestedLessonInfo = { title: "Nenhuma lição sugerida", link: "/learning" };

            let allModulesList = [];
            trails.forEach(t => { 
                if (t.modulos) { 
                    t.modulos.forEach(m => {
                        if (m?.isActive === false) return;
                        allModulesList.push({ trail: t, module: m });
                    });
                } 
            });

            if (bestModuleId) {
                const m = allModulesList.find(x => x.module._id.toString() === bestModuleId);
                if (m) bestPerformanceName = m.module.titulo;
            }
            if (toughestModuleId) {
                const m = allModulesList.find(x => x.module._id.toString() === toughestModuleId);
                if (m) toughestModuleName = m.module.titulo;
            }

            const completedLessonIds = progressList.map(p => p.lessonId.toString());
            let foundSuggested = false;
            for (const item of allModulesList) {
                if (item.module.licoes && !foundSuggested) {
                    for (const licao of item.module.licoes) {
                        if (!completedLessonIds.includes(licao._id.toString())) {
                            suggestedLessonInfo = { 
                                title: licao.tituloLicao, 
                                link: `/learning` 
                            };
                            foundSuggested = true;
                            break;
                        }
                    }
                }
            }

            const weeklyLessonsArray = [
                { day: 'SEG', count: weeklyLessonsCounts['SEG'] },
                { day: 'TER', count: weeklyLessonsCounts['TER'] },
                { day: 'QUA', count: weeklyLessonsCounts['QUA'] },
                { day: 'QUI', count: weeklyLessonsCounts['QUI'] },
                { day: 'SEX', count: weeklyLessonsCounts['SEX'] },
                { day: 'SAB', count: weeklyLessonsCounts['SAB'] },
                { day: 'DOM', count: weeklyLessonsCounts['DOM'] },
            ];

            function getRank(xp) {
                if (xp < 1000) return "Iniciante";
                if (xp < 5000) return "Investidor Prata";
                if (xp < 10000) return "Investidor Ouro";
                return "Mestre Financeiro";
            }

            const statsData = {
                suggestedLesson: suggestedLessonInfo,
                weeklyLessons: weeklyLessonsArray,
                accountDetails: {
                    memberSince: memberSince.charAt(0).toUpperCase() + memberSince.slice(1),
                    xpWeekly: xpWeekly,
                    lessonsCompleted: lessonsCompleted,
                    bestPerformance: bestPerformanceName,
                    toughestModule: toughestModuleName,
                    totalCoinsEarned: user.wallet?.coins || 0,
                    currentStreak: user.profile?.streak || 0,
                    rank: getRank(user.wallet?.xp || 0)
                }
            };

            return res.json({
                message: 'Estatísticas geradas',
                status: 'OK',
                data: statsData
            });
            
        } catch (error) {
            console.error('Erro getStatistics:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },



    getNotifications: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            
            const notifications = await db.collection("notifications")
                .find({ userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .toArray();

            return res.json({
                message: 'Notificações obtidas',
                status: 'OK',
                data: notifications
            });
        } catch (error) {
            console.error('Erro getNotifications:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    markNotificationsRead: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);

            await db.collection("notifications").updateMany(
                { userId, read: false },
                { $set: { read: true } }
            );

            return res.json({ message: 'Notificações lidas', status: 'OK' });
        } catch (error) {
            console.error('Erro ao ler notificações:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    updatePassword: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias', status: 'ERROR' });
            }

            const user = await db.collection('users').findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });
            }

            const bcrypt = require('bcrypt');
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(400).json({ message: 'Senha atual incorreta', status: 'ERROR' });
            }

            const authController = require('./authController.js');
            const passwordCheck = authController.validatePassword(newPassword);
            if (!passwordCheck.valid) {
                return res.status(400).json({ message: passwordCheck.message, status: 'ERROR' });
            }

            const hashed = await bcrypt.hash(newPassword, 10);
            await db.collection('users').updateOne({ _id: userId }, { $set: { password: hashed, updatedAt: new Date() } });

            return res.json({ message: 'Senha atualizada com sucesso', status: 'OK' });
        } catch (error) {
            console.error('Erro updatePassword:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    equipAvatar: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { avatarUrl } = req.body;

            if (!avatarUrl) {
                return res.status(400).json({ message: 'URL do avatar é obrigatória', status: 'ERROR' });
            }

            const user = await db.collection('users').findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });
            }

            // Check if item exists in inventory
            const inventory = user.inventory || [];
            const ownsItem = inventory.some(i => i.imageUrl === avatarUrl);
            
            if (!ownsItem) {
                return res.status(404).json({ message: 'Avatar não encontrado no inventário', status: 'ERROR' });
            }

            await db.collection('users').updateOne(
                { _id: userId },
                { $set: { "profile.avatarUrl": avatarUrl, "updatedAt": new Date() } }
            );

            return res.json({ message: 'Avatar equipado com sucesso', status: 'OK' });
        } catch (error) {
            console.error('Erro equipAvatar:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    abacatepayCheckout: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { plan } = req.body; // 'monthly' or 'annual'

            const user = await db.collection('users').findOne({ _id: userId });
            if (!user) return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });

            const price = plan === 'annual' ? 29900 : 2990;
            const name = plan === 'annual' ? "Plano Anual PRO" : "Plano Mensal PRO";
            const uniqueExternalId = "PRO-" + plan.toUpperCase() + "-" + Date.now();

            // Generate a one-time token stored server-side so set-premium can only
            // be activated with a token the server issued — prevents URL forgery.
            const crypto = require('crypto');
            const pendingToken = crypto.randomBytes(32).toString('hex');
            await db.collection('pending_checkouts').insertOne({
                userId,
                plan,
                token: pendingToken,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2h TTL
            });

            // 1. Criar Produto (Obrigatório na V2)
            const productResponse = await fetch('https://api.abacatepay.com/v2/products/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.ABACATEPAY_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    description: `Assinatura ${name} do Orion Finanças`,
                    price: price,
                    externalId: uniqueExternalId,
                    currency: 'BRL'
                })
            });

            const productData = await productResponse.json();

            if (!productData.success) {
                console.error("AbacatePay Product Error:", productData.error);
                return res.status(500).json({ message: 'Erro ao criar produto na AbacatePay', status: 'ERROR', details: productData.error });
            }

            const productId = productData.data.id;

            // 2. Criar Checkout (V2)
            const checkoutResponse = await fetch('https://api.abacatepay.com/v2/checkouts/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.ABACATEPAY_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: [
                        {
                            id: productId,
                            quantity: 1
                        }
                    ],
                    methods: ["PIX", "CARD"],
                    returnUrl: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/shop?success=true&plan=${plan}&checkoutToken=${pendingToken}`,
                    completionUrl: `${req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000'}/shop?success=true&plan=${plan}&checkoutToken=${pendingToken}`
                })
            });

            const checkoutData = await checkoutResponse.json();

            if (checkoutData.success && checkoutData.data && checkoutData.data.url) {
                return res.json({ status: 'OK', url: checkoutData.data.url });
            } else {
                console.error("AbacatePay Checkout Error:", checkoutData.error);
                return res.status(500).json({ message: 'Erro ao gerar checkout da AbacatePay', status: 'ERROR', details: checkoutData.error });
            }

        } catch (error) {
            console.error('Erro abacatepayCheckout:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    setPremium: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { plan, checkoutToken } = req.body;

            if (!checkoutToken) {
                return res.status(400).json({ message: 'Token de checkout ausente', status: 'ERROR' });
            }

            // Verify the token was issued by the server for this user and hasn't been used
            const pending = await db.collection('pending_checkouts').findOneAndDelete({
                userId,
                plan,
                token: checkoutToken,
                expiresAt: { $gt: new Date() }
            });

            if (!pending) {
                return res.status(400).json({ message: 'Token de checkout inválido ou expirado', status: 'ERROR' });
            }

            // Upsert an active subscription for this user
            const nextBillingDate = new Date();
            let planType = 'PRO';

            if (plan === 'monthly') {
                planType = 'MENSAL';
                nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
            } else {
                planType = 'PRO';
                nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
            }

            await db.collection('subscriptions').updateOne(
                { userId },
                { 
                    $set: { 
                        userId, 
                        status: 'ACTIVE', 
                        planType: planType,
                        nextBillingDate: nextBillingDate,
                        updatedAt: new Date() 
                    } 
                },
                { upsert: true }
            );

            await notificationService.createNotification(userId, "Sucesso no Upgrade!", "Sua assinatura PRO foi ativada. Agora você tem vidas infinitas e o dobro de recompensas!", "SUBSCRIPTION");

            return res.json({ message: 'Usuário agora é Premium!', status: 'OK' });
        } catch (error) {
            console.error('Erro setPremium:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    cancelSubscription: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);

            // CDC art. 49 — direito de arrependimento em compras online (7 dias)
            const subscription = await db.collection('subscriptions').findOne({ userId, status: 'ACTIVE' });
            if (!subscription) {
                return res.status(404).json({ message: 'Nenhuma assinatura ativa encontrada para cancelar.', status: 'ERROR' });
            }

            const activatedAt = subscription.activatedAt ? new Date(subscription.activatedAt) : null;
            const daysSinceActivation = activatedAt ? Math.floor((Date.now() - activatedAt.getTime()) / (1000 * 60 * 60 * 24)) : Infinity;
            const isWithinRefundWindow = daysSinceActivation <= 7;

            const finalStatus = isWithinRefundWindow ? 'REFUNDED' : 'CANCELED';
            const refundMessage = isWithinRefundWindow
                ? 'Cancelamento dentro do prazo de arrependimento (CDC art. 49). O reembolso será processado em até 7 dias úteis.'
                : 'Sua assinatura PRO foi cancelada com sucesso. Você ainda terá acesso aos benefícios até o final do período vigente.';

            await db.collection('subscriptions').updateOne(
                { _id: subscription._id },
                { $set: { status: finalStatus, canceledAt: new Date(), refundEligible: isWithinRefundWindow, updatedAt: new Date() } }
            );

            await notificationService.createNotification(userId, "Assinatura Cancelada", refundMessage, "SUBSCRIPTION");

            const auditService = require('../services/auditService');
            await auditService.log({
                action: isWithinRefundWindow ? 'SUBSCRIPTION_REFUND_REQUESTED' : 'SUBSCRIPTION_CANCELED',
                actorId: req.user.id,
                actorRole: 'user',
                targetId: subscription._id.toString(),
                metadata: { daysSinceActivation, refundEligible: isWithinRefundWindow }
            });

            return res.json({
                message: 'Assinatura cancelada com sucesso',
                status: 'OK',
                refundEligible: isWithinRefundWindow,
                daysSinceActivation
            });
        } catch (error) {
            console.error('Erro cancelSubscription:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    getAdminStats: async (req, res) => {
        try {
            const db = getDB();
            
            const users = await db.collection('users').find({}, { projection: { createdAt: 1, isActive: 1, deactivatedAt: 1 } }).toArray();
            
            const totalUsers = users.length;
            const activeUsers = users.filter(u => u.isActive !== false).length;
            const inativos = users.filter(u => u.isActive === false).length;
            
            const totalQuizzes = await db.collection('user_quiz_attempts').countDocuments();
            const totalSubscriptions = await db.collection('subscriptions').countDocuments({ status: 'ACTIVE' });

            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const historyData = [];
            
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const monthName = monthNames[d.getMonth()];
                const year = d.getFullYear();
                const month = d.getMonth();
                
                const newSignups = users.filter(u => {
                    if (!u.createdAt) return false;
                    const cDate = new Date(u.createdAt);
                    return cDate.getMonth() === month && cDate.getFullYear() === year;
                }).length;

                const activeInMonth = users.filter(u => {
                    if (!u.createdAt) return false;
                    const cDate = new Date(u.createdAt);
                    if (cDate.getFullYear() > year || (cDate.getFullYear() === year && cDate.getMonth() > month)) return false;
                    
                    if (u.isActive === false && u.deactivatedAt) {
                        const dDate = new Date(u.deactivatedAt);
                        if (dDate.getFullYear() < year || (dDate.getFullYear() === year && dDate.getMonth() <= month)) return false;
                    }
                    return true;
                }).length;

                historyData.push({
                    month: monthName,
                    activeUsers: activeInMonth,
                    newSignups: newSignups,
                    reactivated: 0
                });
            }

            const statusDistribution = [
              { name: 'Ativos', value: activeUsers, color: '#2dd4bf' },
              { name: 'Pendentes', value: 0, color: '#f59e0b' },
              { name: 'Inativos', value: inativos, color: '#ef4444' }
            ];

            return res.json({
                message: 'Estatísticas obtidas',
                status: 'OK',
                data: {
                    totalUsers,
                    activeUsers,
                    totalQuizzes,
                    totalSubscriptions,
                    historyData,
                    statusDistribution
                }
            });
        } catch (error) {
            console.error('Erro getAdminStats:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    getAdminActivity: async (req, res) => {
        try {
            const db = getDB();
            
            // Buscar as últimas 5 atividades de diferentes tipos
            const recentUsers = await db.collection('users')
                .find({}, { projection: { "profile.name": 1, createdAt: 1 } })
                .sort({ createdAt: -1 })
                .limit(3)
                .toArray();

            const recentQuizzes = await db.collection('user_quiz_attempts')
                .find({})
                .sort({ attemptedAt: -1 })
                .limit(3)
                .toArray();

            // Formatar para o padrão do frontend
            const activity = [
                ...recentUsers.map(u => ({
                    id: u._id,
                    title: 'Novo usuário cadastrado',
                    details: `${u.profile?.name || 'Usuário'} entrou na plataforma`,
                    date: u.createdAt,
                    type: 'info'
                })),
                ...recentQuizzes.map(q => ({
                    id: q._id,
                    title: 'Quiz finalizado',
                    details: `Um usuário completou um quiz com score ${q.score}`,
                    date: q.attemptedAt,
                    type: 'success'
                }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

            return res.json({
                message: 'Atividades obtidas',
                status: 'OK',
                data: activity
            });
        } catch (error) {
            console.error('Erro getAdminActivity:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    getSystemSettings: async (req, res) => {
        try {
            const db = getDB();
            let settings = await db.collection('settings').findOne({ type: 'global' });
            
            if (!settings) {
                // Configurações padrão caso não existam
                settings = {
                    type: 'global',
                    xpPerQuestion: 10,
                    coinsPerQuestion: 5,
                    minPassingScore: 70,
                    updatedAt: new Date()
                };
                await db.collection('settings').insertOne(settings);
            }

            return res.json({ status: 'OK', data: settings });
        } catch (error) {
            console.error('Erro getSystemSettings:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    updateSystemSettings: async (req, res) => {
        try {
            const db = getDB();
            const { xpPerQuestion, coinsPerQuestion, minPassingScore } = req.body;

            await db.collection('settings').updateOne(
                { type: 'global' },
                { 
                    $set: { 
                        xpPerQuestion: Number(xpPerQuestion),
                        coinsPerQuestion: Number(coinsPerQuestion),
                        minPassingScore: Number(minPassingScore),
                        updatedAt: new Date()
                    } 
                },
                { upsert: true }
            );

            return res.json({ message: 'Configurações atualizadas com sucesso', status: 'OK' });
        } catch (error) {
            console.error('Erro updateSystemSettings:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    // LGPD: Exportar dados pessoais do usuário em PDF
    exportUserData: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);

            const [user, transactions, goals, subscriptions, notifications] = await Promise.all([
                db.collection('users').findOne({ _id: userId }, { projection: { password: 0, resetToken: 0, resetTokenExpires: 0 } }),
                db.collection('transactions').find({ userId }).sort({ date: -1 }).limit(200).toArray(),
                db.collection('user_financial_goals').find({ userId }).toArray(),
                db.collection('subscriptions').find({ userId }).sort({ activatedAt: -1 }).toArray(),
                db.collection('notifications').find({ userId }).sort({ createdAt: -1 }).limit(50).toArray()
            ]);

            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });
            }

            const auditService = require('../services/auditService');
            await auditService.log({
                action: 'LGPD_DATA_EXPORT',
                actorId: req.user.id,
                actorRole: 'user',
                metadata: { ip: req.ip }
            });

            const PDFDocument = require('pdfkit');
            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="orion-meus-dados-${Date.now()}.pdf"`);
            doc.pipe(res);

            const BR_DATE = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';
            const BRL = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // Header
            doc.fontSize(22).font('Helvetica-Bold').text('Órion Finanças — Exportação de Dados', { align: 'center' });
            doc.fontSize(10).font('Helvetica').fillColor('#555')
               .text(`Gerado em ${new Date().toLocaleString('pt-BR')} (LGPD)`, { align: 'center' });
            doc.moveDown(1.5);

            // Perfil
            doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('1. Perfil');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ccc');
            doc.moveDown(0.3);
            doc.fontSize(10).font('Helvetica');
            const profileRows = [
                ['Nome', user.name || '—'],
                ['Email', user.email || '—'],
                ['Data de nascimento', BR_DATE(user.birthdate)],
                ['Membro desde', BR_DATE(user.createdAt)],
                ['Plano', user.isPremium ? 'PRO' : 'Gratuito'],
                ['XP total', String(user.wallet?.xp || 0)],
                ['Moedas', String(user.wallet?.coins || 0)],
                ['Nível', String(user.profile?.level || 1)],
                ['Sequência atual', String(user.profile?.streak || 0) + ' dias'],
            ];
            profileRows.forEach(([label, value]) => {
                doc.font('Helvetica-Bold').text(`${label}: `, { continued: true }).font('Helvetica').text(value);
            });
            doc.moveDown(1);

            // Assinaturas
            doc.fontSize(14).font('Helvetica-Bold').text('2. Assinaturas');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ccc');
            doc.moveDown(0.3);
            doc.fontSize(10).font('Helvetica');
            if (subscriptions.length === 0) {
                doc.text('Nenhuma assinatura registrada.');
            } else {
                subscriptions.forEach((s, i) => {
                    doc.font('Helvetica-Bold').text(`Assinatura ${i + 1}:`);
                    doc.font('Helvetica').text(`  Plano: ${s.planType || s.plan || '—'}`);
                    doc.text(`  Status: ${s.status || '—'}`);
                    doc.text(`  Ativada em: ${BR_DATE(s.activatedAt)}`);
                    doc.text(`  Expira em: ${BR_DATE(s.expiresAt)}`);
                    doc.moveDown(0.3);
                });
            }
            doc.moveDown(0.5);

            // Transações
            doc.fontSize(14).font('Helvetica-Bold').text('3. Transações Financeiras');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ccc');
            doc.moveDown(0.3);
            doc.fontSize(10).font('Helvetica');
            if (transactions.length === 0) {
                doc.text('Nenhuma transação registrada.');
            } else {
                const colX = [50, 200, 300, 420];
                doc.font('Helvetica-Bold');
                doc.text('Data', colX[0], doc.y, { width: 140, continued: true });
                doc.text('Descrição', colX[1] - doc.x + colX[1], doc.y, { width: 95, continued: true });
                doc.text('Tipo', { width: 115, continued: true });
                doc.text('Valor');
                doc.font('Helvetica');
                transactions.slice(0, 100).forEach(tx => {
                    const y = doc.y;
                    if (y > 750) { doc.addPage(); }
                    const desc = (tx.title || tx.description || '—').substring(0, 30);
                    doc.text(BR_DATE(tx.date), colX[0], doc.y, { width: 140, continued: true });
                    doc.text(desc, { width: 95, continued: true });
                    doc.text(tx.type === 'income' ? 'Receita' : 'Despesa', { width: 115, continued: true });
                    doc.fillColor(tx.type === 'income' ? '#16a34a' : '#dc2626').text(BRL(tx.amount)).fillColor('#000');
                });
                if (transactions.length > 100) {
                    doc.font('Helvetica').fillColor('#555').text(`… e mais ${transactions.length - 100} transação(ões) não exibidas.`).fillColor('#000');
                }
            }
            doc.moveDown(0.5);

            // Metas
            doc.addPage();
            doc.fontSize(14).font('Helvetica-Bold').text('4. Metas Financeiras');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ccc');
            doc.moveDown(0.3);
            doc.fontSize(10).font('Helvetica');
            if (goals.length === 0) {
                doc.text('Nenhuma meta registrada.');
            } else {
                goals.forEach((g, i) => {
                    doc.font('Helvetica-Bold').text(`Meta ${i + 1}: ${g.title || '—'}`);
                    doc.font('Helvetica').text(`  Objetivo: ${BRL(g.targetAmount)}`);
                    doc.text(`  Acumulado: ${BRL(g.currentAmount)}`);
                    doc.text(`  Prazo: ${BR_DATE(g.deadline)}`);
                    doc.text(`  Status: ${g.status || '—'}`);
                    doc.moveDown(0.3);
                });
            }
            doc.moveDown(0.5);

            // Notificações recentes
            doc.fontSize(14).font('Helvetica-Bold').text('5. Notificações Recentes');
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ccc');
            doc.moveDown(0.3);
            doc.fontSize(10).font('Helvetica');
            if (notifications.length === 0) {
                doc.text('Nenhuma notificação.');
            } else {
                notifications.forEach(n => {
                    if (doc.y > 750) doc.addPage();
                    doc.font('Helvetica-Bold').text(n.title || '—', { continued: true })
                       .font('Helvetica').fillColor('#555').text(`  (${BR_DATE(n.createdAt)})`).fillColor('#000');
                    if (n.message) doc.text(`  ${n.message}`);
                    doc.moveDown(0.2);
                });
            }

            // Footer
            doc.fontSize(8).fillColor('#aaa')
               .text('Este documento foi gerado automaticamente pela plataforma Órion Finanças em conformidade com a LGPD (Lei 13.709/2018).', 50, 780, { align: 'center', width: 495 });

            doc.end();
        } catch (error) {
            console.error('Erro exportUserData:', error);
            if (!res.headersSent) {
                return res.status(500).json({ message: 'Erro ao exportar dados', status: 'ERROR' });
            }
        }
    },

    // LGPD: Exclusão permanente / anonimização da conta
    permanentDeleteAccount: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { currentPassword } = req.body;

            const user = await db.collection('users').findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });
            }

            if (!currentPassword) {
                return res.status(400).json({ message: 'Senha atual é obrigatória para excluir a conta', status: 'ERROR' });
            }

            const bcryptLib = require('bcrypt');
            const isValid = await bcryptLib.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(400).json({ message: 'Senha incorreta', status: 'ERROR' });
            }

            // Anonimização: ofusca PII e marca como excluída.
            const anonId = `deleted-${userId.toString().slice(-6)}-${Date.now()}`;
            await db.collection('users').updateOne(
                { _id: userId },
                {
                    $set: {
                        name: 'Usuário Excluído',
                        email: `${anonId}@deleted.local`,
                        password: 'DELETED',
                        birthdate: null,
                        isActive: false,
                        deletedAt: new Date(),
                        profile: { level: 0, points: 0, avatarUrl: '', lives: 0, streak: 0, lastActivity: null },
                        wallet: { coins: 0, xp: 0, balance: 0 },
                        inventory: [],
                        equippedAvatar: ''
                    },
                    $unset: { resetToken: '', resetTokenExpires: '' }
                }
            );

            // Remove dados pessoais relacionados (transações, metas, notificações).
            // Progressões e tentativas ficam para integridade estatística da plataforma,
            // mas perdem a identificação por estar atrelada ao userId anonimizado.
            await Promise.all([
                db.collection('transactions').deleteMany({ userId }),
                db.collection('user_financial_goals').deleteMany({ userId }),
                db.collection('notifications').deleteMany({ userId })
            ]);

            const auditService = require('../services/auditService');
            await auditService.log({
                action: 'LGPD_ACCOUNT_PERMANENT_DELETE',
                actorId: req.user.id,
                actorRole: 'user',
                metadata: { ip: req.ip }
            });

            res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
            return res.json({ message: 'Conta excluída permanentemente. Seus dados pessoais foram anonimizados.', status: 'OK' });
        } catch (error) {
            console.error('Erro permanentDeleteAccount:', error);
            return res.status(500).json({ message: 'Erro ao excluir conta', status: 'ERROR' });
        }
    }
};

module.exports = accountController;
