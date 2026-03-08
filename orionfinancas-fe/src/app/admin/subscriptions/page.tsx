import styles from './Subscriptions.module.css';

type SubscriptionStatus = 'ativa' | 'renovada' | 'cancelada' | 'pendente';

interface SubscriptionItem {
  id: number;
  userName: string;
  plan: string;
  status: SubscriptionStatus;
  startedAt: string;
  nextBilling: string;
}

const subscriptions: SubscriptionItem[] = [
  { id: 1, userName: 'Lucas Martins', plan: 'Premium Mensal', status: 'ativa', startedAt: '02/01/2026', nextBilling: '02/04/2026' },
  { id: 2, userName: 'Marina Souza', plan: 'Premium Anual', status: 'renovada', startedAt: '20/03/2025', nextBilling: '20/03/2027' },
  { id: 3, userName: 'Rafael Mendes', plan: 'Premium Mensal', status: 'cancelada', startedAt: '12/09/2025', nextBilling: '-' },
  { id: 4, userName: 'Ana Carolina', plan: 'Premium Mensal', status: 'pendente', startedAt: '05/03/2026', nextBilling: '05/04/2026' }
];

export default function AdminSubscriptionsPage() {
  const stats = {
    active: subscriptions.filter((item) => item.status === 'ativa').length,
    renewed: subscriptions.filter((item) => item.status === 'renovada').length,
    canceled: subscriptions.filter((item) => item.status === 'cancelada').length,
    pending: subscriptions.filter((item) => item.status === 'pendente').length
  };

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
              {subscriptions.map((item) => (
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
