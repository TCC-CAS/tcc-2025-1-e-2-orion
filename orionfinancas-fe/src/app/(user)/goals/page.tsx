
"use client";
import { useState, useCallback } from 'react';
import styles from '../UserLists.module.css';
import GoalModal from './components/GoalModal';
import DeleteGoalModal from './components/DeleteGoalModal';

export default function GoalsPage() {
    const [goals, setGoals] = useState([
        { id: 1, title: "Comprar livro", current: 13.00, target: 50.00, urgency: 'medium', description: 'Para estudar investimentos.', date: '2026-05-20' },
        { id: 2, title: "Guardar 500 reais", current: 450.00, target: 500.00, urgency: 'high', description: 'Meta de economia mensal.', date: '2026-04-10' },
        { id: 3, title: "Economizar dinheiro do almoço", current: 13.00, target: 75.00, urgency: 'low', description: 'Reduzir gastos diários.', date: '' },
    ]);

    const [currentBalance, setCurrentBalance] = useState(1500.00);

    const [initialData, setInitialData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<any>(null);

    const openCreateModal = useCallback(() => {
        setIsEditing(false);
        setEditingId(null);
        setInitialData({
            title: '',
            current: '0',
            target: '',
            date: '',
            description: '',
            urgency: 'medium',
        });
        setIsModalOpen(true);
    }, []);

    const openEditModal = useCallback((goal: any) => {
        setIsEditing(true);
        setEditingId(goal.id);
        setInitialData(goal);
        setIsModalOpen(true);
    }, []);

    const handleSaveGoal = useCallback((data: any) => {
        const targetVal = parseFloat(data.target) || 0;
        const currentVal = parseFloat(data.current) || 0;

        if (isEditing && editingId !== null) {
            const oldGoal = goals.find(g => g.id === editingId);
            if (oldGoal) {
                const diff = currentVal - oldGoal.current;
                setCurrentBalance(prev => prev - diff);

                setGoals(prev => prev.map(g => g.id === editingId ? {
                    ...g,
                    title: data.title,
                    current: currentVal,
                    target: targetVal,
                    date: data.date,
                    description: data.description,
                    urgency: data.urgency,
                } : g));
            }
        } else {
            setCurrentBalance(prev => prev - currentVal);
            const newGoalItem = {
                id: Date.now(),
                title: data.title,
                current: currentVal,
                target: targetVal,
                date: data.date,
                description: data.description,
                urgency: data.urgency,
            };
            setGoals(prev => [...prev, newGoalItem]);
        }
        setIsModalOpen(false);
    }, [isEditing, editingId, goals]);

    const openDeleteModal = useCallback((goal: any) => {
        setGoalToDelete(goal);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDeleteGoal = useCallback(() => {
        if (goalToDelete) {
            setCurrentBalance(prev => prev + goalToDelete.current);
            setGoals(prev => prev.filter(g => g.id !== goalToDelete.id));
            setIsDeleteModalOpen(false);
            setGoalToDelete(null);
        }
    }, [goalToDelete]);

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    Suas <span className={styles.pageHighlight}>Metas</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Crie objetivos financeiros, acompanhe o progresso e mantenha consistência no seu planejamento.
                </p>
            </header>

            <div className={styles.listContainer}>
                <div className={styles.scrollableList}>
                    {goals.map((goal) => (
                        <div key={goal.id} className={styles.card}>
                            <div className={styles.cardInfo} style={{ flex: 1, paddingRight: '0.5rem' }}>
                                <div className={styles.cardTitle}>{goal.title}</div>
                                <div className={styles.cardProgress} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.6rem' }}>
                                    <div>
                                        Alcançado:<br />
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-color)' }}>
                                            R$ {goal.current.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.06)', padding: '0.5rem 1.1rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        Meta: R$ {goal.target.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', marginTop: '1rem', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                                        height: '100%',
                                        background: 'linear-gradient(to right, var(--primary-color), #2dd4bf)',
                                        borderRadius: '6px'
                                    }} />
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <div className={styles.iconActions}>
                                    <button
                                        className={styles.iconBtn}
                                        onClick={() => openDeleteModal(goal)}
                                        title="Excluir meta"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                            <polyline points="3 6 5 6 21 6"></polyline>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                        </svg>
                                    </button>
                                </div>
                                <button
                                    className={styles.depositBtn}
                                    onClick={() => openEditModal(goal)}
                                    title="Gerenciar meta"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    Editar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button className={styles.addBtn} onClick={openCreateModal}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    Adicionar metas
                </button>
            </div>

            <GoalModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                isEditing={isEditing}
                currentBalance={currentBalance}
                initialData={initialData}
                onSubmit={handleSaveGoal}
            />

            <DeleteGoalModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                goalTitle={goalToDelete?.title || ''}
                onConfirm={confirmDeleteGoal}
            />
        </div>
    );
}
