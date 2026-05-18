"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';
import styles from '../Settings.module.css';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showClose={true}
            maxWidth="450px"
        >
            <div className={styles.modalHeader}>
                <h2 style={{ color: '#ff6464' }}>Excluir Conta</h2>
            </div>
            <div className={styles.modalBody}>
                <div className={styles.warningIcon}>
                    <AlertTriangle size={48} color="#ff6464" />
                </div>
                <p className={styles.confirmText}>
                    Tem certeza que deseja <strong>excluir</strong> sua conta?<br />
                    Suas informações serão tratadas conforme nossa política de retenção de dados, e você perderá o acesso às suas lições e conquistas.
                </p>
            </div>
            <div className={styles.modalFooter}>
                <button className={styles.secondaryBtn} onClick={onClose}>
                    Cancelar
                </button>
                <button className={styles.deleteConfirmBtn} onClick={onConfirm}>
                    Confirmar Exclusão
                </button>
            </div>
        </Modal>
    );
};

export default React.memo(DeleteAccountModal);
