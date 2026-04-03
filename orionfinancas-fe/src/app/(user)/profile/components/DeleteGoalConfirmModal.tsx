"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Profile.module.css';

interface DeleteGoalConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteGoalConfirmModal: React.FC<DeleteGoalConfirmModalProps> = ({
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
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ color: '#ef4444', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: '#fff' }}>Excluir Meta?</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '2rem' }}>
                    Esta ação não pode ser desfeita e você perderá o progresso visual desta meta.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className={styles.cancelBtn} onClick={onClose} style={{ width: '100%' }}>Cancelar</button>
                    <button className={styles.confirmBtn} onClick={onConfirm} style={{ background: '#ef4444', width: '100%' }}>Sim, Excluir</button>
                </div>
            </div>
        </Modal>
    );
};

export default React.memo(DeleteGoalConfirmModal);
