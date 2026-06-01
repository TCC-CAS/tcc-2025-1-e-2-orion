const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI; // Falha segura caso o .env não carregue perfeitamente
const dbName = 'orion_financas_db';

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        
        // Criando os registros do Macaco e Peixe
        const newItems = [
            {
                _id: new ObjectId(),
                name: "Macaco Sábio",
                description: "Um ícone para quem é o intelectual das finanças.",
                price: 0,
                imageUrl: "/images/macaco_sabio.jpg",
                category: "OUTFIT",
                isActive: true
            },
            {
                _id: new ObjectId(),
                name: "Homem Peixe",
                description: "Nade até as profundezas para achar moedas perdidas.",
                price: 0,
                imageUrl: "/images/homem_peixe.jpg",
                category: "OUTFIT",
                isActive: true
            }
        ];
        
        await db.collection('shop_items').insertMany(newItems);
        console.log("Itens criados na Loja.");
        
        // Adiciona de graça no inventário de todos os usuários
        for (const item of newItems) {
            const inventoryEntry = {
                itemId: item._id,
                name: item.name,
                category: item.category,
                imageUrl: item.imageUrl,
                purchasedAt: new Date()
            };
            
            await db.collection('users').updateMany(
                {},
                { $push: { inventory: inventoryEntry } }
            );
        }
        
        console.log("SUCESSO: Ícones atribuídos ao inventário do seu usuário!");
    } catch (e) {
        console.error("Erro ao inserir:", e);
    } finally {
        await client.close();
    }
}

run();
