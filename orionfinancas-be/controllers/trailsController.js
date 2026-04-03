const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");

const filterInactiveModules = (trail) => {
    const modulos = Array.isArray(trail?.modulos) ? trail.modulos : [];
    const activeModules = modulos.filter((modulo) => modulo?.isActive !== false);

    return {
        ...trail,
        modulos: activeModules
    };
};

const trailsController = {
    // User: Get all learning trails/modules
    getAllTrails: async (req, res) => {
        try {
            const db = getDB();
            const trails = await db.collection("content_trails").find().toArray();
            const availableTrails = trails
                .map(filterInactiveModules)
                .filter((trail) => trail.modulos.length > 0);

            return res.json({
                message: "Trilhas obtidas com sucesso",
                status: "OK",
                data: availableTrails
            });
        } catch (error) {
            console.error("Erro ao obter trilhas:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    },

    // User: Get single trail with modules and lessons
    getTrailById: async (req, res) => {
        try {
            const db = getDB();
            const { id } = req.params;
            const trail = await db.collection("content_trails").findOne({ _id: new ObjectId(id) });
            
            if (!trail) {
                return res.status(404).json({ message: "Trilha não encontrada", status: "ERROR" });
            }

            const filteredTrail = filterInactiveModules(trail);
            if (filteredTrail.modulos.length === 0) {
                return res.status(403).json({
                    message: "Trilha indisponível no momento",
                    status: "ERROR"
                });
            }

            return res.json({
                message: "Trilha obtida com sucesso",
                status: "OK",
                data: filteredTrail
            });
        } catch (error) {
            console.error("Erro ao obter trilha:", error);
            return res.status(500).json({ message: "Erro interno do servidor", status: "ERROR" });
        }
    }
};

module.exports = trailsController;
