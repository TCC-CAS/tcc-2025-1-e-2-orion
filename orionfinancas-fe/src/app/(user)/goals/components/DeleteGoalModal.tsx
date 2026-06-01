"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../../UserLists.module.css';

interface DeleteGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalTitle: string;
    onConfirm: () => void;
}

const DeleteGoalModal: React.FC<DeleteGoalModalProps> = ({
    isOpen,
    onClose,
    goalTitle,
    onConfirm
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showClose={false}
            maxWidth="400px"
        >
            <div style={{ textAlign: 'center' }}>
                <div className={styles.deleteWarningIcon}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>
                <h3 className={styles.modalTitle} style={{ color: '#ef4444' }}>Excluir Meta</h3>
                <p className={styles.depositText} style={{ marginBottom: '2rem' }}>
                    Tem certeza que deseja excluir <strong>"{goalTitle}"</strong>?<br />
                    <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>O dinheiro reservado voltará para seu saldo.</span>
                </p>
                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Manter Meta</button>
                    <button className={`${styles.confirmBtn} ${styles.deleteConfirmBtn}`} onClick={onConfirm}>Sim, Excluir</button>
                </div>
            </div>
        </Modal>
    );
};

export default React.memo(DeleteGoalModal);
