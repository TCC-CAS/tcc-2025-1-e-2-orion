const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;
const client = new MongoClient(mongoURI);

async function seedAdmin() {
    try {
        await client.connect();
        const db = client.db('orion_financas_db');
        const adminsCollection = db.collection('admins');

        const adminEmail = 'admin@orion.com';
        const rawPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        // Check if admin already exists
        const existingAdmin = await adminsCollection.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin ${adminEmail} already exists. Updating password...`);
            await adminsCollection.updateOne(
                { email: adminEmail },
                { $set: { password: hashedPassword, updatedAt: new Date() } }
            );
        } else {
            console.log(`Creating new admin: ${adminEmail}`);
            await adminsCollection.insertOne({
                name: 'Administrador Orion',
                email: adminEmail,
                password: hashedPassword,
                role: 'Admin',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log("-----------------------------------------");
        console.log("Admin seeded successfully!");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${rawPassword}`);
        console.log("-----------------------------------------");

    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        await client.close();
    }
}

seedAdmin();
