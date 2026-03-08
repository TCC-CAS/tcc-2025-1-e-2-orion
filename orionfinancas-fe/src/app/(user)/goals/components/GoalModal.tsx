"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../../UserLists.module.css';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    isEditing: boolean;
    currentBalance: number;
    initialData: any;
    onSubmit: (data: any) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({
    isOpen,
    onClose,
    isEditing,
    currentBalance,
    initialData,
    onSubmit
}) => {
    const [formData, setFormData] = useState({
        title: '',
        current: '',
        target: '',
        date: '',
        description: '',
        urgency: 'medium',
    });

    useEffect(() => {
        if (isOpen && initialData) {
            setFormData({
                title: initialData.title || '',
                current: (initialData.current || 0).toString(),
                target: (initialData.target || 0).toString(),
                date: initialData.date || '',
                description: initialData.description || '',
                urgency: initialData.urgency || 'medium',
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Gerenciar Meta' : 'Nova Meta'}
            maxWidth="500px"
        >
            <div className={styles.goalModalHeaderRow}>
                <div className={styles.balanceBox}>
                    <span className={styles.balanceLabel}>Saldo da conta</span>
                    <span className={styles.balanceValue}>R$ {currentBalance.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className={styles.urgencyBox}>
                    <span className={styles.urgencyLabel}>Prioridade</span>
                    <div className={styles.urgencyOptions}>
                        <button
                            type="button"
                            className={`${styles.urgencyPill} ${styles.urgencyLow} ${formData.urgency === 'low' ? styles.urgencySelected : ''}`}
                            onClick={() => setFormData({ ...formData, urgency: 'low' })}
                        >Baixa</button>
                        <button
                            type="button"
                            className={`${styles.urgencyPill} ${styles.urgencyMedium} ${formData.urgency === 'medium' ? styles.urgencySelected : ''}`}
                            onClick={() => setFormData({ ...formData, urgency: 'medium' })}
                        >Média</button>
                        <button
                            type="button"
                            className={`${styles.urgencyPill} ${styles.urgencyHigh} ${formData.urgency === 'high' ? styles.urgencySelected : ''}`}
                            onClick={() => setFormData({ ...formData, urgency: 'high' })}
                        >Alta</button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Título da Meta</label>
                    <input
                        type="text"
                        className={styles.formInput}
                        placeholder="Ex: Viagem de Férias"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Dinheiro reservado (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            className={styles.formInput}
                            style={{ color: 'var(--primary-color)', fontWeight: 700 }}
                            value={formData.current}
                            onChange={(e) => setFormData({ ...formData, current: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Valor Alvo (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            className={styles.formInput}
                            value={formData.target}
                            onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Data Limite</label>
                        <input
                            type="date"
                            className={styles.formInput}
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup} style={{ opacity: formData.target ? 1 : 0.5 }}>
                        <label>Resumo de Progresso</label>
                        <div className={styles.formInput} style={{ background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                            {formData.target ? `${Math.round(((parseFloat(formData.current) || 0) / (parseFloat(formData.target) || 1)) * 100)}% concluído` : 'Defina o alvo'}
                        </div>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Descrição (opcional)</label>
                    <textarea
                        className={styles.formInput}
                        style={{ minHeight: '80px', resize: 'none' }}
                        placeholder="Detalhes sobre sua meta..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className={styles.modalFooter}>
                    <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
                    <button type="submit" className={styles.confirmBtn}>Salvar Alterações</button>
                </div>
            </form>
        </Modal>
    );
};

export default React.memo(GoalModal);
