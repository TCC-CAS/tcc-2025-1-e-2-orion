"use client";

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Profile.module.css';

interface EditGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: any;
    currentBalance: number;
    onSave: (updatedGoal: any) => void;
}

const EditGoalModal: React.FC<EditGoalModalProps> = ({
    isOpen,
    onClose,
    goal,
    currentBalance,
    onSave
}) => {
    const [editForm, setEditForm] = useState({
        title: '',
        current: '',
        target: '',
        date: '',
        description: '',
        urgency: 'medium',
    });

    useEffect(() => {
        if (isOpen && goal) {
            setEditForm({
                title: goal.title,
                current: (goal.current || 0).toString(),
                target: (goal.target || 0).toString(),
                date: goal.date || '',
                description: goal.description || '',
                urgency: goal.urgency || 'medium',
            });
        }
    }, [isOpen, goal]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...editForm,
            target: parseFloat(editForm.target) || 0,
            current: parseFloat(editForm.current) || 0
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Editar Meta"
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
                            className={`${styles.urgencyPill} ${styles.urgencyLow} ${editForm.urgency === 'low' ? styles.urgencySelected : ''}`}
                            onClick={() => setEditForm({ ...editForm, urgency: 'low' })}
                        >Baixa</button>
                        <button
                            type="button"
                            className={`${styles.urgencyPill} ${styles.urgencyMedium} ${editForm.urgency === 'medium' ? styles.urgencySelected : ''}`}
                            onClick={() => setEditForm({ ...editForm, urgency: 'medium' })}
                        >Média</button>
                        <button
                            type="button"
                            className={`${styles.urgencyPill} ${styles.urgencyHigh} ${editForm.urgency === 'high' ? styles.urgencySelected : ''}`}
                            onClick={() => setEditForm({ ...editForm, urgency: 'high' })}
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
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
                            value={editForm.current}
                            onChange={(e) => setEditForm({ ...editForm, current: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Valor Alvo (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            className={styles.formInput}
                            value={editForm.target}
                            onChange={(e) => setEditForm({ ...editForm, target: e.target.value })}
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
                            value={editForm.date}
                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup} style={{ opacity: editForm.target ? 1 : 0.5 }}>
                        <label>Resumo de Progresso</label>
                        <div className={styles.formInput} style={{ background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                            {editForm.target ? `${Math.round(((parseFloat(editForm.current) || 0) / (parseFloat(editForm.target) || 1)) * 100)}% concluído` : 'Defina o alvo'}
                        </div>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label>Descrição (opcional)</label>
                    <textarea
                        className={styles.formInput}
                        style={{ minHeight: '80px', resize: 'none' }}
                        placeholder="Como você planeja alcançar isso?"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
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

export default React.memo(EditGoalModal);
