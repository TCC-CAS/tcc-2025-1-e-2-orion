const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");

const rewardService = {
    /**
     * Awards XP and Coins to a user's wallet and updates their level/points.
     * @param {string} userId - User ID
     * @param {object} reward - { xp, coins }
     */
    grantRewards: async (userId, reward) => {
        try {
            const db = getDB();
            const xpToAdd = parseInt(reward.xp || 0);
            const coinsToAdd = parseInt(reward.coins || 0);

            if (xpToAdd === 0 && coinsToAdd === 0) return;

            // Fetch current user to calculate level
            const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
            if (!user) return;

            const currentXP = (user.wallet?.xp || 0) + xpToAdd;
            const newLevel = Math.floor(currentXP / 1000) + 1;

            await db.collection("users").updateOne(
                { _id: new ObjectId(userId) },
                { 
                    $inc: { 
                        "wallet.xp": xpToAdd,
                        "wallet.coins": coinsToAdd,
                        "profile.points": xpToAdd // Assuming points = total XP for leaderboard
                    },
                    $set: {
                        "profile.level": newLevel,
                        "updatedAt": new Date()
                    }
                }
            );

            console.log(`[Reward] User ${userId} received ${xpToAdd} XP and ${coinsToAdd} Coins. New Level: ${newLevel}`);
            return { xp: xpToAdd, coins: coinsToAdd, newLevel };
        } catch (error) {
            console.error("Erro ao conceder recompensas:", error);
            throw error;
        }
    }
};

module.exports = rewardService;
