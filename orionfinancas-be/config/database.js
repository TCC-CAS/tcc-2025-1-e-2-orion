const { MongoClient }  = require('mongodb');

let db;

let clientInstance;

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI
        const client = new MongoClient(mongoURI);

        await client.connect();
        clientInstance = client;
        db = client.db('orion_financas_db');

        return db;
    } catch (error) {
        console.error('Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

const getDB = () => {
    if (!db) {
        throw new Error('Banco de dados não conectado')
    }

    return db;
}

const closeDB = async () => {
    if (clientInstance) {
        await clientInstance.close();
        clientInstance = null;
        db = null;
    }
}

module.exports = { connectDB, getDB, closeDB };