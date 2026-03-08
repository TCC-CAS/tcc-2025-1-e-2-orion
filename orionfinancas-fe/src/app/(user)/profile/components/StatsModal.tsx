"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Coins, Flame, Clock } from 'lucide-react';
import styles from '../Profile.module.css';

interface StatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accountDetails: any;
}

const StatsModal: React.FC<StatsModalProps> = ({
    isOpen,
    onClose,
    accountDetails
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Conta"
            maxWidth="500px"
        >
            <div className={styles.statsModalBody}>
                <div className={styles.modalStatRow}>
                    <span>Membro desde:</span>
                    <span>{accountDetails.memberSince}</span>
                </div>
                <div className={styles.modalStatRow}>
                    <span>Evolução de XP (semanal):</span>
                    <span className={styles.xpText}>+{accountDetails.xpWeekly} XP</span>
                </div>
                <div className={styles.modalStatRow}>
                    <span>Lições concluídas:</span>
                    <span>{accountDetails.lessonsCompleted}</span>
                </div>
                <div className={styles.modalStatRow}>
                    <span>Melhor desempenho:</span>
                    <span>{accountDetails.bestPerformance}</span>
                </div>
                <div className={styles.modalStatRow}>
                    <span>Mais tentativas:</span>
                    <span>{accountDetails.toughestModule}</span>
                </div>
                <div className={styles.modalStatRow}>
                    <span>Total de moedas ganhas:</span>
                    <span><Coins size={18} /> {accountDetails.totalCoinsEarned}</span>
                </div>
                <div className={styles.modalStatRow}>
                    <span>Ofensiva atual:</span>
                    <span><Flame size={18} /> {accountDetails.currentStreak} dias</span>
                </div>
                <div className={styles.modalStatRow}>
                    <span>Rank atual:</span>
                    <span className={styles.rankBadge}>{accountDetails.rank}</span>
                </div>
                <div className={styles.modalStatRow} style={{ borderBottom: 'none' }}>
                    <span>Tempo total de estudo:</span>
                    <span><Clock size={18} /> {accountDetails.totalTimeSpent}</span>
                </div>
            </div>
        </Modal>
    );
};

export default React.memo(StatsModal);
