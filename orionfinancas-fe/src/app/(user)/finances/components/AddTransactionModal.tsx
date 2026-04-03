"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Finances.module.css';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (tx: any) => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
    isOpen,
    onClose,
    onAdd,
}) => {
    const [formData, setFormData] = useState({
        type: 'gasto' as 'ganho' | 'gasto',
        title: '',
        amount: '',
        category: '',
        isRecurring: false,
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                type: 'gasto',
                title: '',
                amount: '',
                category: '',
                isRecurring: false,
            });
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            amount: parseFloat(formData.amount) || 0,
            date: new Date().toLocaleDateString('pt-BR'),
            isRecurring: formData.isRecurring
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                    <h2>Nova Movimentação</h2>
                </div>
            }
            maxWidth="480px"
        >
            <form className={styles.editForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Tipo de Registro</label>
                    <div className={styles.typeSelectGroup}>
                        <button
                            type="button"
                            className={`${styles.typeOption} ${formData.type === 'ganho' ? styles.activeGanho : ''}`}
                            onClick={() => setFormData({ ...formData, type: 'ganho' })}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="7 7 17 7 17 17"></polyline>
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                            </svg>
                            Entrada
                        </button>
                        <button
                            type="button"
                            className={`${styles.typeOption} ${formData.type === 'gasto' ? styles.activeGasto : ''}`}
                            onClick={() => setFormData({ ...formData, type: 'gasto' })}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="17 17 7 17 7 7"></polyline>
                                <line x1="17" y1="7" x2="7" y2="17"></line>
                            </svg>
                            Saída
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Título da Transação</label>
                    <div className={styles.inputWithIcon}>
                        <div className={styles.inputIcon}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                        </div>
                        <input
                            required
                            className={styles.formInput}
                            placeholder="Ex: Aluguel, Salário, Mercado..."
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles.formRow2}>
                    <div className={styles.formGroup}>
                        <label>Valor</label>
                        <div className={styles.inputWithIcon}>
                            <span className={styles.inputIcon} style={{ fontSize: '0.8rem', fontWeight: 800 }}>R$</span>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className={styles.formInput}
                                placeholder="0,00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Categoria</label>
                        <input
                            required
                            className={styles.formInput}
                            placeholder="Ex: Lazer"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>
                </div>

                <div className={styles.formGroup} style={{ marginTop: '0.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                        <input
                            type="checkbox"
                            checked={formData.isRecurring}
                            onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                            style={{ width: '16px', height: '16px', accentColor: '#2dd4bf' }}
                        />
                        Repetir esta movimentação todos os meses (Fixo)
                    </label>
                </div>

                <div className={styles.confirmActions} style={{ marginTop: '1rem' }}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button type="submit" className={styles.dangerBtn} style={{ background: 'var(--primary-color)' }}>Finalizar Registro</button>
                </div>
            </form>
        </Modal>
    );
};

export default React.memo(AddTransactionModal);
