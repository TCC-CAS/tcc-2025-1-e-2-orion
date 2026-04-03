const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const streakService = require("../services/streakService.js");

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

            userDeactivated = await db.collection('users').updateOne(
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

            const forbiddenFields = ['_id', 'password', 'email', 'createdAt'];

            const allowedUpdates = {};
            Object.keys(updates).forEach(field => {
                if (!forbiddenFields.includes(field)) {
                    allowedUpdates[field] = updates[field];
                }
            });

            if (Object.keys(allowedUpdates).length === 0) {
                return res.status(400).json({
                    message: 'Nenhum campo válido para atualização',
                    status: 'ERROR'
                });
            }

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

            if (result.modifiedcount === 0) {
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

            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'Nova senha deve ter no mínimo 6 caracteres', status: 'ERROR' });
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

    setPremium: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);

            // Upsert an active subscription for this user
            const nextYear = new Date();
            nextYear.setFullYear(nextYear.getFullYear() + 1);

            await db.collection('subscriptions').updateOne(
                { userId },
                { 
                    $set: { 
                        userId, 
                        status: 'ACTIVE', 
                        planType: 'PRO',
                        nextBillingDate: nextYear,
                        updatedAt: new Date() 
                    } 
                },
                { upsert: true }
            );

            return res.json({ message: 'Usuário agora é Premium!', status: 'OK' });
        } catch (error) {
            console.error('Erro setPremium:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    }
};

module.exports = accountController;
