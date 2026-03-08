
"use client";

import Link from 'next/link';
import { useState, useCallback, useMemo } from 'react';
import styles from './Profile.module.css';
import AvatarModal from './components/AvatarModal';
import StatsModal from './components/StatsModal';
import AllGoalsModal from './components/AllGoalsModal';
import AllMissionsModal from './components/AllMissionsModal';
import EditGoalModal from './components/EditGoalModal';
import DeleteGoalConfirmModal from './components/DeleteGoalConfirmModal';
import Modal from '@/components/ui/Modal';

// Mock data for the profile
const MOCK_USER_DATA = {
    name: "Guilherme Silva",
    currentAvatar: "/images/avatar.png",
    suggestedLesson: {
        title: "Títulos públicos",
        link: "/lessons/titulos-publicos"
    },
    weeklyLessons: [
        { day: 'SEG', count: 3 },
        { day: 'TER', count: 5 },
        { day: 'QUA', count: 2 },
        { day: 'QUI', count: 7 },
        { day: 'SEX', count: 4 },
        { day: 'SAB', count: 8 },
        { day: 'DOM', count: 6 },
    ],
    ownedAvatars: [
        { id: 1, img: '/images/avatar.png', label: 'Personagem' },
        { id: 2, img: '/images/avatar1.png', label: 'Especial 1' },
        { id: 3, img: '/images/avatar2.png', label: 'Especial 2' },
        { id: 4, img: '/images/avatar3.png', label: 'Especial 3' },
    ],
    recentGoals: [
        { title: 'Economizar R$ 500', current: 500, target: 500 },
        { title: 'Investir em Tesouro Direto', current: 1000, target: 1000 },
        { title: 'Fundo de Emergência', current: 3000, target: 5000 },
    ],
    recentMissions: [
        { title: 'Gabarite 3 quizzes perfeitos', reward: '10 moedas' },
        { title: 'Acumule 20 moedas', reward: 'XP Bônus' },
        { title: 'Cumpra 5 missões', reward: 'Badge' },
    ],
    allGoals: [
        { title: 'Economizar R$ 500', current: 500, target: 500, urgency: 'high' },
        { title: 'Investir em Tesouro Direto', current: 1000, target: 1000, urgency: 'medium' },
        { title: 'Fundo de Emergência', current: 3000, target: 5000, urgency: 'high' },
        { title: 'Comprar Notebook', current: 1500, target: 5000, urgency: 'medium' },
        { title: 'Viagem de Férias', current: 800, target: 8000, urgency: 'low' },
    ],
    financeData: {
        currentBalance: 1500.00
    },
    allMissions: [
        { title: 'Gabarite 3 quizzes perfeitos', reward: '10 moedas', completed: true },
        { title: 'Acumule 20 moedas', reward: 'XP Bônus', completed: true },
        { title: 'Cumpra 5 missões', reward: 'Badge', completed: true },
        { title: 'Estude por 2 horas', reward: '5 moedas', completed: false },
        { title: 'Complete um módulo', reward: 'XP extra', completed: false },
        { title: 'Convide um amigo', reward: '15 moedas', completed: false },
        { title: 'Acesse o app por 7 dias', reward: 'Vidas extra', completed: true },
        { title: 'Faça 10 exercícios', reward: 'XP Bônus', completed: true },
        { title: 'Personalize seu perfil', reward: '5 moedas', completed: true },
        { title: 'Alcance o rank Prata', reward: 'Badge Especial', completed: false },
        { title: 'Deposite em uma meta', reward: '10 moedas', completed: false },
        { title: 'Missão Bônus 1', reward: 'XP', completed: true },
        { title: 'Missão Bônus 2', reward: 'Coins', completed: false },
        { title: 'Missão Bônus 3', reward: 'Hearts', completed: false },
    ],
    accountDetails: {
        memberSince: "Janeiro 2024",
        xpWeekly: 450,
        lessonsCompleted: 12,
        bestPerformance: "Módulo 1",
        toughestModule: "Módulo 2",
        totalCoinsEarned: 2450,
        currentStreak: 15,
        rank: "Investidor Prata",
        totalTimeSpent: "42 horas"
    }
};

export default function ProfilePage() {
    const [userData, setUserData] = useState(MOCK_USER_DATA);
    const [activeTab, setActiveTab] = useState<'lessons' | 'goals'>('lessons');
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [isMissionsModalOpen, setIsMissionsModalOpen] = useState(false);
    const [currentAvatarImg, setCurrentAvatarImg] = useState(userData.currentAvatar);

    // Goal Management States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<any>(null);

    // Goal Management Handlers
    const startEditing = useCallback((goal: any) => {
        setSelectedGoal(goal);
        setIsEditModalOpen(true);
    }, []);

    const saveEdit = useCallback((updatedGoal: any) => {
        setUserData(prev => ({
            ...prev,
            allGoals: prev.allGoals.map(g => g.title === selectedGoal.title ? {
                ...g,
                ...updatedGoal
            } : g),
            recentGoals: prev.recentGoals.map(g => g.title === selectedGoal.title ? {
                ...g,
                ...updatedGoal
            } : g)
        }));
        setIsEditModalOpen(false);
        setSelectedGoal(null);
    }, [selectedGoal]);

    const handleDeleteGoal = useCallback((goal: any) => {
        setSelectedGoal(goal);
        setIsDeleteModalOpen(true);
    }, []);

    const confirmDeleteGoal = useCallback(() => {
        if (selectedGoal) {
            setUserData(prev => ({
                ...prev,
                financeData: {
                    ...prev.financeData,
                    currentBalance: prev.financeData.currentBalance + (selectedGoal.current || 0)
                },
                allGoals: prev.allGoals.filter(goal => goal.title !== selectedGoal.title),
                recentGoals: prev.recentGoals.filter(goal => goal.title !== selectedGoal.title)
            }));
            setIsDeleteModalOpen(false);
            setSelectedGoal(null);
        }
    }, [selectedGoal]);

    const maxLessons = useMemo(() => Math.max(...userData.weeklyLessons.map(d => d.count)), [userData.weeklyLessons]);

    return (
        <div className={styles.profileContainer}>
            <div className={styles.userHeader}>
                <div
                    className={styles.avatar}
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Mudar ícone de perfil"
                >
                    <img src={currentAvatarImg} alt="Perfil" className={styles.avatarImg} />
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
                                {userData.recentGoals.map((goal, index) => (
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
                                {userData.recentMissions.map((mission, index) => (
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
                onSelect={(img) => {
                    setCurrentAvatarImg(img);
                    setIsAvatarModalOpen(false);
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
                goals={userData.allGoals}
                onEdit={startEditing}
                onDelete={handleDeleteGoal}
            />

            <AllMissionsModal 
                isOpen={isMissionsModalOpen}
                onClose={() => setIsMissionsModalOpen(false)}
                missions={userData.allMissions}
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

