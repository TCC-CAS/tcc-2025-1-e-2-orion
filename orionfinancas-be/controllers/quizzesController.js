const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const missionService = require("../services/missionService.js");
const rewardService = require("../services/rewardService.js");
const streakService = require("../services/streakService.js");
const adminQuizzesService = require("../services/adminQuizzesService.js");

const getActiveLessonIdSet = async (db) => {
    const trails = await db.collection("content_trails").find(
        {},
        { projection: { modulos: 1 } }
    ).toArray();

    const activeLessonIdSet = new Set();

    trails.forEach((trail) => {
        const modulos = Array.isArray(trail.modulos) ? trail.modulos : [];

        modulos.forEach((modulo) => {
            if (modulo?.isActive === false) return;

            const lessons = Array.isArray(modulo.licoes) ? modulo.licoes : [];
            lessons.forEach((lesson) => {
                if (lesson?._id) {
                    activeLessonIdSet.add(lesson._id.toString());
                }
            });
        });
    });

    return activeLessonIdSet;
};

const parseOptionalObjectId = (value, fieldName) => {
    if (!value) return null;

    if (!ObjectId.isValid(value)) {
        throw new Error(`${fieldName} inválido`);
    }

    return new ObjectId(value);
};

const quizzesController = {
    // Admin: List modules + quizzes for management
    getAdminCatalog: async (req, res) => {
        try {
            const data = await adminQuizzesService.getAdminCatalog();
            return res.json({
                message: "Catálogo administrativo obtido com sucesso",
                status: "OK",
                data
            });
        } catch (error) {
            console.error("Erro ao obter catálogo admin de quizzes:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    },

    // Admin: Activate/deactivate a trail and cascade to modules/quizzes
    updateTrailStatus: async (req, res) => {
        try {
            const { trailId } = req.params;
            const { isActive } = req.body;

            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    message: "isActive deve ser booleano",
                    status: "ERROR"
                });
            }

            const result = await adminQuizzesService.updateTrailStatus({
                trailId,
                isActive
            });

            return res.json({
                message: `Trilha ${result.isActive ? "ativada" : "desativada"} com sucesso`,
                status: "OK",
                data: result
            });
        } catch (error) {
            console.error("Erro ao atualizar status da trilha:", error);

            const message = error.message || "Erro interno do servidor";
            const statusCode = message.includes("não encontrada") ? 404 : 400;

            return res.status(statusCode).json({
                message,
                status: "ERROR"
            });
        }
    },

    // Admin: Activate/deactivate a module for all users
    updateModuleStatus: async (req, res) => {
        try {
            const { moduleId } = req.params;
            const { trailId, isActive } = req.body;

            if (!trailId) {
                return res.status(400).json({
                    message: "trailId é obrigatório",
                    status: "ERROR"
                });
            }

            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    message: "isActive deve ser booleano",
                    status: "ERROR"
                });
            }

            const result = await adminQuizzesService.updateModuleStatus({
                trailId,
                moduleId,
                isActive
            });

            return res.json({
                message: `Módulo ${result.isActive ? "ativado" : "desativado"} com sucesso`,
                status: "OK",
                data: result
            });
        } catch (error) {
            console.error("Erro ao atualizar status do módulo:", error);

            const message = error.message || "Erro interno do servidor";
            const statusCode = message.includes("não encontrado") ? 404 : 400;

            return res.status(statusCode).json({
                message,
                status: "ERROR"
            });
        }
    },

    // Admin: Activate/deactivate a quiz
    updateQuizStatus: async (req, res) => {
        try {
            const { quizId } = req.params;
            const { isActive } = req.body;

            if (typeof isActive !== "boolean") {
                return res.status(400).json({
                    message: "isActive deve ser booleano",
                    status: "ERROR"
                });
            }

            const result = await adminQuizzesService.updateQuizStatus({
                quizId,
                isActive
            });

            return res.json({
                message: `Quiz ${result.isActive ? "ativado" : "desativado"} com sucesso`,
                status: "OK",
                data: result
            });
        } catch (error) {
            console.error("Erro ao atualizar status do quiz:", error);

            const message = error.message || "Erro interno do servidor";
            const statusCode = message.includes("não encontrado") ? 404 : 400;

            return res.status(statusCode).json({
                message,
                status: "ERROR"
            });
        }
    },

    // Admin/User: List all quizzes
    getAllQuizzes: async (req, res) => {
        try {
            const db = getDB();
            const activeLessonIdSet = await getActiveLessonIdSet(db);

            if (activeLessonIdSet.size === 0) {
                return res.json({
                    message: "Quizzes obtidos com sucesso",
                    status: "OK",
                    data: []
                });
            }

            const quizzes = await db.collection("quizzes").find({
                isActive: { $ne: false }
            }).toArray();

            const availableQuizzes = quizzes.filter((quiz) => (
                quiz?.lessonId && activeLessonIdSet.has(quiz.lessonId.toString())
            ));

            return res.json({
                message: "Quizzes obtidos com sucesso",
                status: "OK",
                data: availableQuizzes
            });
        } catch (error) {
            console.error("Erro ao obter quizzes:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    },

    // User: Get single quiz
    getQuizById: async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: "ID do quiz inválido", status: "ERROR" });
            }

            const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(id) });
            
            if (!quiz) {
                return res.status(404).json({ message: "Quiz não encontrado", status: "ERROR" });
            }

            const activeLessonIdSet = await getActiveLessonIdSet(db);
            const isQuizAvailable = quiz.isActive !== false
                && quiz?.lessonId
                && activeLessonIdSet.has(quiz.lessonId.toString());

            if (!isQuizAvailable) {
                return res.status(403).json({
                    message: "Quiz indisponível no momento",
                    status: "ERROR"
                });
            }

            return res.json({
                message: "Quiz obtido com sucesso",
                status: "OK",
                data: quiz
            });
        } catch (error) {
            console.error("Erro ao obter quiz:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    },

    // User: Complete a quiz
    completeQuiz: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;
            const { quizId, score, answers, lessonId, moduleId, trailId } = req.body;

            if (!quizId || score === undefined) {
                return res.status(400).json({
                    message: "Dados incompletos",
                    status: "ERROR"
                });
            }

            if (!ObjectId.isValid(quizId)) {
                return res.status(400).json({
                    message: "ID do quiz inválido",
                    status: "ERROR"
                });
            }

            const scoreValue = Number(score);
            if (!Number.isFinite(scoreValue) || scoreValue < 0) {
                return res.status(400).json({
                    message: "Score inválido",
                    status: "ERROR"
                });
            }

            let lessonObjectId = null;
            let moduleObjectId = null;
            let trailObjectId = null;
            try {
                lessonObjectId = parseOptionalObjectId(lessonId, "lessonId");
                moduleObjectId = parseOptionalObjectId(moduleId, "moduleId");
                trailObjectId = parseOptionalObjectId(trailId, "trailId");
            } catch (validationError) {
                return res.status(400).json({
                    message: validationError.message,
                    status: "ERROR"
                });
            }

            // Fetch quiz to check total questions
            const quiz = await db.collection("quizzes").findOne({ _id: new ObjectId(quizId) });
            if (!quiz) {
                return res.status(404).json({ message: "Quiz não encontrado", status: "ERROR" });
            }

            const activeLessonIdSet = await getActiveLessonIdSet(db);
            const isQuizAvailable = quiz.isActive !== false
                && quiz?.lessonId
                && activeLessonIdSet.has(quiz.lessonId.toString());

            if (!isQuizAvailable) {
                return res.status(403).json({
                    message: "Este quiz está desativado no momento",
                    status: "ERROR"
                });
            }

            const totalQuestions = quiz.questions.length;
            const normalizedScore = scoreValue > totalQuestions
                ? (scoreValue / 100) * totalQuestions
                : scoreValue;
            const passed = normalizedScore >= (totalQuestions * 0.7); // 70% to pass

            // Check if already passed in the past
            const previousPass = await db.collection("user_quiz_attempts").findOne({
                 userId: new ObjectId(userId),
                 quizId: new ObjectId(quizId),
                 passed: true
            });
            const isAlreadyPassed = !!previousPass;

            await db.collection("user_quiz_attempts").insertOne({
                userId: new ObjectId(userId),
                quizId: new ObjectId(quizId),
                lessonId: lessonObjectId,
                moduleId: moduleObjectId,
                trailId: trailObjectId,
                score: scoreValue,
                answers: answers || [],
                passed,
                attemptedAt: new Date()
            });

            // Trigger mission progress if it's a perfect quiz (100%)
            if (normalizedScore >= totalQuestions) {
                await missionService.updateProgress(userId, "PERFECT_QUIZ");
            }

            // Trigger generic quiz completion
            await missionService.updateProgress(userId, "COMPLETE_QUIZ");

            // Award base rewards (+30 XP, +10 Coins) or reduced if already passed (+5 XP, +5 Coins)
            let rewards = null;
            let streakUpdated = false;
            if (passed) {
                let rewardAmount = isAlreadyPassed ? { xp: 5, coins: 5 } : { xp: 30, coins: 10 };
                
                // Double rewards for PRO users
                const subscription = await db.collection('subscriptions').findOne({ userId: new ObjectId(userId), status: 'ACTIVE' });
                if (subscription) {
                    rewardAmount = { xp: rewardAmount.xp * 2, coins: rewardAmount.coins * 2 };
                }

                rewards = await rewardService.grantRewards(userId, rewardAmount);
                // Update streak
                const streakData = await streakService.updateStreak(userId);
                streakUpdated = streakData?.updated || false;
            }

            return res.json({
                message: "Quiz completado com sucesso",
                status: "OK",
                passed,
                rewards,
                streakUpdated
            });
        } catch (error) {
            console.error("Erro ao completar quiz:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    }
};

module.exports = quizzesController;
