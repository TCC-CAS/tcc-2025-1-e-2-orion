const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const missionService = require("../services/missionService.js");
const rewardService = require("../services/rewardService.js");
const streakService = require("../services/streakService.js");

const parseRequiredObjectId = (value, fieldName) => {
    if (!value) {
        throw new Error(`${fieldName} é obrigatório`);
    }

    if (!ObjectId.isValid(value)) {
        throw new Error(`${fieldName} inválido`);
    }

    return new ObjectId(value);
};

const parseOptionalObjectId = (value, fieldName) => {
    if (!value) return null;

    if (!ObjectId.isValid(value)) {
        throw new Error(`${fieldName} inválido`);
    }

    return new ObjectId(value);
};

const getLessonContext = async (db, lessonObjectId) => {
    const trail = await db.collection("content_trails").findOne(
        { "modulos.licoes._id": lessonObjectId },
        { projection: { modulos: 1 } }
    );

    if (!trail) return null;

    const modulos = Array.isArray(trail.modulos) ? trail.modulos : [];
    for (const modulo of modulos) {
        const licoes = Array.isArray(modulo?.licoes) ? modulo.licoes : [];
        const hasLesson = licoes.some((licao) => licao?._id?.toString() === lessonObjectId.toString());

        if (hasLesson) {
            return {
                trailId: trail._id || null,
                moduleId: modulo?._id || null,
                moduleIsActive: modulo?.isActive !== false
            };
        }
    }

    return null;
};

const lessonsController = {
    // User: Mark lesson as complete
    completeLesson: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;
            const { lessonId, moduleId, trailId } = req.body;

            let lessonObjectId = null;
            let moduleObjectId = null;
            let trailObjectId = null;
            try {
                lessonObjectId = parseRequiredObjectId(lessonId, "lessonId");
                moduleObjectId = parseOptionalObjectId(moduleId, "moduleId");
                trailObjectId = parseOptionalObjectId(trailId, "trailId");
            } catch (validationError) {
                return res.status(400).json({
                    message: validationError.message,
                    status: "ERROR"
                });
            }

            const lessonContext = await getLessonContext(db, lessonObjectId);
            if (!lessonContext) {
                return res.status(404).json({
                    message: "Aula não encontrada",
                    status: "ERROR"
                });
            }

            if (!lessonContext.trailId || !lessonContext.moduleId) {
                return res.status(500).json({
                    message: "Dados da trilha estão inconsistentes para esta aula",
                    status: "ERROR"
                });
            }

            if (!lessonContext.moduleIsActive) {
                return res.status(403).json({
                    message: "Esta aula está desativada no momento",
                    status: "ERROR"
                });
            }

            if (moduleObjectId && moduleObjectId.toString() !== lessonContext.moduleId.toString()) {
                return res.status(400).json({
                    message: "moduleId não corresponde à aula informada",
                    status: "ERROR"
                });
            }

            if (trailObjectId && trailObjectId.toString() !== lessonContext.trailId.toString()) {
                return res.status(400).json({
                    message: "trailId não corresponde à aula informada",
                    status: "ERROR"
                });
            }

            // Save progress
            const progressCollection = db.collection("user_lesson_progress");
            
            // Check if already completed
            const existingProgress = await progressCollection.findOne({
                userId: new ObjectId(userId), 
                lessonId: lessonObjectId,
                status: "COMPLETED"
            });
            const isAlreadyCompleted = !!existingProgress;

            await progressCollection.updateOne(
                { 
                    userId: new ObjectId(userId), 
                    lessonId: lessonObjectId 
                },
                { 
                    $set: { 
                        moduleId: lessonContext.moduleId,
                        trailId: lessonContext.trailId,
                        completedAt: new Date(),
                        status: "COMPLETED"
                    } 
                },
                { upsert: true }
            );

            // Trigger mission progress
            await missionService.updateProgress(userId, "COMPLETE_LESSON");

            // Award rewards: base (+50 XP, +15 Coins) or reduced (+5 XP, +5 Coins) if already completed
            let rewardAmount = isAlreadyCompleted ? { xp: 5, coins: 5 } : { xp: 50, coins: 15 };

            // Double rewards for PRO users
            const subscription = await db.collection('subscriptions').findOne({ userId: new ObjectId(userId), status: 'ACTIVE' });
            if (subscription) {
                rewardAmount = { xp: rewardAmount.xp * 2, coins: rewardAmount.coins * 2 };
            }

            const rewards = await rewardService.grantRewards(userId, rewardAmount);

            // Update streak
            const streakData = await streakService.updateStreak(userId);

            return res.json({
                message: "Aula marcada como concluída",
                status: "OK",
                rewards,
                streakUpdated: streakData?.updated
            });
        } catch (error) {
            console.error("Erro ao completar aula:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    },

    // User: Get lesson progress
    getLessonProgress: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;
            
            const progress = await db.collection("user_lesson_progress")
                .find({ userId: new ObjectId(userId) })
                .toArray();

            return res.json({
                message: "Progresso obtido com sucesso",
                status: "OK",
                data: progress
            });
        } catch (error) {
            console.error("Erro ao obter progresso:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    },

    // User: Submit a review for a module
    submitReview: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;
            const { moduleId, rating, comment } = req.body;

            if (!moduleId || rating === undefined) {
                return res.status(400).json({
                    message: "ID do módulo e avaliação são obrigatórios",
                    status: "ERROR"
                });
            }

            const reviewsCollection = db.collection("content_reviews");

            await reviewsCollection.insertOne({
                userId: new ObjectId(userId),
                moduleId: new ObjectId(moduleId),
                rating: Number(rating),
                comment: comment || "",
                createdAt: new Date()
            });

            return res.json({
                message: "Avaliação enviada com sucesso",
                status: "OK"
            });
        } catch (error) {
            console.error("Erro ao enviar avaliação:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    },

    // Admin: Get all reviews
    getAllReviews: async (req, res) => {
        try {
            const db = getDB();
            
            const reviews = await db.collection("content_reviews").aggregate([
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: { path: "$user", preserveNullAndEmptyArrays: true }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ]).toArray();

            const formattedReviews = reviews.map(r => ({
                id: r._id,
                userName: r.user ? r.user.name : "Usuário Desconhecido",
                subject: `Avaliação (${r.rating} estrelas)`,
                message: r.comment || `Usuário deixou a nota de ${r.rating} estrelas sem comentário adicional.`,
                sentAt: new Date(r.createdAt).toLocaleString('pt-BR'),
                rating: r.rating
            }));

            return res.json({
                message: "Avaliações obtidas com sucesso",
                status: "OK",
                data: formattedReviews
            });
        } catch (error) {
            console.error("Erro ao obter avaliações:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    }
};

module.exports = lessonsController;
