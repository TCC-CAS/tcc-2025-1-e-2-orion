
"use client";

import Link from 'next/link';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '@/services/api';
import styles from './Profile.module.css';
import AvatarModal from './components/AvatarModal';
import StatsModal from './components/StatsModal';
import AllGoalsModal from './components/AllGoalsModal';
import AllMissionsModal from './components/AllMissionsModal';
import EditGoalModal from './components/EditGoalModal';
import DeleteGoalConfirmModal from './components/DeleteGoalConfirmModal';
import { User } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useUser } from '@/contexts/UserContext';

// Initial empty state for the profile
const INITIAL_USER_DATA = {
    name: "Carregando...",
    currentAvatar: null as string | null,
    suggestedLesson: {
        title: "Carregando...",
        link: "#"
    },
    weeklyLessons: [
        { day: 'SEG', count: 0 },
        { day: 'TER', count: 0 },
        { day: 'QUA', count: 0 },
        { day: 'QUI', count: 0 },
        { day: 'SEX', count: 0 },
        { day: 'SAB', count: 0 },
        { day: 'DOM', count: 0 },
    ],
    ownedAvatars: [
        { id: 'default', img: null as string | null, label: 'Ícone Clássico' }
    ],
    recentGoals: [],
    recentMissions: [],
    allGoals: [],
    financeData: {
        currentBalance: 0
    },
    allMissions: [],
    accountDetails: {
        memberSince: "...",
        xpWeekly: 0,
        lessonsCompleted: 0,
        bestPerformance: "...",
        toughestModule: "...",
        totalCoinsEarned: 0,
        currentStreak: 0,
        rank: "...",
        totalTimeSpent: "..."
    }
};

export default function ProfilePage() {
    const { refreshProfile } = useUser();
    const [userData, setUserData] = useState(INITIAL_USER_DATA);
    const [activeTab, setActiveTab] = useState<'lessons' | 'goals'>('lessons');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
    const [currentAvatarImg, setCurrentAvatarImg] = useState(userData.currentAvatar);

    const [missions, setMissions] = useState<any[]>([]);

    const [goals, setGoals] = useState<any[]>([]);

    const fetchGoals = useCallback(async () => {
        try {
            const data = await api.get('/goals/get-goals');
            if (data.status === 'OK') {
                const colorToUrgency = (color: string) => {
                    const c = color?.toLowerCase();
                    if (c === '#22c55e') return 'low';
                    if (c === '#ef4444') return 'high';
                    return 'medium';
                };
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
            }
        } catch (error) {
            console.error('Erro ao buscar metas:', error);
        }
    }, []);

    useEffect(() => {
        const fetchMissions = async () => {
            try {
                const response = await api.get('/missions/user');
                if (response.status === 'OK') {
                    setMissions(response.data);
                }
            } catch (error) {
                console.error('Erro ao buscar missões:', error);
            }
        };
        const fetchStats = async () => {
            try {
                const res = await api.get('/account/statistics');
                if (res.status === 'OK' && res.data) {
                    setUserData(prev => ({
                        ...prev,
                        accountDetails: res.data.accountDetails,
                        weeklyLessons: res.data.weeklyLessons || prev.weeklyLessons,
                        suggestedLesson: res.data.suggestedLesson || prev.suggestedLesson
                    }));
                }
            } catch (err) {
                console.error('Erro ao buscar estatísticas:', err);
            }
        };

        const fetchBalance = async () => {
            try {
                const res = await api.get('/finances/dashboard');
                if (res.status === 'OK' && res.data) {
                    setUserData(prev => ({
                        ...prev,
                        financeData: {
                            currentBalance: res.data.balance || 0
                        }
                    }));
                }
            } catch (err) {
                console.error('Erro ao buscar saldo:', err);
            }
        };

        const fetchProfile = async () => {
            try {
                const res = await api.get('/account/profile');
                if (res.status === 'OK' && res.data) {
                    const inv = res.data.inventory || [];
                    const mappedAvatars = [{ id: 'default', img: null as string | null, label: 'Ícone Clássico' }];
                    
                    inv.forEach((item: any) => {
                        // Support both populated and unpopulated/mixed item structures
                        const itemData = item.item || item;
                        if (itemData.category === 'OUTFIT' || itemData.type === 'icon' || itemData.imageUrl || itemData.img || item.category === 'OUTFIT') {
                            mappedAvatars.push({
                                id: item.itemId || item._id,
                                img: itemData.imageUrl || itemData.img || null,
                                label: itemData.name || 'Nova Skin'
                            });
                        }
                    });

                    setUserData(prev => ({
                        ...prev,
                        ownedAvatars: mappedAvatars,
                        name: res.data.name || prev.name
                    }));

                    if (res.data.profile?.avatarUrl) {
                        setCurrentAvatarImg(res.data.profile.avatarUrl);
                    }
                }
            } catch (err) {
                console.error('Erro ao buscar perfil:', err);
            }
        };

        fetchMissions();
        fetchGoals();
        fetchStats();
        fetchProfile();
        fetchBalance();
    }, [fetchGoals]);

    const allMissionsMapped = missions.map(m => ({
        title: m.title,
        reward: `${m.reward.xp} XP | ${m.reward.coins} Coins`,
        completed: m.progress.status === 'CLAIMED' || m.progress.status === 'COMPLETED'
    }));

    const recentMissionsList = allMissionsMapped.filter(m => m.completed).slice(0, 3);
    const allGoalsList = goals;
    const recentGoalsList = goals.slice(0, 3);

    // Goal Management States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any>(null);

    // Goal Management Handlers
    const startEditing = useCallback((goal: any) => {
        setSelectedGoal(goal);
        setIsEditModalOpen(true);
    }, []);

    const saveEdit = useCallback(async (updatedGoal: any) => {
        const targetVal = parseFloat(updatedGoal.target) || 0;
        const currentVal = parseFloat(updatedGoal.current) || 0;

        const urgencyToColor = (urgency: string) => {
            switch (urgency) {
                case 'low': return '#22c55e';
                case 'medium': return '#eab308';
                case 'high': return '#ef4444';
                default: return '#eab308';
            }
        };

        try {
            const payload = {
                _id: selectedGoal.id,
                goalName: updatedGoal.title,
                targetAmount: targetVal,
                currentAmount: currentVal,
                targetDate: updatedGoal.date,
                urgencyColor: urgencyToColor(updatedGoal.urgency),
                description: updatedGoal.description
            };
            const res = await api.put('/goals/update-goal', payload);
            if (res.status === 'OK') {
                fetchGoals();
            }
        } catch (err) {
            console.error('Erro ao atualizar meta', err);
        }
        setIsEditModalOpen(false);
        setSelectedGoal(null);
    }, [selectedGoal, fetchGoals]);

    const handleDeleteGoal = useCallback((goal: any) => {
        setSelectedGoal(goal);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDeleteGoal = useCallback(async () => {
        if (selectedGoal) {
            try {
                const res = await api.delete('/goals/delete-goal', { _id: selectedGoal.id });
                if (res.status === 'OK') {
                    fetchGoals();
                }
            } catch (err) {
                console.error('Erro ao deletar meta:', err);
            }
            setIsDeleteModalOpen(false);
            setSelectedGoal(null);
        }
    }, [selectedGoal, fetchGoals]);

    const maxLessons = useMemo(() => Math.max(...userData.weeklyLessons.map(d => d.count)), [userData.weeklyLessons]);

    return (
        <div className={styles.profileContainer}>
            <div className={styles.userHeader}>
                <div
                    className={styles.avatar}
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Mudar ícone de perfil"
                >
                    {currentAvatarImg ? (
                        <img 
                            src={currentAvatarImg} 
                            alt="Perfil" 
                            className={styles.avatarImg} 
                            style={{ color: 'transparent' }}
                            onError={(e) => { 
                                e.currentTarget.style.display = 'none';
                                (e.currentTarget.parentElement?.querySelector('.fallback-icon') as HTMLElement).style.display = 'flex';
                            }}
                        />
                    ) : null}
                    
                    <div 
                        className="fallback-icon" 
                        style={{ 
                            display: currentAvatarImg ? 'none' : 'flex',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '50%',
                            color: 'rgba(255,255,255,0.4)'
                        }}
                    >
                        <User size={48} />
                    </div>

                    <div className={styles.avatarOverlay}>
                        <span>Mudar</span>
                    </div>
                </div>
                <div className={styles.userInfo}>
                    <h1 className={styles.userName}>{userData.name}</h1>
                    <div className={styles.userActions}>
                        <Link href="/settings" className={styles.actionBtn}>Configurações</Link>
                    </div>
                </div>
            </div>

            <div className={styles.toggleTabs}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'lessons' ? styles.active : ''}`}
                    onClick={() => setActiveTab('lessons')}
                >
                    Lições
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'goals' ? styles.active : ''}`}
                    onClick={() => setActiveTab('goals')}
                >
                    Metas / Missões
                </button>
            </div>

            <div className={styles.statsGrid}>
                {activeTab === 'lessons' ? (
                    <>
                        <div className={styles.statsCard}>
                            <h3 className={styles.cardTitle}>Status</h3>
                            <div className={styles.statList}>
                                <div className={styles.statRow}>
                                    <span>Evolução de XP (semanal)</span>
                                    <span className={styles.xpText}>+{userData.accountDetails.xpWeekly} XP</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>Lições concluídas</span>
                                    <span>{userData.accountDetails.lessonsCompleted}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>Melhor desempenho</span>
                                    <span>{userData.accountDetails.bestPerformance}</span>
                                </div>
                                <div className={styles.statRow}>
                                    <span>Mais tentativas</span>
                                    <span>{userData.accountDetails.toughestModule}</span>
                                </div>
                            </div>
                            <button
                                className={styles.detailBtn}
                                onClick={() => setIsStatsModalOpen(true)}
                            >
                                Ver detalhadamente
                            </button>
                        </div>

                        <div className={styles.graphContainer}>
                            <div className={styles.statsCard}>
                                <h3 className={styles.cardTitle} style={{ fontSize: '0.9rem' }}>Lições feitas na última semana</h3>
                                <div className={styles.chartWrapper}>
                                    <div className={styles.graphArea}>
                                        {userData.weeklyLessons.map((item, index) => (
                                            <div key={index} className={styles.barColumn}>
                                                <div
                                                    className={styles.bar}
                                                    style={{ height: `${(item.count / maxLessons) * 100}%` }}
                                                    data-value={item.count}
                                                >
                                                    <span className={styles.tooltip}>{item.count} lições</span>
                                                </div>
                                                <span className={styles.dayLabel}>{item.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className={`${styles.statsCard} ${styles.suggestedLesson}`}>
                                <h3 className={styles.cardTitle}>Aula sugerida:</h3>
                                <p className={styles.suggestedTitle}>{userData.suggestedLesson.title}</p>
                                <Link href={userData.suggestedLesson.link} className={styles.goToLessonBtn}>
                                    Ir a aula
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.statsCard}>
                            <h3 className={styles.cardTitle}>Metas alcançadas recentemente</h3>
                            <div className={styles.statList}>
                                {recentGoalsList.map((goal, index) => (
                                    <div key={index} className={styles.goalRow}>
                                        <div className={styles.goalInfo}>
                                            <span>{goal.title}</span>
                                            <span className={styles.goalPercentage}>{Math.round((goal.current / (goal.target || 1)) * 100)}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${Math.min((goal.current / (goal.target || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className={styles.detailBtn}
                                onClick={() => setIsGoalsModalOpen(true)}
                            >
                                Ver todas metas
                            </button>
                        </div>

                        <div className={styles.statsCard}>
                            <h3 className={styles.cardTitle}>Missões feitas recentemente</h3>
                            <div className={styles.missionList}>
                                {recentMissionsList.map((mission, index) => (
                                    <div key={index} className={styles.missionItem}>
                                        <div className={styles.missionCheck}>✓</div>
                                        <div className={styles.missionDetails}>
                                            <p className={styles.missionText}>{mission.title}</p>
                                            <span className={styles.missionReward}>{mission.reward}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                className={styles.detailBtn}
                                onClick={() => setIsMissionsModalOpen(true)}
                            >
                                Ver todas missões
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Optimized Modal Components */}
            <AvatarModal 
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                ownedAvatars={userData.ownedAvatars}
                currentAvatarImg={currentAvatarImg}
                onSelect={async (img) => {
                    setCurrentAvatarImg(img);
                    setIsAvatarModalOpen(false);
                    try {
                        await api.put('/account/equip-avatar', { avatarUrl: img });
                        await refreshProfile();
                    } catch (err) {
                        console.error('Erro ao atualizar avatar', err);
                    }
                }}
            />

            <StatsModal 
                isOpen={isStatsModalOpen}
                onClose={() => setIsStatsModalOpen(false)}
                accountDetails={userData.accountDetails}
            />

            <AllGoalsModal 
                isOpen={isGoalsModalOpen}
                onClose={() => setIsGoalsModalOpen(false)}
                goals={allGoalsList}
                onEdit={startEditing}
                onDelete={handleDeleteGoal}
            />

            <AllMissionsModal 
                isOpen={isMissionsModalOpen}
                onClose={() => setIsMissionsModalOpen(false)}
                missions={allMissionsMapped}
            />

            <EditGoalModal 
                isOpen={isEditModalOpen}
                goal={selectedGoal}
                currentBalance={userData.financeData.currentBalance}
                onClose={() => setIsEditModalOpen(false)}
                onSave={saveEdit}
            />

            <DeleteGoalConfirmModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteGoal}
            />
        </div>
    );
}

