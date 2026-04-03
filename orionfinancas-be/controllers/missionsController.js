const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const missionService = require("../services/missionService.js");

const COLLECTION_NAME = "missions";

const missionsController = {
    // Admin: Create a new mission
    createMission: async (req, res) => {
        try {
            const db = getDB();
            const { title, description, frequency, targetCount, reward, actionTrigger } = req.body;

            if (!title || !description || !frequency || !targetCount || !reward || !actionTrigger) {
                return res.status(400).json({
                    message: "Dados obrigatórios não preenchidos",
                    status: "ERROR"
                });
            }

            const payload = {
                title,
                description,
                frequency,
                targetCount: parseInt(targetCount),
                reward: {
                    xp: parseInt(reward.xp || 0),
                    coins: parseInt(reward.coins || 0)
                },
                actionTrigger,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await db.collection(COLLECTION_NAME).insertOne(payload);

            return res.status(201).json({
                message: "Missão criada com sucesso",
                status: "OK",
                data: { _id: result.insertedId, ...payload }
            });
        } catch (error) {
            console.error("Erro ao criar missão:", error);
            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            });
        }
    },

    // Admin/User: Get all missions
    getAllMissions: async (req, res) => {
        try {
            const db = getDB();
            const missions = await db.collection(COLLECTION_NAME).find().toArray();

            return res.json({
                message: "Missões obtidas com sucesso",
                status: "OK",
                data: missions
            });
        } catch (error) {
            console.error("Erro ao obter missões:", error);
            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            });
        }
    },

    // Admin: Update a mission
    updateMission: async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const updates = req.body;

            if (!id || !updates || Object.keys(updates).length === 0) {
                return res.status(400).json({
                    message: "ID e dados de atualização são obrigatórios",
                    status: "ERROR"
                });
            }

            const forbiddenFields = ["_id", "createdAt"];
            const allowedUpdates = {};
            Object.keys(updates).forEach(field => {
                if (!forbiddenFields.includes(field)) {
                    allowedUpdates[field] = updates[field];
                }
            });

            if (allowedUpdates.targetCount) allowedUpdates.targetCount = parseInt(allowedUpdates.targetCount);
            if (allowedUpdates.reward) {
                allowedUpdates.reward = {
                    xp: parseInt(allowedUpdates.reward.xp || 0),
                    coins: parseInt(allowedUpdates.reward.coins || 0)
                };
            }

            allowedUpdates.updatedAt = new Date();

            const result = await db.collection(COLLECTION_NAME).updateOne(
                { _id: new ObjectId(id) },
                { $set: allowedUpdates }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    message: "Missão não encontrada",
                    status: "ERROR"
                });
            }

            return res.json({
                message: "Missão atualizada com sucesso",
                status: "OK"
            });
        } catch (error) {
            console.error("Erro ao atualizar missão:", error);
            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            });
        }
    },

    // Admin: Delete a mission
    deleteMission: async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    message: "ID da missão é obrigatório",
                    status: "ERROR"
                });
            }

            const result = await db.collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });

            if (result.deletedCount === 0) {
                return res.status(404).json({
                    message: "Missão não encontrada",
                    status: "ERROR"
                });
            }

            return res.json({
                message: "Missão deletada com sucesso",
                status: "OK"
            });
        } catch (error) {
            console.error("Erro ao deletar missão:", error);
            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            });
        }
    },

    // User: Get user missions status
    getUserMissions: async (req, res) => {
        try {
            const db = getDB();
            const userId = req.user.id;

            // Get all active missions
            const allMissions = await db.collection(COLLECTION_NAME).find().toArray();
            
            // Get user's progress for these missions
            const userProgress = await db.collection("user_missions").find({
                userId: new ObjectId(userId)
            }).toArray();

            // Merge progress with mission data
            const missionsWithProgress = allMissions.map(mission => {
                const progress = userProgress.find(p => p.missionId.equals(mission._id));
                return {
                    ...mission,
                    progress: progress || {
                        currentCount: 0,
                        status: "IN_PROGRESS"
                    }
                };
            });

            return res.json({
                message: "Missões do usuário obtidas com sucesso",
                status: "OK",
                data: missionsWithProgress
            });
        } catch (error) {
            console.error("Erro ao obter missões do usuário:", error);
            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            });
        }
    },

    // User: Claim a reward for a mission
    claimReward: async (req, res) => {
        try {
            const userId = req.user.id;
            const { missionId } = req.body;

            if (!missionId) {
                return res.status(400).json({
                    message: "ID da missão é obrigatório",
                    status: "ERROR"
                });
            }

            const reward = await missionService.claimReward(userId, missionId);

            return res.json({
                message: "Recompensa resgatada com sucesso",
                status: "OK",
                reward: reward
            });
        } catch (error) {
            console.error("Erro ao resgatar recompensa:", error);
            return res.status(error.message.includes("concluída") ? 400 : 500).json({
                message: error.message || "Erro interno do servidor",
                status: "ERROR"
            });
        }
    }
};

module.exports = missionsController;
