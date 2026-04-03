const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

const shopController = {
    getItems: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            
            const user = await db.collection('users').findOne({ _id: userId });
            const inventoryIds = (user?.inventory || []).map(i => (i.itemId || i._id)?.toString());

            const items = await db.collection('shop_items').find({ isActive: true }).toArray();
            
            // Filtra os itens que o usuário já possui no inventário
            const availableItems = items.filter(item => !inventoryIds.includes(item._id.toString()));

            return res.json({
                message: 'Itens listados com sucesso',
                status: 'OK',
                data: availableItems
            });
        } catch (error) {
            console.error('Erro getItems:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    buyItem: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { itemId } = req.body;

            if (!itemId) {
                return res.status(400).json({ message: 'ID do item obrigatório', status: 'ERROR' });
            }

            const item = await db.collection('shop_items').findOne({ _id: new ObjectId(itemId), isActive: true });
            if (!item) {
                return res.status(404).json({ message: 'Item não encontrado ou inativo', status: 'ERROR' });
            }

            const user = await db.collection('users').findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado', status: 'ERROR' });
            }

            const inventory = user.inventory || [];
            const alreadyOwns = inventory.some(i => i.itemId && i.itemId.toString() === itemId.toString());
            if (alreadyOwns) {
                return res.status(400).json({ message: 'Você já possui este item', status: 'ERROR' });
            }

            const userCoins = user.wallet?.coins || 0;
            if (userCoins < item.price) {
                return res.status(400).json({ message: 'Moedas insuficientes', status: 'ERROR' });
            }

            const newCoins = userCoins - item.price;
            const inventoryEntry = {
                itemId: item._id,
                name: item.name,
                category: item.category,
                imageUrl: item.imageUrl,
                purchasedAt: new Date()
            };

            await db.collection('users').updateOne(
                { _id: userId },
                { 
                    $set: { "wallet.coins": newCoins },
                    $push: { inventory: inventoryEntry }
                }
            );

            return res.json({
                message: 'Compra realizada com sucesso!',
                status: 'OK',
                data: {
                    newBalance: newCoins,
                    item: inventoryEntry
                }
            });

        } catch (error) {
            console.error('Erro buyItem:', error);
            return res.status(500).json({ message: 'Erro interno do servidor', status: 'ERROR' });
        }
    }
};

module.exports = shopController;
