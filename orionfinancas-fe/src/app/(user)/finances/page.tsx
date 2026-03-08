"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import styles from './Finances.module.css';
import AddTransactionModal from './components/AddTransactionModal';
import HistoryModal from './components/HistoryModal';
import WelcomeModal from './components/WelcomeModal';
import EditTransactionModal from './components/EditTransactionModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';

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

    useEffect(() => {
        const hasSeenWelcome = localStorage.getItem('seen_finances_welcome');
        if (!hasSeenWelcome) {
            setShowWelcome(true);
        }
    }, []);

    const closeWelcome = useCallback(() => {
        setShowWelcome(false);
        localStorage.setItem('seen_finances_welcome', 'true');
    }, []);

    // Estados para Edição/Exclusão
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [deletingTxId, setDeletingTxId] = useState<number | null>(null);


    // Mock inicial transformado em estado para refletir edições/exclusões
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: 1, type: 'gasto', title: 'Assinatura Spotify', amount: 21.90, date: '04/03/2026', category: 'Lazer' },
        { id: 2, type: 'ganho', title: 'Freelance Design', amount: 1500.00, date: '02/03/2026', category: 'Trabalho' },
        { id: 3, type: 'gasto', title: 'Mercado Central', amount: 156.40, date: '01/03/2026', category: 'Alimentação' },
        { id: 4, type: 'gasto', title: 'Uber - Ida', amount: 15.00, date: '28/02/2026', category: 'Transporte' },
        { id: 5, type: 'gasto', title: 'Aluguel', amount: 1200.00, date: '01/02/2026', category: 'Moradia' },
        { id: 6, type: 'ganho', title: 'Bônus Mensal', amount: 500.00, date: '15/01/2026', category: 'Trabalho' },
        { id: 7, type: 'gasto', title: 'Farmácia', amount: 45.00, date: '20/01/2026', category: 'Saúde' },
        { id: 8, type: 'gasto', title: 'Internet Fibra', amount: 99.00, date: '05/01/2026', category: 'Serviços' },
        { id: 9, type: 'gasto', title: 'Curso Online', amount: 199.00, date: '10/01/2026', category: 'Educação' },
    ]);

    // Cálculo dinâmico baseado no estado
    const totals = useMemo(() => {
        const income = transactions.filter(t => t.type === 'ganho').reduce((acc: number, t: Transaction) => acc + t.amount, 0);
        const expenses = transactions.filter(t => t.type === 'gasto').reduce((acc: number, t: Transaction) => acc + t.amount, 0);
        return { income, expenses, balance: income - expenses - 750 };
    }, [transactions]);

    const { income: totalIncome, expenses: totalExpensesByCtx, balance } = totals;

    const pieData = useMemo(() => [
        { name: 'Ganhos', value: totalIncome, color: '#2dd4bf' },
        { name: 'Gastos', value: totalExpensesByCtx, color: '#ef4444' },
        { name: 'Metas', value: 750, color: '#eab308' },
    ], [totalIncome, totalExpensesByCtx]);

    const historyData = useMemo(() => [
        { month: 'Set', ganhos: 3200, gastos: 2100 },
        { month: 'Out', ganhos: 3500, gastos: 1800 },
        { month: 'Nov', ganhos: 3100, gastos: 2400 },
        { month: 'Dez', ganhos: 4200, gastos: 2900 },
        { month: 'Jan', ganhos: 3800, gastos: 1500 },
        { month: 'Fev', ganhos: totalIncome, gastos: totalExpensesByCtx },
    ], [totalIncome, totalExpensesByCtx]);

    // Handlers
    const confirmDelete = useCallback(() => {
        if (deletingTxId) {
            setTransactions(prev => prev.filter(t => t.id !== deletingTxId));
            setDeletingTxId(null);
        }
    }, [deletingTxId]);

    const saveEdit = useCallback((updatedTx: any) => {
        setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
        setEditingTx(null);
    }, []);

    const handleAddTx = useCallback((payload: any) => {
        const fullPayload = {
            id: Date.now(),
            ...payload
        };
        setTransactions(prev => [fullPayload, ...prev]);
        setIsAddModalOpen(false);
    }, []);

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
                                            <span
                                                className={styles.balanceValueHighlight}
                                                style={{ color: balance < 0 ? '#ef4444' : '#2dd4bf' }}
                                            >
                                                R$ {balance.toFixed(2).replace('.', ',')}
                                            </span>
                                            <p className={styles.balanceHint}>Livre após reservas e fixos.</p>
                                        </div>

                                        <div className={styles.dataBreakdown}>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Entradas</span>
                                                <span className={styles.breakdownValue} style={{ color: '#2dd4bf' }}>
                                                    R$ {totalIncome.toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Saídas</span>
                                                <span className={styles.breakdownValue} style={{ color: '#ef4444' }}>
                                                    R$ {totalExpensesByCtx.toFixed(2).replace('.', ',')}
                                                </span>
                                            </div>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Investido</span>
                                                <span className={styles.breakdownValue}>R$ 750,00</span>
                                            </div>
                                            <div className={styles.breakdownItem}>
                                                <span className={styles.breakdownLabel}>Total Fixos</span>
                                                <span className={styles.breakdownValue}>R$ 1.200,00</span>
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
                                        <p>Insight: Foque em sua <strong>Reserva de Emergência</strong> (meta: 3 meses).</p>
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
                    {transactions.slice(0, 4).map((tx: Transaction) => (
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
                    ))}
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

