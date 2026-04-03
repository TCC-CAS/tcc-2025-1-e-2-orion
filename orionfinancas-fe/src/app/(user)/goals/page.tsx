
"use client";
import { useState, useCallback, useEffect } from 'react';
import styles from '../UserLists.module.css';
import GoalModal from './components/GoalModal';
import DeleteGoalModal from './components/DeleteGoalModal';
import { api } from '@/services/api';

export default function GoalsPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentBalance, setCurrentBalance] = useState(0);

    const fetchProfileData = useCallback(async () => {
        try {
            const res = await api.get('/account/profile');
            if (res.status === 'OK' && res.data) {
                setCurrentBalance(res.data.wallet?.balance || 0);
            }
        } catch (err) {
            console.error('Erro ao buscar saldo:', err);
        }
    }, []);

    const [initialData, setInitialData] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState<any>(null);

    const urgencyToColor = (urgency: string) => {
        switch (urgency) {
            case 'low': return '#22c55e';
            case 'medium': return '#eab308';
            case 'high': return '#ef4444';
            default: return '#eab308';
        }
    };

    const colorToUrgency = (color: string) => {
        const c = color?.toLowerCase();
        if (c === '#22c55e') return 'low';
        if (c === '#ef4444') return 'high';
        return 'medium';
    };

    const fetchGoals = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.get('/goals/get-goals');
            if (data.status === 'OK') {
                const mapped = data.allGoals.map((g: any) => ({
                    id: g._id,
                    title: g.goalName,
                    current: g.currentAmount || 0,
                    target: g.targetAmount,
                    urgency: colorToUrgency(g.urgencyColor),
                    description: g.description || '',
                    date: g.targetDate ? new Date(g.targetDate).toISOString().split('T')[0] : ''
                }));
                setGoals(mapped);
            } else {
                setGoals([]);
            }
        } catch (err) {
            console.error('Erro ao carregar metas:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGoals();
        fetchProfileData();
    }, [fetchGoals, fetchProfileData]);

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

    const handleSaveGoal = useCallback(async (data: any) => {
        const targetVal = parseFloat(data.target) || 0;
        const currentVal = parseFloat(data.current) || 0;

        try {
            if (isEditing && editingId) {
                const payload = {
                    _id: editingId,
                    goalName: data.title,
                    targetAmount: targetVal,
                    currentAmount: currentVal,
                    targetDate: data.date,
                    urgencyColor: urgencyToColor(data.urgency),
                    description: data.description
                };
                const res = await api.put('/goals/update-goal', payload);
                if (res.status === 'OK') {
                    fetchGoals();
                }
            } else {
                const payload = {
                    goalName: data.title,
                    targetAmount: targetVal,
                    currentAmount: currentVal,
                    targetDate: data.date,
                    urgencyColor: urgencyToColor(data.urgency),
                    description: data.description
                };
                const res = await api.post('/goals/create-goal', payload);
                if (res.status === 'OK') {
                    fetchGoals();
                }
            }
        } catch (err) {
            console.error('Erro ao salvar meta:', err);
            alert('Erro ao conectar com o servidor');
        }
        setIsModalOpen(false);
    }, [isEditing, editingId, fetchGoals]);

    const openDeleteModal = useCallback((goal: any) => {
        setGoalToDelete(goal);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDeleteGoal = useCallback(async () => {
        if (goalToDelete) {
            try {
                const res = await api.delete('/goals/delete-goal', { _id: goalToDelete.id });
                if (res.status === 'OK') {
                    fetchGoals();
                }
            } catch (err) {
                console.error('Erro ao deletar meta:', err);
            }
            setIsDeleteModalOpen(false);
            setGoalToDelete(null);
        }
    }, [goalToDelete, fetchGoals]);

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
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={`skel-${i}`} className={styles.card} style={{ animation: 'pulse 1.5s infinite' }}>
                                <div className={styles.cardInfo} style={{ flex: 1, paddingRight: '0.5rem' }}>
                                    <div style={{ height: '24px', width: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '1rem' }} />
                                    <div className={styles.cardProgress} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.6rem' }}>
                                        <div style={{ height: '36px', width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                                        <div style={{ height: '36px', width: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }} />
                                    </div>
                                    <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginTop: '1rem' }} />
                                </div>
                                <div className={styles.cardActions} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                    <div style={{ height: '36px', width: '36px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', alignSelf: 'flex-end' }} />
                                    <div style={{ height: '36px', width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                                </div>
                            </div>
                        ))
                    ) : goals.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', width: '100%' }}>
                            Nenhuma meta registrada. Que tal criar uma agora?
                        </div>
                    ) : (
                        goals.map((goal) => (
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
                    )))}
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
