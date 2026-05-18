const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const rewardService = require("./rewardService.js");
const notificationService = require("./notificationService.js");

const missionService = {
    /**
     * Increments the progress of a mission for a specific user.
     * @param {string} userId - User ID
     * @param {string} actionTrigger - The trigger that occurred (e.g., "PERFECT_QUIZ")
     */
    updateProgress: async (userId, actionTrigger) => {
        try {
            const db = getDB();
            
            // Find missions that are triggered by this action
            const relevantMissions = await db.collection("missions").find({
                actionTrigger: actionTrigger
            }).toArray();

            const userObjectId = new ObjectId(userId);

            for (const mission of relevantMissions) {
                // Incremento atômico: só roda se a missão ainda está IN_PROGRESS.
                // Cria com upsert para o primeiro hit. Status COMPLETED/CLAIMED é
                // imutável aqui (guard contra re-fire após conclusão).
                const updateResult = await db.collection("user_missions").findOneAndUpdate(
                    {
                        userId: userObjectId,
                        missionId: mission._id,
                        $or: [
                            { status: "IN_PROGRESS" },
                            { status: { $exists: false } }
                        ]
                    },
                    {
                        $inc: { currentCount: 1 },
                        $set: { updatedAt: new Date() },
                        $setOnInsert: {
                            userId: userObjectId,
                            missionId: mission._id,
                            status: "IN_PROGRESS"
                        }
                    },
                    { upsert: true, returnDocument: 'after' }
                );

                const updated = updateResult?.value || updateResult;
                if (!updated) continue;

                // Se atingiu o target nesta iteração, marca como COMPLETED de forma
                // atômica — apenas uma chamada paralela ganha a transição.
                if (updated.currentCount >= mission.targetCount && updated.status === "IN_PROGRESS") {
                    const completion = await db.collection("user_missions").findOneAndUpdate(
                        { _id: updated._id, status: "IN_PROGRESS" },
                        { $set: { status: "COMPLETED", completedAt: new Date() } },
                        { returnDocument: 'after' }
                    );

                    const completedDoc = completion?.value || completion;
                    if (completedDoc) {
                        await notificationService.createNotification(userId, "Missão Concluída!", `Parabéns! Você concluiu a missão: ${mission.title}`, "MISSION");
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar progresso da missão:", error);
        }
    },

    /**
     * Claims the reward of a completed mission.
     */
    claimReward: async (userId, missionId) => {
        try {
            const db = getDB();
            
            const userMission = await db.collection("user_missions").findOne({
                userId: new ObjectId(userId),
                missionId: new ObjectId(missionId),
                status: "COMPLETED"
            });

            if (!userMission) {
                throw new Error("Missão não encontrada ou não concluída");
            }

            const mission = await db.collection("missions").findOne({ _id: userMission.missionId });

            // Award XP and Coins to user using the unified rewardService
            const grantedReward = await rewardService.grantRewards(userId, mission.reward);

            // Mark mission as CLAIMED
            await db.collection("user_missions").updateOne(
                { _id: userMission._id },
                { $set: { status: "CLAIMED", claimedAt: new Date() } }
            );

            return mission.reward;
        } catch (error) {
            console.error("Erro ao resgatar recompensa:", error);
            throw error;
        }
    }
};

module.exports = missionService;
