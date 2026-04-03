const { getDB } = require("../config/database.js");
const { ObjectId } = require("mongodb");
const missionService = require("../services/missionService.js");

const COLLECTIONNAME = "user_financial_goals"

const goalsController = {
    getAllGoals: async function (req, res) {
        try {
            const db = getDB();
            const userId = req.user.id;

            if (!userId) {
                return res.status(404).json({
                    message: "Usuário não encontrado",
                    status: "ERROR"
                });
            }

            const allGoals = await db.collection(COLLECTIONNAME).find( { userId: new ObjectId(userId) } ).toArray()

            if (allGoals.length != 0) {
                return res.json({
                    message: "Metas encontradas",
                    status: "OK",
                    allGoals
                });
            } else {
                return res.status(404).json({
                    message: "Metas não encontradas",
                    status: "ERROR"
                })
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Erro interno do servidor",
                status: "ERROR"
            })

        }
    },

    createGoal: async function (req, res) {
        try {
            const db = getDB();
            const userId = req.user.id;
            const goalsCollection = db.collection('user_financial_goals');
            let { goalName, targetAmount, currentAmount, targetDate, urgencyColor, description } = req.body;

            if (!userId || !goalName || !targetAmount) {
                return res.status(400).json({
                    message: 'Dados obrigatórios não foram preenchidos',
                    status: 'ERROR'
                });
            }

            const initialDeposit = parseFloat(currentAmount) || 0;

            // Validação de saldo
            if (initialDeposit > 0) {
                const txs = await db.collection('transactions').find({ userId: new ObjectId(userId) }).toArray();
                const income = txs.filter(t => t.type === 'ganho').reduce((sum, t) => sum + t.amount, 0);
                const expenses = txs.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.amount, 0);
                const balance = income - expenses;

                if (balance < initialDeposit) {
                    return res.status(400).json({
                        message: 'Saldo insuficiente na conta para reservar este valor inicial.',
                        status: 'ERROR'
                    });
                }
            }

            if (!urgencyColor) {
                urgencyColor = '#FFFF00'
            }

            const payload = {
                userId: new ObjectId(userId),
                goalName: goalName,
                targetAmount: parseFloat(targetAmount),
                currentAmount: initialDeposit,
                targetDate: targetDate,
                urgencyColor: urgencyColor,
                description: description || '',
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const response = await goalsCollection.insertOne(payload);

            // Debita no extrato financeiro
            if (initialDeposit > 0) {
                await db.collection('transactions').insertOne({
                    userId: new ObjectId(userId),
                    type: 'gasto',
                    title: `Meta: ${goalName}`,
                    amount: initialDeposit,
                    category: 'Investimento / Meta',
                    date: new Date().toLocaleDateString('pt-BR'),
                    createdAt: new Date()
                });
            }

            // Trigger mission progress for creating a goal
            await missionService.updateProgress(userId, 'GOAL_CREATED');

            return res.status(201).json({
                message: 'Meta criada com sucesso',
                status: 'OK',
                insertedId: response.insertedId
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Falha interna no servidor',
                status: 'ERROR'
            });
        }
    },

    updateGoal: async function (req, res) {
        try {
            const db = getDB()
            const goalsCollection = db.collection('user_financial_goals');
            const updates = req.body;
            const goalId = updates._id;
            const userId = req.user.id;
    
            if (!updates || Object.keys(updates).length === 0) {
                return res.status(400).json({
                    message: 'Nenhum dado fornecido para atualização',
                    status: 'ERROR'
                });
            }

            const updateDocumentData = await goalsCollection.findOne({ _id: new ObjectId(goalId) })

            if (!updateDocumentData) {
                return res.status(404).json({
                    message: 'Não foi encontrado nenhuma meta',
                    status: 'ERROR'
                })
            }

            if (!updateDocumentData.userId.equals(new ObjectId(userId))) {
                return res.status(403).json({
                    message: 'Acesso não autorizado',
                    status: 'ERROR'
                });
            }

            // --- Lógica de Depósito / Resgate da Meta com integração no Saldo ---
            if (updates.currentAmount !== undefined) {
                const newCurrent = parseFloat(updates.currentAmount);
                const oldCurrent = updateDocumentData.currentAmount || 0;
                const diff = newCurrent - oldCurrent;

                if (diff > 0) { // Tentando colocar mais dinheiro
                    const txs = await db.collection('transactions').find({ userId: new ObjectId(userId) }).toArray();
                    const income = txs.filter(t => t.type === 'ganho').reduce((sum, t) => sum + t.amount, 0);
                    const expenses = txs.filter(t => t.type === 'gasto').reduce((sum, t) => sum + t.amount, 0);
                    const balance = income - expenses;

                    if (balance < diff) {
                        return res.status(400).json({
                            message: `Saldo insuficiente. Faltam R$ ${(diff - balance).toFixed(2)} para esta reserva.`,
                            status: 'ERROR'
                        });
                    }

                    // Dinheiro saiu da conta principal pra ir pra meta
                    await db.collection('transactions').insertOne({
                        userId: new ObjectId(userId),
                        type: 'gasto',
                        title: `Reserva para Meta: ${updates.goalName || updateDocumentData.goalName}`,
                        amount: diff,
                        category: 'Investimento / Meta',
                        date: new Date().toLocaleDateString('pt-BR'),
                        createdAt: new Date()
                    });
                } else if (diff < 0) { // O usuário tirou dinheiro da meta de volta pra conta
                    await db.collection('transactions').insertOne({
                        userId: new ObjectId(userId),
                        type: 'ganho',
                        title: `Resgate da Meta: ${updates.goalName || updateDocumentData.goalName}`,
                        amount: Math.abs(diff),
                        category: 'Resgate de Meta',
                        date: new Date().toLocaleDateString('pt-BR'),
                        createdAt: new Date()
                    });
                }
                
                updates.currentAmount = newCurrent;
            }
            if (updates.targetAmount !== undefined) updates.targetAmount = parseFloat(updates.targetAmount);
    
            const forbiddenFields = ['_id', 'userId', 'createdAt'];
    
            const allowedUpdates = {};
            Object.keys(updates).forEach(field => {
                if (!forbiddenFields.includes(field)) {
                    let value = updates[field];

                    if (field === 'targetDate' && value != null) {
                        const parsed = new Date(value);
                        if (!isNaN(parsed.getTime())) {
                            value = parsed;
                        } else {
                            console.log("Não foi possivel transformar data em new Date")
                        };
                    }
                    allowedUpdates[field] = value;
                }
            });
    
            if (Object.keys(allowedUpdates).length === 0) {
                return res.status(400).json({
                    message: 'Nenhum campo válido para atualização',
                    status: 'ERROR'
                });
            }
            
            const goal = await goalsCollection.updateOne(
                { _id: new ObjectId(goalId)},
                { $set: allowedUpdates}
            );
    
            return res.json({
                message: 'Meta atualizada com sucesso',
                status: 'OK',
                modifiedCount: goal.modifiedCount
            })
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Erro interno do servidor',
                status: 'ERROR'
            })
        }
        
    },

    deleteGoal: async function (req, res) {
        try {
            const db = getDB();
            const goalsCollection = db.collection('user_financial_goals');
            const goalId = req.body._id;
            const userId = req.user.id;
    
            if (!goalId) {
                return res.status(400).json({
                    message: 'Não foram encontrados nenhuma meta para deletar',
                    status: 'ERROR'
                });
            }

            const deleteDocumentData = await goalsCollection.findOne({ _id: new ObjectId(goalId) })

            if (!deleteDocumentData) {
                return res.status(404).json({
                    message: 'Não foi encontrado nenhuma meta',
                    status: 'ERROR'
                })
            }

            if (!deleteDocumentData.userId.equals(new ObjectId(userId))) {
                return res.status(403).json({
                    message: 'Acesso não autorizado',
                    status: 'ERROR'
                });
            }

            const deleteGoal = await goalsCollection.deleteOne( { _id: new ObjectId(goalId) });
            
            return res.json({
                message: 'Meta deletada com sucesso',
                status: 'OK'
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Erro interno do servidor',
                status: 'ERROR'
            });
        }
    } 
}

module.exports = goalsController