"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import styles from '../Profile.module.css';

interface AllGoalsModalProps {
    isOpen: boolean;
    onClose: () => void;
    goals: any[];
    onEdit: (goal: any) => void;
    onDelete: (goal: any) => void;
}

const AllGoalsModal: React.FC<AllGoalsModalProps> = ({
    isOpen,
    onClose,
    goals,
    onEdit,
    onDelete
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Todas as Metas"
            maxWidth="600px"
        >
            <div className={styles.statsModalBody}>
                {goals.map((goal, index) => (
                    <div key={index} className={styles.goalRow} style={{ marginBottom: '1.25rem' }}>
                        <div className={styles.goalHeaderRow}>
                            <div className={styles.goalInfo}>
                                <span style={{ fontWeight: 600 }}>{goal.title}</span>
                                <span className={styles.goalPercentage}>{Math.round((goal.current / (goal.target || 1)) * 100)}%</span>
                            </div>
                            <div className={styles.goalActions}>
                                <button
                                    className={styles.editGoalBtn}
                                    onClick={() => onEdit(goal)}
                                    title="Editar meta"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    className={styles.deleteGoalBtn}
                                    onClick={() => onDelete(goal)}
                                    title="Excluir meta"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
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
            <div className={styles.modalFooterNote}>
                <Link href="/goals" className={styles.shopLink}>Ir para página de Metas</Link>
            </div>
        </Modal>
    );
};

export default React.memo(AllGoalsModal);
