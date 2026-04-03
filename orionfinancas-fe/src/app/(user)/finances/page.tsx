"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './Finances.module.css';
import AddTransactionModal from './components/AddTransactionModal';
import HistoryModal from './components/HistoryModal';
import WelcomeModal from './components/WelcomeModal';
import EditTransactionModal from './components/EditTransactionModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

const MonthlyChart = dynamic(() => import('./components/MonthlyChart'), { 
    ssr: false,
    loading: () => <div style={{ height: 320, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24 }}>Carregando gráfico...</div>
});
const HistoryChart = dynamic(() => import('./components/HistoryChart'), { 
    ssr: false,
    loading: () => <div style={{ height: 320, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24 }}>Carregando histórico...</div>
});
interface Transaction {
    id: number;
    type: 'ganho' | 'gasto';
    title: string;
    amount: number;
    date: string;
    category: string;
}

export default function FinancesPage() {
    const [view, setView] = useState<'resumo' | 'historico'>('resumo');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    // Dynamic Data from Backend
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totals, setTotals] = useState({ income: 0, expenses: 0, invested: 0, fixed: 0, balance: 0, insight: '' });
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados para Edição/Exclusão
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [deletingTxId, setDeletingTxId] = useState<number | null>(null);

    const fetchDashboard = useCallback(async () => {
        try {
            const res = await api.get('/finances/dashboard');
            if (res.status === 'OK' && res.data) {
                setTransactions(res.data.transactions.map((tx: any) => ({
                    ...tx,
                    id: tx._id, // map _id to id
                })));
                setTotals({
                    income: res.data.income || 0,
                    expenses: res.data.expenses || 0,
                    invested: res.data.invested || 0,
                    fixed: res.data.fixed || 0,
                    balance: res.data.balance || 0,
                    insight: res.data.insight || ''
                });
                setHistoryData(res.data.historyData || []);
            }
        } catch (err) {
            console.error('Erro ao carregar Dashboard:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
        const hasSeenWelcome = localStorage.getItem('seen_finances_welcome');
        if (!hasSeenWelcome) {
            setShowWelcome(true);
        }
    }, [fetchDashboard]);

    const closeWelcome = useCallback(() => {
        setShowWelcome(false);
        localStorage.setItem('seen_finances_welcome', 'true');
    }, []);

    const { income: totalIncome, expenses: totalExpensesByCtx, balance, invested, fixed } = totals;

    const pieData = useMemo(() => [
        { name: 'Ganhos', value: totalIncome, color: '#2dd4bf' },
        { name: 'Gastos totais', value: totalExpensesByCtx, color: '#ef4444' }
    ], [totalIncome, totalExpensesByCtx]);

    // Handlers
    const confirmDelete = useCallback(async () => {
        if (deletingTxId) {
            try {
                await api.delete('/finances/transaction', { id: deletingTxId });
                toast.success('Movimentação apagada com sucesso', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' }});
                fetchDashboard();
            } catch (err) {
                toast.error('Falha ao excluir', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' }});
            }
            setDeletingTxId(null);
        }
    }, [deletingTxId, fetchDashboard]);

    const saveEdit = useCallback(async (updatedTx: any) => {
        try {
            await api.put('/finances/transaction', updatedTx);
            toast.success('Movimentação atualizada', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' }});
            fetchDashboard();
        } catch (err) {
            toast.error('Falha ao atualizar', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' }});
        }
        setEditingTx(null);
    }, [fetchDashboard]);

    const handleAddTx = useCallback(async (payload: any) => {
        try {
            await api.post('/finances/transaction', payload);
            toast.success('Movimentação registrada!', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' }});
            fetchDashboard();
        } catch (err) {
            toast.error('Erro ao lançar movimentação', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' }});
        }
        setIsAddModalOpen(false);
    }, [fetchDashboard]);

    return (
        <div className={styles.financesContainer}>
            <div className={styles.actionBanner}>
                <div className={styles.actionText}>
                    <h3>Pronto para praticar?</h3>
                    <p>Simule uma nova entrada ou saída para ver o impacto no seu planejamento.</p>
                </div>
                <button
                    className={styles.addStepBtn}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    + Registrar Movimentação
                </button>
            </div>

            <div className={styles.mainDashboard}>
                <div className={styles.chartArea}>
                    <div className={styles.chartSection}>
                        <div className={styles.chartTabs}>
                            <button
                                className={`${styles.tabBtn} ${view === 'resumo' ? styles.activeTab : ''}`}
                                onClick={() => setView('resumo')}
                            >
                                Resumo do Mês
                            </button>
                            <button
                                className={`${styles.tabBtn} ${view === 'historico' ? styles.activeTab : ''}`}
                                onClick={() => setView('historico')}
                            >
                                Histórico (Tendência)
                            </button>
                        </div>

                        <div className={styles.chartDisplay}>
                            {view === 'resumo' ? (
                                <div className={styles.resumoView}>
                                    <div className={styles.resumoContext}>
                                        <header className={styles.resumoHeader}>
                                            <div>
                                                <h3 className={styles.resumoTitle}>Performance Mensal</h3>
                                                <p className={styles.resumoDesc}>Visão detalhada do seu fluxo financeiro.</p>
                                            </div>
                                            <div className={styles.healthBadge}>
                                                <span className={styles.statusDot}></span>
                                                <span>Saúde Estável</span>
                                            </div>
                                        </header>

                                        <div className={styles.balanceHighlight}>
                                            <span className={styles.balanceLabel}>Saldo p/ gastar</span>
                                            {isLoading ? (
                                                <div style={{ height: '36px', width: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                                            ) : (
                                                <span
                                                    className={styles.balanceValueHighlight}
                                                    style={{ color: balance < 0 ? '#ef4444' : '#2dd4bf' }}
                                                >
                                                    R$ {balance.toFixed(2).replace('.', ',')}
                                                </span>
                                            )}
                                            <p className={styles.balanceHint}>Livre após reservas e fixos.</p>
                                        </div>

                                        <div className={styles.dataBreakdown}>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Entradas</span>
                                                {isLoading ? <div style={{ height:'20px', width:'80px', background:'rgba(255,255,255,0.05)', borderRadius:'4px' }}/> : (
                                                    <span className={styles.breakdownValue} style={{ color: '#2dd4bf' }}>
                                                        R$ {totalIncome.toFixed(2).replace('.', ',')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Saídas</span>
                                                {isLoading ? <div style={{ height:'20px', width:'80px', background:'rgba(255,255,255,0.05)', borderRadius:'4px' }}/> : (
                                                    <span className={styles.breakdownValue} style={{ color: '#ef4444' }}>
                                                        R$ {totalExpensesByCtx.toFixed(2).replace('.', ',')}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Investido</span>
                                                {isLoading ? <div style={{ height:'20px', width:'80px', background:'rgba(255,255,255,0.05)', borderRadius:'4px' }}/> : (
                                                    <span className={styles.breakdownValue}>R$ {invested.toFixed(2).replace('.', ',')}</span>
                                                )}
                                            </div>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Total Fixos</span>
                                                {isLoading ? <div style={{ height:'20px', width:'80px', background:'rgba(255,255,255,0.05)', borderRadius:'4px' }}/> : (
                                                    <span className={styles.breakdownValue}>R$ {fixed.toFixed(2).replace('.', ',')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <MonthlyChart data={pieData} />
                                </div>
                            ) : (
                                <div className={styles.historyWrapper}>
                                    <HistoryChart data={historyData} />
                                </div>
                            )}
                        </div>

                        {view === 'resumo' && (
                            <footer className={styles.resumoFooter}>
                                <div className={styles.eduCard}>
                                    <div className={styles.eduIcon}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                                        </svg>
                                    </div>
                                    <div className={styles.eduInfo}>
                                        <p dangerouslySetInnerHTML={{ __html: totals.insight ? `Insight: ${totals.insight}` : "Insight: Mantenha seu planejamento financeiro em dia!" }}></p>
                                    </div>
                                </div>
                                <div className={styles.healthBadge} style={{ background: 'transparent', border: 'none' }}>
                                    <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>Última atualização: Hoje, 22:45</span>
                                </div>
                            </footer>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.recentTransactions}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Transações Recentes</h2>
                    <button
                        className={styles.detailsBtn}
                        style={{ margin: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => setIsHistoryModalOpen(true)}
                    >
                        Ver Tudo
                    </button>
                </div>

                <div className={styles.activityList}>
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className={styles.activityItem} style={{ animation: 'pulse 1.5s infinite' }}>
                                <div className={styles.activityIcon} style={{ background: 'rgba(255,255,255,0.05)' }}></div>
                                <div className={styles.activityMain}>
                                    <div style={{ height: '16px', width: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '6px' }}></div>
                                    <div style={{ height: '12px', width: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                                </div>
                                <div className={styles.activityAmount}>
                                    <div style={{ height: '24px', width: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                                </div>
                            </div>
                        ))
                    ) : transactions.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            Nenhuma transação registrada.
                        </div>
                    ) : (
                        transactions.slice(0, 4).map((tx: Transaction) => (
                            <div key={tx.id} className={styles.activityItem}>
                                <div className={styles.activityIcon} style={{ background: tx.type === 'ganho' ? 'rgba(45, 212, 191, 0.1)' : 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {tx.type === 'ganho' ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                            <polyline points="17 6 23 6 23 12"></polyline>
                                        </svg>
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                                            <polyline points="17 18 23 18 23 12"></polyline>
                                        </svg>
                                    )}
                                </div>
                                <div className={styles.activityMain}>
                                    <span className={styles.activityTitle}>{tx.title}</span>
                                    <span className={styles.activityCategory}>{tx.category} • {tx.date}</span>
                                </div>
                                <div className={`${styles.activityAmount} ${tx.type === 'ganho' ? styles.amountGanho : styles.amountGasto}`}>
                                    {tx.type === 'ganho' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Registro de Nova Movimentação */}
            <AddTransactionModal 
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddTx}
            />

            {/* Modal de Histórico Completo */}
            <HistoryModal 
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                transactions={transactions}
                onEdit={setEditingTx}
                onDelete={setDeletingTxId}
            />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteConfirmModal 
                isOpen={!!deletingTxId}
                onClose={() => setDeletingTxId(null)}
                onConfirm={confirmDelete}
            />

            {/* Modal de Edição */}
            <EditTransactionModal 
                isOpen={!!editingTx}
                transaction={editingTx}
                onClose={() => setEditingTx(null)}
                onSave={saveEdit}
            />

            {/* Modal de Boas-vindas (Onboarding) */}
            <WelcomeModal isOpen={showWelcome} onClose={closeWelcome} />
        </div >
    );
}

