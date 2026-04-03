const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");

const toObjectId = (value, fieldName) => {
    if (!ObjectId.isValid(value)) {
        throw new Error(`${fieldName} inválido`);
    }

    return new ObjectId(value);
};

const getNormalizedBoolean = (value, fieldName) => {
    if (typeof value !== "boolean") {
        throw new Error(`${fieldName} deve ser booleano`);
    }

    return value;
};

const adminQuizzesService = {
    getAdminCatalog: async () => {
        const db = getDB();

        const [trails, quizzes, quizAttempts] = await Promise.all([
            db.collection("content_trails").find(
                {},
                { projection: { title: 1, modulos: 1 } }
            ).toArray(),
            db.collection("quizzes").find(
                {},
                { projection: { title: 1, lessonId: 1, questions: 1, isActive: 1 } }
            ).toArray(),
            db.collection("user_quiz_attempts").aggregate([
                { $group: { _id: "$quizId", attempts: { $sum: 1 } } }
            ]).toArray()
        ]);

        const attemptByQuizId = new Map(
            quizAttempts.map((item) => [item._id.toString(), item.attempts])
        );

        const lessonToModuleMap = new Map();
        const moduleByIdMap = new Map();
        const trailByIdMap = new Map();
        const trailsData = [];
        const modules = [];

        trails.forEach((trail) => {
            const trailId = trail._id.toString();
            const trailTitle = trail.title || "Trilha sem título";
            const modulos = Array.isArray(trail.modulos) ? trail.modulos : [];
            const trailItem = {
                id: trailId,
                title: trailTitle,
                modules: modulos.length,
                lessons: 0,
                quizzes: 0,
                activeModules: 0,
                activeQuizzes: 0
            };

            trailsData.push(trailItem);
            trailByIdMap.set(trailId, trailItem);

            modulos.forEach((modulo) => {
                if (!modulo?._id) return;

                const moduleId = modulo._id.toString();
                const lessons = Array.isArray(modulo.licoes) ? modulo.licoes : [];

                const moduleItem = {
                    id: moduleId,
                    trailId,
                    trailTitle,
                    name: modulo.titulo || "Módulo sem título",
                    lessons: lessons.length,
                    quizzes: 0,
                    isActive: modulo.isActive !== false
                };

                trailItem.lessons += lessons.length;
                if (moduleItem.isActive) {
                    trailItem.activeModules += 1;
                }

                modules.push(moduleItem);
                moduleByIdMap.set(moduleId, moduleItem);

                lessons.forEach((lesson) => {
                    if (!lesson?._id) return;

                    lessonToModuleMap.set(lesson._id.toString(), {
                        moduleId,
                        moduleName: moduleItem.name,
                        trailId
                    });
                });
            });
        });

        const quizzesData = quizzes.map((quiz) => {
            const quizId = quiz._id.toString();
            const lessonId = quiz.lessonId ? quiz.lessonId.toString() : null;
            const moduleRef = lessonId ? lessonToModuleMap.get(lessonId) : null;

            if (moduleRef) {
                const moduleRecord = moduleByIdMap.get(moduleRef.moduleId);
                if (moduleRecord) {
                    moduleRecord.quizzes += 1;
                }

                const trailRecord = trailByIdMap.get(moduleRef.trailId);
                if (trailRecord) {
                    trailRecord.quizzes += 1;
                    if (quiz.isActive !== false) {
                        trailRecord.activeQuizzes += 1;
                    }
                }
            }

            return {
                id: quizId,
                title: quiz.title || "Quiz sem título",
                moduleId: moduleRef?.moduleId || null,
                moduleName: moduleRef?.moduleName || "Módulo não vinculado",
                trailId: moduleRef?.trailId || null,
                questions: Array.isArray(quiz.questions) ? quiz.questions.length : 0,
                attempts: attemptByQuizId.get(quizId) || 0,
                isActive: quiz.isActive !== false
            };
        });

        const trailsCatalog = trailsData.map((trailItem) => ({
            id: trailItem.id,
            title: trailItem.title,
            modules: trailItem.modules,
            lessons: trailItem.lessons,
            quizzes: trailItem.quizzes,
            isActive: trailItem.activeModules > 0 || trailItem.activeQuizzes > 0
        }));

        return {
            trails: trailsCatalog,
            modules,
            quizzes: quizzesData
        };
    },

    updateTrailStatus: async ({ trailId, isActive }) => {
        const db = getDB();

        const trailObjectId = toObjectId(trailId, "trailId");
        const normalizedIsActive = getNormalizedBoolean(isActive, "isActive");
        const now = new Date();

        const trail = await db.collection("content_trails").findOne(
            { _id: trailObjectId },
            { projection: { modulos: 1 } }
        );

        if (!trail) {
            throw new Error("Trilha não encontrada");
        }

        const modulos = Array.isArray(trail.modulos) ? trail.modulos : [];
        const updatedModulos = modulos.map((modulo) => ({
            ...modulo,
            isActive: normalizedIsActive
        }));
        const lessonIds = [];

        modulos.forEach((modulo) => {
            const licoes = Array.isArray(modulo?.licoes) ? modulo.licoes : [];
            licoes.forEach((licao) => {
                if (licao?._id) {
                    lessonIds.push(licao._id);
                }
            });
        });

        await db.collection("content_trails").updateOne(
            { _id: trailObjectId },
            {
                $set: {
                    modulos: updatedModulos,
                    updatedAt: now
                }
            }
        );

        let quizzesAffected = 0;
        if (lessonIds.length > 0) {
            const quizzesUpdateResult = await db.collection("quizzes").updateMany(
                { lessonId: { $in: lessonIds } },
                {
                    $set: {
                        isActive: normalizedIsActive,
                        updatedAt: now
                    }
                }
            );

            quizzesAffected = quizzesUpdateResult.modifiedCount || 0;
        }

        return {
            trailId: trailObjectId.toString(),
            isActive: normalizedIsActive,
            modulesAffected: modulos.length,
            quizzesAffected
        };
    },

    updateModuleStatus: async ({ trailId, moduleId, isActive }) => {
        const db = getDB();

        const trailObjectId = toObjectId(trailId, "trailId");
        const moduleObjectId = toObjectId(moduleId, "moduleId");
        const normalizedIsActive = getNormalizedBoolean(isActive, "isActive");

        const result = await db.collection("content_trails").updateOne(
            { _id: trailObjectId, "modulos._id": moduleObjectId },
            {
                $set: {
                    "modulos.$.isActive": normalizedIsActive,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new Error("Módulo não encontrado para a trilha informada");
        }

        return {
            moduleId: moduleObjectId.toString(),
            trailId: trailObjectId.toString(),
            isActive: normalizedIsActive
        };
    },

    updateQuizStatus: async ({ quizId, isActive }) => {
        const db = getDB();

        const quizObjectId = toObjectId(quizId, "quizId");
        const normalizedIsActive = getNormalizedBoolean(isActive, "isActive");

        const result = await db.collection("quizzes").updateOne(
            { _id: quizObjectId },
            {
                $set: {
                    isActive: normalizedIsActive,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            throw new Error("Quiz não encontrado");
        }

        return {
            quizId: quizObjectId.toString(),
            isActive: normalizedIsActive
        };
    }
};

module.exports = adminQuizzesService;
