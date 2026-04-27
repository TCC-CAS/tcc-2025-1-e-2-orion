const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

const notificationService = {
    createNotification: async (userId, title, description, type = 'GENERAL') => {
        try {
            const db = getDB();
            const notification = {
                userId: typeof userId === 'string' ? new ObjectId(userId) : userId,
                title,
                description,
                type,
                read: false,
                createdAt: new Date()
            };

            await db.collection('notifications').insertOne(notification);
            return true;
        } catch (error) {
            console.error('Erro ao criar notificação:', error);
            // Non-blocking error
            return false;
        }
    }
};

module.exports = notificationService;
