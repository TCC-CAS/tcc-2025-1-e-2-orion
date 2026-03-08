"use client";

import React from 'react';
import styles from '../AdminDashboard.module.css';

interface AdminHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    events: any[];
}

const AdminHistoryModal: React.FC<AdminHistoryModalProps> = ({ isOpen, onClose, events }) => {
    if (!isOpen) return null;

    return (
        <div
            className={styles.modalOverlay}
            onClick={onClose}
        >
            <div
                className={styles.modalContent}
                onClick={(event) => event.stopPropagation()}
            >
                <header className={styles.modalHeader}>
                    <h2>Histórico Administrativo</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        type="button"
                        aria-label="Fechar modal"
                    >
                        &times;
                    </button>
                </header>

                <div className={styles.modalBody}>
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>Evento</th>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th>Data/Hora</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => (
                                <tr key={event.id}>
                                    <td style={{ fontWeight: 700 }}>{event.title}</td>
                                    <td>{event.details}</td>
                                    <td>
                                        <span
                                            className={`${styles.typeIndicator} ${event.type === 'warning'
                                                    ? styles.typeWarning
                                                    : event.type === 'info'
                                                        ? styles.typeInfo
                                                        : styles.typeSuccess
                                                }`}
                                        >
                                            {event.type === 'warning'
                                                ? 'Atenção'
                                                : event.type === 'info'
                                                    ? 'Informativo'
                                                    : 'Sucesso'}
                                        </span>
                                    </td>
                                    <td>{event.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <footer className={styles.modalFooter}>
                    <span className={styles.footerNote}>
                        Exibindo todas as atividades administrativas registradas neste ambiente.
                    </span>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(AdminHistoryModal);
