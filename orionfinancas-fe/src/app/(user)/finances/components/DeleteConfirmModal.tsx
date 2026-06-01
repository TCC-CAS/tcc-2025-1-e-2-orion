"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Finances.module.css';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showClose={false}
            maxWidth="400px"
        >
            <div className={styles.confirmIcon} style={{ color: '#ef4444', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            </div>
            <h3 className={styles.confirmTitle}>Excluir Transação?</h3>
            <p className={styles.confirmDesc}>Esta ação não pode ser desfeita. O valor será removido permanentemente dos cálculos.</p>
            <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                <button className={styles.dangerBtn} onClick={onConfirm}>Sim, Excluir</button>
            </div>
        </Modal>
    );
};

export default React.memo(DeleteConfirmModal);
