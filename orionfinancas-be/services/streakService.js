const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");

const streakService = {
    /**
     * Updates the user's daily streak.
     * Logic:
     * - If last activity was today: do nothing.
     * - If last activity was yesterday: increment streak.
     * - If last activity was more than 1 day ago: reset streak to 1.
     * @param {string} userId 
     */
    updateStreak: async (userId) => {
        try {
            const db = getDB();
            const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
            
            if (!user) return;

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            let lastActivity = null;
            if (user.profile?.lastActivity) {
                const laDate = new Date(user.profile.lastActivity);
                lastActivity = new Date(laDate.getFullYear(), laDate.getMonth(), laDate.getDate());
            }

            let newStreak = user.profile?.streak || 0;

            if (!lastActivity) {
                // First activity ever
                newStreak = 1;
            } else {
                const diffTime = today.getTime() - lastActivity.getTime();
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    // Consecutive day
                    newStreak += 1;
                } else if (diffDays > 1) {
                    // Streak broken - start new streak today
                    newStreak = 1;
                } else if (diffDays === 0) {
                    // Already updated today
                    return { streak: newStreak, updated: false };
                } else if (diffDays < 0) {
                    // Safety check for clock inconsistency
                    return { streak: newStreak, updated: false };
                }
            }

            await db.collection("users").updateOne(
                { _id: new ObjectId(userId) },
                { 
                    $set: { 
                        "profile.streak": newStreak,
                        "profile.lastActivity": now,
                        "updatedAt": now
                    } 
                }
            );

            console.log(`[Streak] User ${userId} streak updated to ${newStreak}.`);
            return { streak: newStreak, updated: true };
        } catch (error) {
            console.error("Erro ao atualizar ofensiva:", error);
            throw error;
        }
    },

    /**
     * Checks if the streak was broken and resets it to 0 if so.
     * Use this when retrieving profile to show correct streak before any activity.
     */
    validateStreak: async (userId, userObj = null) => {
        try {
            const db = getDB();
            let user = userObj;
            
            if (!user) {
                user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
            }
            
            if (!user || !user.profile?.streak || !user.profile?.lastActivity) return user?.profile?.streak || 0;

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const laDate = new Date(user.profile.lastActivity);
            const lastActivity = new Date(laDate.getFullYear(), laDate.getMonth(), laDate.getDate());

            const diffTime = today.getTime() - lastActivity.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1) {
                // Streak broken, missed at least yesterday
                await db.collection("users").updateOne(
                    { _id: new ObjectId(userId) },
                    { $set: { "profile.streak": 0, "updatedAt": now } }
                );
                return 0;
            }

            return user.profile.streak;
        } catch (error) {
            console.error("Erro ao validar ofensiva:", error);
            return 0;
        }
    }
};

module.exports = streakService;
