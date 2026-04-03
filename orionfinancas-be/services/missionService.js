const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const rewardService = require("./rewardService.js");

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

            for (const mission of relevantMissions) {
                // Find or create user mission progress
                const userMission = await db.collection("user_missions").findOne({
                    userId: new ObjectId(userId),
                    missionId: mission._id
                });

                if (!userMission) {
                    // Create new progress
                    const status = 1 >= mission.targetCount ? "COMPLETED" : "IN_PROGRESS";
                    await db.collection("user_missions").insertOne({
                        userId: new ObjectId(userId),
                        missionId: mission._id,
                        currentCount: 1,
                        status: status,
                        updatedAt: new Date()
                    });
                } else if (userMission.status === "IN_PROGRESS") {
                    // Update existing progress
                    const newCount = userMission.currentCount + 1;
                    const newStatus = newCount >= mission.targetCount ? "COMPLETED" : "IN_PROGRESS";

                    await db.collection("user_missions").updateOne(
                        { _id: userMission._id },
                        { 
                            $set: { 
                                currentCount: newCount,
                                status: newStatus,
                                updatedAt: new Date()
                            }
                        }
                    );
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
