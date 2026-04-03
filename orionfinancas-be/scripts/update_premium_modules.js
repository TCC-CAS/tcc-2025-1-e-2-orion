const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI;
const client = new MongoClient(mongoURI);

async function updatePremiumTrails() {
    try {
        await client.connect();
        const db = client.db('orion_financas_db');
        const trailsCollection = db.collection('content_trails');

        // Get all trails
        const trails = await trailsCollection.find({}).toArray();

        for (const trail of trails) {
            // 1. Remove isPremium from inside modulos (clean up previous mistake)
            const cleanModulos = trail.modulos.map(modulo => {
                const newModulo = { ...modulo };
                delete newModulo.isPremium;
                return newModulo;
            });

            // 2. Set isPremium on the Trail itself
            let isPremium = false;
            if (trail.title === "Domínio das Finanças") {
                isPremium = true;
            }

            await trailsCollection.updateOne(
                { _id: trail._id },
                { 
                    $set: { 
                        modulos: cleanModulos,
                        isPremium: isPremium 
                    } 
                }
            );
            
            console.log(`Trail '${trail.title}' updated. isPremium: ${isPremium}`);
        }

        console.log("Trails structure updated successfully.");
    } catch (error) {
        console.error("Error updating trails:", error);
    } finally {
        await client.close();
    }
}

updatePremiumTrails();
