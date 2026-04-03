'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './Subscriptions.module.css';
import { api } from '@/services/api';

type SubscriptionStatus = 'ativa' | 'renovada' | 'cancelada' | 'pendente';
type SubscriptionFilter = 'todos' | SubscriptionStatus;

interface SubscriptionItem {
  id: string;
  userName: string;
  plan: string;
  status: SubscriptionStatus;
  startedAt: string;
  nextBilling: string;
}

export default function AdminSubscriptionsPage() {
  const [filter, setFilter] = useState<SubscriptionFilter>('todos');
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/subscriptions/admin');
      if (response.status !== 'OK') {
        throw new Error(response.message || 'Falha ao carregar assinaturas.');
      }

      const responseData = Array.isArray(response.data) ? response.data : [];
      setSubscriptions(responseData);
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Erro ao carregar assinaturas.';

      setError(message);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const filteredSubscriptions = useMemo(() => {
    if (filter === 'todos') return subscriptions;
    return subscriptions.filter((item) => item.status === filter);
  }, [filter, subscriptions]);

  const stats = useMemo(() => ({
    active: subscriptions.filter((item) => item.status === 'ativa').length,
    renewed: subscriptions.filter((item) => item.status === 'renovada').length,
    canceled: subscriptions.filter((item) => item.status === 'cancelada').length,
    pending: subscriptions.filter((item) => item.status === 'pendente').length
  }), [subscriptions]);

  const filterButtons: { label: string; value: SubscriptionFilter }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativa', value: 'ativa' },
    { label: 'Renovada', value: 'renovada' },
    { label: 'Cancelada', value: 'cancelada' },
    { label: 'Pendente', value: 'pendente' }
  ];

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>Gestão de Subscriptions</h1>
        <p>
          Controle dos assinantes com status de assinatura e histórico de cobrança.
        </p>
      </header>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span>Ativas</span>
          <strong>{stats.active}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Renovadas</span>
          <strong>{stats.renewed}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Canceladas</span>
          <strong>{stats.canceled}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Pendentes</span>
          <strong>{stats.pending}</strong>
        </article>
      </div>

      <div className={styles.filters}>
        {filterButtons.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`${styles.filterBtn} ${filter === item.value ? styles.filterActive : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={styles.panel}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Início</th>
                <th>Próxima cobrança</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    Carregando assinaturas...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '0.75rem' }}>{error}</p>
                    <button
                      type="button"
                      onClick={fetchSubscriptions}
                      className={`${styles.filterBtn} ${styles.filterActive}`}
                    >
                      Tentar novamente
                    </button>
                  </td>
                </tr>
              )}
              {!loading && !error && filteredSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    Nenhuma assinatura encontrada.
                  </td>
                </tr>
              )}
              {!loading && !error && filteredSubscriptions.map((item) => (
                <tr key={item.id}>
                  <td>{item.userName}</td>
                  <td>{item.plan}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[item.status]}`}>
                      {item.status === 'ativa'
                        ? 'Ativa'
                        : item.status === 'renovada'
                          ? 'Renovada'
                          : item.status === 'cancelada'
                            ? 'Cancelada'
                            : 'Pendente'}
                    </span>
                  </td>
                  <td>{item.startedAt}</td>
                  <td>{item.nextBilling}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
