"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Finances.module.css';

interface HistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: any[];
    onEdit: (tx: any) => void;
    onDelete: (id: number) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
    isOpen,
    onClose,
    transactions,
    onEdit,
    onDelete
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Histórico de Movimentações"
            maxWidth="900px"
        >
            <div className={styles.modalBody}>
                <table className={styles.historyTable}>
                    <thead>
                        <tr>
                            <th>Tipo</th>
                            <th>Título / Categoria</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td>
                                    <span className={`${styles.typeIndicator} ${tx.type === 'ganho' ? styles.typeGanho : styles.typeGasto}`}>
                                        {tx.type === 'ganho' ? 'Ganho' : 'Gasto'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 700 }}>{tx.title}</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{tx.category}</div>
                                </td>
                                <td style={{ fontWeight: 800, color: tx.type === 'ganho' ? '#2dd4bf' : '#ef4444' }}>
                                    {tx.type === 'ganho' ? '+' : '-'} R$ {tx.amount.toFixed(2).replace('.', ',')}
                                </td>
                                <td style={{ color: 'var(--text-secondary)' }}>{tx.date}</td>
                                <td>
                                    <div className={styles.actionsCell}>
                                        <button
                                            className={`${styles.actionIconBtn} ${styles.editBtn}`}
                                            onClick={() => onEdit(tx)}
                                            title="Editar"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                        </button>
                                        <button
                                            className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                                            onClick={() => onDelete(tx.id)}
                                            title="Excluir"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <footer className={styles.modalFooter}>
                <span className={styles.footerNote}>Exibindo todas as transações (Ambiente Sandbox).</span>
            </footer>
        </Modal>
    );
};

export default React.memo(HistoryModal);
