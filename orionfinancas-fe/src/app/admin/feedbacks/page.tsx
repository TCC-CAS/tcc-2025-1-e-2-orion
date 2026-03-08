'use client';

import { useMemo, useState } from 'react';
import styles from './Feedbacks.module.css';

type FeedbackStatus = 'pendente' | 'respondido';
type FeedbackFilter = 'todos' | FeedbackStatus;

interface FeedbackItem {
  id: number;
  userName: string;
  subject: string;
  message: string;
  status: FeedbackStatus;
  sentAt: string;
  respondedAt: string | null;
  response: string | null;
}

const INITIAL_FEEDBACKS: FeedbackItem[] = [
  {
    id: 1,
    userName: 'Marina Souza',
    subject: 'Erro no quiz de investimentos',
    message: 'No fim do quiz, o botão de concluir não habilita.',
    status: 'pendente',
    sentAt: '06/03/2026 08:35',
    respondedAt: null,
    response: null
  },
  {
    id: 2,
    userName: 'Rafael Mendes',
    subject: 'Sugestão de módulo',
    message: 'Seria ótimo um módulo sobre cartão de crédito para iniciantes.',
    status: 'respondido',
    sentAt: '05/03/2026 19:42',
    respondedAt: '05/03/2026 21:15',
    response: 'Sugestão registrada no roadmap do próximo ciclo. Obrigado!'
  },
  {
    id: 3,
    userName: 'Ana Carolina',
    subject: 'Dúvida sobre assinatura',
    message: 'Renovei e o status ainda aparece pendente na minha conta.',
    status: 'pendente',
    sentAt: '04/03/2026 12:10',
    respondedAt: null,
    response: null
  }
];

export default function AdminFeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const [draftResponse, setDraftResponse] = useState('');
  const [filter, setFilter] = useState<FeedbackFilter>('todos');

  const selectedFeedback = useMemo(
    () => feedbacks.find((item) => item.id === selectedFeedbackId) ?? null,
    [feedbacks, selectedFeedbackId]
  );

  const stats = useMemo(() => {
    const pending = feedbacks.filter((item) => item.status === 'pendente').length;
    const answered = feedbacks.filter((item) => item.status === 'respondido').length;
    return { pending, answered, total: feedbacks.length };
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    if (filter === 'todos') return feedbacks;
    return feedbacks.filter((item) => item.status === filter);
  }, [feedbacks, filter]);

  const openFeedback = (id: number) => {
    const target = feedbacks.find((item) => item.id === id);
    setSelectedFeedbackId(id);
    setDraftResponse(target?.response ?? '');
  };

  const closeModal = () => {
    setSelectedFeedbackId(null);
    setDraftResponse('');
  };

  const handleRespond = () => {
    if (!selectedFeedbackId || !draftResponse.trim()) return;

    const now = new Date();
    const respondedAt = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;

    setFeedbacks((prev) =>
      prev.map((item) =>
        item.id === selectedFeedbackId
          ? {
              ...item,
              status: 'respondido',
              response: draftResponse.trim(),
              respondedAt
            }
          : item
      )
    );
    closeModal();
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
          <span>Total</span>
          <strong>{stats.total}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Pendentes</span>
          <strong>{stats.pending}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Respondidos</span>
          <strong>{stats.answered}</strong>
        </article>
      </div>

      <div className={styles.filters}>
        <button
          type="button"
          onClick={() => setFilter('todos')}
          className={`${styles.filterBtn} ${filter === 'todos' ? styles.filterActive : ''}`}
        >
          Todos
        </button>
        <button
          type="button"
          onClick={() => setFilter('pendente')}
          className={`${styles.filterBtn} ${filter === 'pendente' ? styles.filterActive : ''}`}
        >
          Pendentes
        </button>
        <button
          type="button"
          onClick={() => setFilter('respondido')}
          className={`${styles.filterBtn} ${filter === 'respondido' ? styles.filterActive : ''}`}
        >
          Respondidos
        </button>
      </div>

      <div className={styles.panel}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Assunto</th>
                <th>Status</th>
                <th>Enviado em</th>
                <th>Respondido em</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredFeedbacks.map((item) => (
                <tr key={item.id}>
                  <td>{item.userName}</td>
                  <td>{item.subject}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.status === 'respondido' ? styles.answered : styles.pending
                      }`}
                    >
                      {item.status === 'respondido' ? 'Respondido' : 'Pendente'}
                    </span>
                  </td>
                  <td>{item.sentAt}</td>
                  <td>{item.respondedAt ?? '-'}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => openFeedback(item.id)}
                    >
                      {item.status === 'respondido' ? 'Ver resposta' : 'Responder'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                {selectedFeedback.respondedAt && (
                  <span className={styles.alertChip}>
                    Respondido em {selectedFeedback.respondedAt}
                  </span>
                )}
              </div>

              <div className={styles.messageCard}>
                <h3>Mensagem do usuário</h3>
                <p>{selectedFeedback.message}</p>
              </div>

              <div className={styles.responseBlock}>
                <label htmlFor="response">Resposta administrativa</label>
                <textarea
                  id="response"
                  value={draftResponse}
                  onChange={(event) => setDraftResponse(event.target.value)}
                  rows={5}
                  placeholder="Digite a resposta ao feedback..."
                  disabled={selectedFeedback.status === 'respondido'}
                />
              </div>
            </div>

            <footer className={styles.modalFooter}>
              <button type="button" className={styles.secondaryBtn} onClick={closeModal}>
                Fechar
              </button>
              {selectedFeedback.status !== 'respondido' && (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleRespond}
                  disabled={!draftResponse.trim()}
                >
                  Enviar resposta
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
