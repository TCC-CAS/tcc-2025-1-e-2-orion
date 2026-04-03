'use client';

import { useMemo, useState, useEffect } from 'react';
import styles from './Feedbacks.module.css';
import { api } from '@/services/api';

interface FeedbackItem {
  id: string; // Changed to string for ObjectId
  userName: string;
  subject: string;
  message: string;
  sentAt: string;
}

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await api.get('/lessons/reviews');
        if (response.status === 'OK') {
          setFeedbacks(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar feedbacks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  const selectedFeedback = useMemo(
    () => feedbacks.find((item) => item.id === selectedFeedbackId) ?? null,
    [feedbacks, selectedFeedbackId]
  );

  const stats = useMemo(() => {
    return { total: feedbacks.length };
  }, [feedbacks]);

  const openFeedback = (id: string) => {
    setSelectedFeedbackId(id);
  };

  const closeModal = () => {
    setSelectedFeedbackId(null);
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>Gestão de Feedbacks</h1>
        <p>
          Acompanhe feedbacks pendentes e respondidos, com controle de envio e
          resposta.
        </p>
      </header>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span>Total de Avaliações</span>
          <strong>{stats.total}</strong>
        </article>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableWrapper}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Carregando avaliações...</div>
          ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Assunto</th>
                <th>Enviado em</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map((item) => (
                <tr key={item.id}>
                  <td>{item.userName}</td>
                  <td>{item.subject}</td>
                  <td>{item.sentAt}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => openFeedback(item.id)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {selectedFeedback && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
            <header className={styles.modalHeader}>
              <h2>{selectedFeedback.subject}</h2>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label="Fechar modal"
              >
                &times;
              </button>
            </header>

            <div className={styles.modalBody}>
              <div className={styles.alertRow}>
                <span className={styles.alertChip}>Enviado em {selectedFeedback.sentAt}</span>
              </div>

              <div className={styles.messageCard}>
                <h3>Mensagem do usuário</h3>
                <p>{selectedFeedback.message}</p>
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={closeModal}>
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
