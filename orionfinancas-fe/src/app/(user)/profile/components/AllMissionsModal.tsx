"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import styles from '../Profile.module.css';

interface AllMissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    missions: any[];
}

const AllMissionsModal: React.FC<AllMissionsModalProps> = ({
    isOpen,
    onClose,
    missions
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Histórico de Missões"
            maxWidth="600px"
        >
            <div className={styles.statsModalBody}>
                <div className={styles.missionList}>
                    {missions.map((mission, index) => (
                        <div key={index} className={styles.missionItem} style={{ opacity: mission.completed ? 1 : 0.6 }}>
                            <div className={styles.missionCheck} style={{ background: mission.completed ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)' }}>
                                {mission.completed ? '✓' : '○'}
                            </div>
                            <div className={styles.missionDetails}>
                                <p className={styles.missionText}>{mission.title}</p>
                                <span className={styles.missionReward}>{mission.reward}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={styles.modalFooterNote}>
                <Link href="/missions" className={styles.shopLink}>Ir para página de Missões</Link>
            </div>
        </Modal>
    );
};

export default React.memo(AllMissionsModal);
