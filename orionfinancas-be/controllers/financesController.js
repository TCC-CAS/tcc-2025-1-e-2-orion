const { getDB } = require('../config/database');
const { ObjectId } = require('mongodb');

const financesController = {
    getDashboard: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);

            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const currentMonthRegex = new RegExp(`/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}$`);

            // Pega TODAS recorrentes do usuário, do mais recente pro mais antigo
            const recurringTxs = await db.collection('transactions')
                .find({ userId, isRecurring: true })
                .sort({ createdAt: -1 })
                .toArray();
            
            // RN23: Lógica de Clonagem de Lançamentos Recorrentes
            const latestRecurringTxs = [];
            const seenTitles = new Set();
            for (const rx of recurringTxs) {
                const titleKey = (rx.title || "").toLowerCase();
                if (!seenTitles.has(titleKey)) {
                    seenTitles.add(titleKey);
                    latestRecurringTxs.push(rx);
                }
            }

            for (const reqTx of latestRecurringTxs) {
                const parts = reqTx.date.split('/');
                let txDate;
                if (parts.length === 3) {
                    // Garante que a data seja interpretada corretamente
                    txDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                } else {
                    txDate = new Date(reqTx.createdAt);
                }
                
                // Se o lançamento original é de um mês/ano anterior ao atual
                const isFromPast = txDate.getFullYear() < currentYear || (txDate.getFullYear() === currentYear && txDate.getMonth() < currentMonth);

                if (isFromPast) {
                    // Verifica se já existe uma cópia DESTE título NESTE mês corrente
                    const alreadyCloned = await db.collection('transactions').findOne({
                        userId, 
                        isRecurring: true, 
                        title: reqTx.title, 
                        date: { $regex: currentMonthRegex }
                    });

                    if (!alreadyCloned) {
                        const day = String(txDate.getDate()).padStart(2, '0');
                        const newDateStr = `${day}/${String(currentMonth + 1).padStart(2, '0')}/${currentYear}`;
                        
                        await db.collection('transactions').insertOne({
                            userId,
                            type: reqTx.type,
                            title: reqTx.title,
                            amount: reqTx.amount,
                            category: reqTx.category,
                            date: newDateStr,
                            isRecurring: true,
                            createdAt: new Date(),
                            clonedFrom: reqTx._id // Rastro para auditoria
                        });
                        console.log(`[RN23] Lançamento "${reqTx.title}" clonado para ${newDateStr}`);
                    }
                }
            }

            const transactions = await db.collection('transactions')
                .find({ userId })
                .sort({ createdAt: -1 })
                .toArray();

            let income = 0;
            let expenses = 0;
            let invested = 0;
            let fixed = 0;



            // Histórico agregado (últimos 6 meses)
            const historyMap = {};
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

            // Initialize last 6 meses
            for (let i = 5; i >= 0; i--) {
                let d = new Date(currentYear, currentMonth - i, 1);
                historyMap[`${d.getFullYear()}-${d.getMonth()}`] = {
                    month: monthNames[d.getMonth()],
                    ganhos: 0,
                    gastos: 0,
                    order: d.getTime()
                };
            }

            transactions.forEach(tx => {
                const parts = tx.date.split('/'); // ex: 04/03/2026
                const txDate = parts.length === 3 ? new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00Z`) : new Date(tx.createdAt);
                
                const txMonth = txDate.getMonth();
                const txYear = txDate.getFullYear();

                const historyKey = `${txYear}-${txMonth}`;
                if (historyMap[historyKey]) {
                    if (tx.type === 'ganho') historyMap[historyKey].ganhos += tx.amount;
                    if (tx.type === 'gasto') historyMap[historyKey].gastos += tx.amount;
                }

                if (txMonth === currentMonth && txYear === currentYear) {
                    if (tx.type === 'ganho') income += tx.amount;
                    if (tx.type === 'gasto') {
                        expenses += tx.amount;
                        const cat = (tx.category || '').toLowerCase();
                        if (cat.includes('invest')) {
                            invested += tx.amount;
                        } else if (cat.includes('fixo') || cat.includes('aluguel') || cat.includes('internet') || cat.includes('moradia')) {
                            fixed += tx.amount;
                        }
                    }
                }
            });

            const historyData = Object.values(historyMap).sort((a, b) => a.order - b.order).map(h => ({
                month: h.month,
                ganhos: Number(h.ganhos.toFixed(2)),
                gastos: Number(h.gastos.toFixed(2))
            }));

            const balance = Number((income - expenses).toFixed(2)); // Livre após tudo. (No mock era income - expenses - 750)

            // Dynamic Insight Logic
            let insightHtml = "Mantenha o foco e controle todos os seus pequenos gastos para terminar o mês no azul.";
            
            const goals = await db.collection('user_financial_goals').find({ userId }).toArray();
            const reservaGoal = goals.find(g => (g.goalName || '').toLowerCase().includes('reserva') || (g.goalName || '').toLowerCase().includes('emergência'));

            if (income > 0 && expenses > income) {
                insightHtml = `Alerta: Seus gastos (R$ ${expenses.toFixed(2).replace('.', ',')}) superaram suas entradas neste mês. Reveja suas despesas.`;
            } else if (reservaGoal) {
                if (reservaGoal.currentAmount >= reservaGoal.targetAmount) {
                    insightHtml = `Excelente! Sua <strong>${reservaGoal.goalName}</strong> foi alcançada. Foque agora em investimentos a longo prazo.`;
                } else {
                    const faltam = (reservaGoal.targetAmount - (reservaGoal.currentAmount || 0)).toFixed(2).replace('.', ',');
                    insightHtml = `Foque em sua <strong>${reservaGoal.goalName}</strong> para te dar segurança (Faltam R$ ${faltam}).`;
                }
            } else if (goals.length === 0) {
                insightHtml = `Você não tem metas ativas no momento. Que tal começar listando sua <strong>Primeira Meta Financeira</strong>?`;
            } else if (income > 0 && fixed > (income * 0.6)) {
                insightHtml = `Atenção: Seus custos fixos estão muito altos ("esmagando" sua renda livre). Avalie o que pode ser cortado!`;
            } else if (income > 0 && invested >= (income * 0.1)) {
                insightHtml = `Parabéns! Você investiu mais de 10% dos seus ganhos neste mês. Continue criando esse hábito.`;
            }

            return res.json({
                message: 'Dashboard financeiro',
                status: 'OK',
                data: {
                    transactions,
                    income,
                    expenses,
                    invested,
                    fixed,
                    balance,
                    historyData,
                    insight: insightHtml
                }
            });
        } catch (error) {
            console.error('Erro getDashboard:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    createTransaction: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { type, title, amount, category, date, isRecurring } = req.body;

            if (!title || !amount) {
                return res.status(400).json({ message: 'Dados incompletos', status: 'ERROR' });
            }

            const newTx = {
                userId,
                type,
                title,
                amount: parseFloat(amount),
                category,
                date: date || new Date().toLocaleDateString('pt-BR'),
                isRecurring: !!isRecurring,
                createdAt: new Date()
            };

            const result = await db.collection('transactions').insertOne(newTx);
            newTx._id = result.insertedId;

            return res.json({ message: 'Transação adicionada', status: 'OK', data: newTx });
        } catch (error) {
            console.error('Erro createTransaction:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    updateTransaction: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { id, type, title, amount, category, date, isRecurring } = req.body;

            await db.collection('transactions').updateOne(
                { _id: new ObjectId(id), userId },
                { $set: { type, title, amount: parseFloat(amount), category, date, isRecurring: !!isRecurring, updatedAt: new Date() } }
            );

            return res.json({ message: 'Transação atualizada', status: 'OK' });
        } catch (error) {
            console.error('Erro updateTransaction:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    },

    deleteTransaction: async (req, res) => {
        try {
            const db = getDB();
            const userId = new ObjectId(req.user.id);
            const { id } = req.body;

            await db.collection('transactions').deleteOne({ _id: new ObjectId(id), userId });

            return res.json({ message: 'Transação excluída', status: 'OK' });
        } catch (error) {
            console.error('Erro deleteTransaction:', error);
            return res.status(500).json({ message: 'Erro interno', status: 'ERROR' });
        }
    }
};

module.exports = financesController;
