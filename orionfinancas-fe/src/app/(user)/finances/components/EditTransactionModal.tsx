"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Finances.module.css';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
    onSave: (updatedTx: any) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
    isOpen,
    onClose,
    transaction,
    onSave
}) => {
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
        if (isOpen && transaction) {
            setEditForm({ ...transaction });
        }
    }, [isOpen, transaction]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editForm);
    };

    if (!editForm) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Movimentação"
            maxWidth="450px"
        >
            <form className={styles.editForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Título</label>
                    <input
                        className={styles.formInput}
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Valor (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        className={styles.formInput}
                        value={editForm.amount}
                        onChange={e => setEditForm({ ...editForm, amount: parseFloat(e.target.value) || 0 })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Categoria</label>
                    <input
                        className={styles.formInput}
                        value={editForm.category}
                        onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.confirmActions} style={{ marginTop: '1rem' }}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button type="submit" className={styles.dangerBtn} style={{ background: 'var(--primary-color)' }}>Salvar Alterações</button>
                </div>
            </form>
        </Modal>
    );
};

export default React.memo(EditTransactionModal);
