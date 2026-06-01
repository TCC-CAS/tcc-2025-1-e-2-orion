/**
 * Seed de novos avatares cosméticos para a Loja.
 *
 * COMO USAR:
 * 1) Salve as 5 imagens em: orionfinancas-fe/public/images/
 *    com EXATAMENTE estes nomes:
 *      - disco_retro.png      (disco de vinil)
 *      - capitao_zumbi.png    (zumbi de boné/capitão)
 *      - pinguim_soneca.png   (pinguim sonolento)
 *      - capivara_zen.png     (capivara)
 *      - androide.png         (cabeça androide/robô)
 *
 * 2) Rode na pasta do backend:
 *      node seedAvatarShop.js
 *
 * O script é idempotente: se um item com o mesmo "name" já existir,
 * ele atualiza (preço/descrição/imagem) em vez de duplicar.
 */
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const dbName = 'orion_financas_db';

const items = [
    {
        name: "Disco Retrô",
        description: "Para quem entende que paciência e consistência tocam a melhor música dos juros compostos.",
        price: 150,
        imageUrl: "/images/disco_retro.png",
        category: "OUTFIT",
        isActive: true
    },
    {
        name: "Pinguim Soneca",
        description: "Mantém a calma nas turbulências do mercado. Tranquilo e econômico por natureza.",
        price: 200,
        imageUrl: "/images/pinguim_soneca.png",
        category: "OUTFIT",
        isActive: true
    },
    {
        name: "Capivara Zen",
        description: "O símbolo máximo da serenidade financeira. Sem dívidas, sem estresse.",
        price: 250,
        imageUrl: "/images/capivara_zen.png",
        category: "OUTFIT",
        isActive: true
    },
    {
        name: "Capitão Zumbi",
        description: "Avatar raro para quem ressuscitou as próprias finanças do vermelho.",
        price: 350,
        imageUrl: "/images/capitao_zumbi.png",
        category: "OUTFIT",
        isActive: true
    },
    {
        name: "Androide",
        description: "Avatar lendário. Frieza e lógica de máquina para decisões financeiras impecáveis.",
        price: 500,
        imageUrl: "/images/androide.png",
        category: "OUTFIT",
        isActive: true
    },
    {
        name: "Estudante Focado",
        description: "Cabeça nos estudos e no orçamento. Para quem aprende hoje para prosperar amanhã.",
        price: 300,
        imageUrl: "/images/estudante_focado.png",
        category: "OUTFIT",
        isActive: true
    }
];

async function run() {
    if (!uri) {
        console.error("ERRO: MONGODB_URI não definida no .env");
        process.exit(1);
    }

    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('shop_items');

        for (const item of items) {
            const result = await collection.updateOne(
                { name: item.name },
                {
                    $set: {
                        description: item.description,
                        price: item.price,
                        imageUrl: item.imageUrl,
                        category: item.category,
                        isActive: item.isActive
                    },
                    $setOnInsert: { _id: new ObjectId() }
                },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                console.log(`+ Criado: ${item.name} (${item.price} moedas)`);
            } else {
                console.log(`~ Atualizado: ${item.name} (${item.price} moedas)`);
            }
        }

        console.log("\nSUCESSO: avatares disponíveis na Loja!");
    } catch (e) {
        console.error("Erro ao inserir itens da loja:", e);
        process.exitCode = 1;
    } finally {
        await client.close();
    }
}

run();
