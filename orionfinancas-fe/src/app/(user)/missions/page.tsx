"use client";

import { useEffect, useState } from 'react';
import styles from '../UserLists.module.css';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';

import RewardModal from './components/RewardModal';

interface Mission {
    _id: string;
    title: string;
    description: string;
    reward: {
        xp: number;
        coins: number;
    };
    targetCount: number;
    progress: {
        currentCount: number;
        status: 'IN_PROGRESS' | 'COMPLETED' | 'CLAIMED';
    };
}

export default function MissionsPage() {
    const [missions, setMissions] = useState<Mission[]>([]);
    const [loading, setLoading] = useState(true);
    const { refreshProfile } = useUser();
    
    // Reward Modal state
    const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
    const [lastReward, setLastReward] = useState<{ xp: number; coins: number }>({ xp: 0, coins: 0 });

    const fetchMissions = async () => {
        try {
            const response = await api.get('/missions/user');
            if (response.status === 'OK') {
                setMissions(response.data);
            }
        } catch (error) {
            console.error('Erro ao buscar missões:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMissions();
    }, []);

    const handleClaim = async (missionId: string) => {
        try {
            const response = await api.post('/missions/claim', { missionId });
            if (response.status === 'OK') {
                setLastReward({
                    xp: response.reward.xp,
                    coins: response.reward.coins
                });
                setIsRewardModalOpen(true);
                fetchMissions(); // Refresh list
                refreshProfile(); // Refresh sidebar stats
            } else {
                alert(response.message || 'Erro ao resgatar recompensa.');
            }
        } catch (error) {
            console.error('Erro ao resgatar:', error);
            alert('Falha interna ao resgatar recompensa.');
        }
    };

    // Filtra para separar missões em andamento/concluídas de resgatadas
    const activeMissions = missions.filter(m => m.progress.status !== 'CLAIMED');

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    Suas <span className={styles.pageHighlight}>Missões</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Complete desafios para ganhar recompensas e acelerar seu progresso financeiro.
                </p>
            </header>

            <div className={styles.listContainer}>
                <div className={styles.scrollableList}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={`skel-ms-${i}`} className={styles.card} style={{ animation: 'pulse 1.5s infinite' }}>
                                <div className={styles.cardInfo} style={{ flex: 1 }}>
                                    <div style={{ height: '24px', width: '180px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }} />
                                    <div style={{ height: '16px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '16px' }} />
                                    <div style={{ height: '20px', width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }} />
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                                    <div style={{ height: '24px', width: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                                    <div style={{ height: '36px', width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                                </div>
                            </div>
                        ))
                    ) : (
                        <>
                            {activeMissions.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                    Nenhuma missão ativa no momento. Volte mais tarde!
                                </div>
                            )}
                            {activeMissions.map((mission) => (
                                <div key={mission._id} className={styles.card}>
                                    <div className={styles.cardInfo} style={{ flex: 1 }}>
                                        <div className={styles.cardTitle}>{mission.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                            {mission.description}
                                        </div>
                                        <div className={styles.cardProgress} style={{ marginTop: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
                                                <span>Progresso</span>
                                                <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                                                    {mission.progress.currentCount} / {mission.targetCount}
                                                </span>
                                            </div>
                                            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{
                                                    width: `${Math.min((mission.progress.currentCount / mission.targetCount) * 100, 100)}%`,
                                                    height: '100%',
                                                    background: mission.progress.status === 'COMPLETED' ? '#2dd4bf' : 'var(--primary-color)',
                                                    borderRadius: '4px',
                                                    transition: 'width 0.5s ease'
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.8rem' }}>
                                        <div className={styles.cardReward}>
                                            {mission.reward.xp} XP | {mission.reward.coins} Coins
                                        </div>
                                        {mission.progress.status === 'COMPLETED' && (
                                            <button 
                                                className={styles.depositBtn}
                                                onClick={() => handleClaim(mission._id)}
                                            >
                                                Resgatar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                        </>
                    )}
                </div>
            </div>

            <RewardModal 
                isOpen={isRewardModalOpen} 
                onClose={() => setIsRewardModalOpen(false)} 
                reward={lastReward} 
            />
        </div>
    );
}
