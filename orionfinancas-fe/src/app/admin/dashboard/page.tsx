'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './AdminDashboard.module.css';

// Componentes extraídos com carregamento dinâmico para performance
const AdminPieChart = dynamic(() => import('./components/AdminPieChart'), { 
    ssr: false,
    loading: () => <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24 }}>Carregando gráfico de base...</div>
});
const AdminLineChart = dynamic(() => import('./components/AdminLineChart'), { 
    ssr: false,
    loading: () => <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24 }}>Carregando histórico de usuários...</div>
});
const AdminHistoryModal = dynamic(() => import('./components/AdminHistoryModal'), { ssr: false });

type DashboardView = 'resumo' | 'historico';

const historyData = [
  { month: 'Set', activeUsers: 860, newSignups: 74, reactivated: 18 },
  { month: 'Out', activeUsers: 910, newSignups: 82, reactivated: 22 },
  { month: 'Nov', activeUsers: 980, newSignups: 95, reactivated: 19 },
  { month: 'Dez', activeUsers: 1050, newSignups: 102, reactivated: 28 },
  { month: 'Jan', activeUsers: 1160, newSignups: 124, reactivated: 33 },
  { month: 'Fev', activeUsers: 1284, newSignups: 96, reactivated: 30 }
];

const statusDistribution = [
  { name: 'Ativos', value: 1284, color: '#2dd4bf' },
  { name: 'Pendentes', value: 96, color: '#f59e0b' },
  { name: 'Inativos', value: 214, color: '#ef4444' }
];

const recentAdminEvents = [
  {
    id: 1,
    title: 'Lote de validação concluído',
    details: '32 perfis revisados no onboarding',
    date: 'Hoje, 09:12',
    type: 'success'
  },
  {
    id: 2,
    title: 'Aumento de novos cadastros',
    details: 'Pico de +18% nas últimas 24h',
    date: 'Hoje, 07:40',
    type: 'info'
  },
  {
    id: 3,
    title: 'Alerta de tickets pendentes',
    details: '2 solicitações críticas aguardando resposta',
    date: 'Ontem, 20:33',
    type: 'warning'
  },
  {
    id: 4,
    title: 'Reativação de usuários',
    details: '30 contas voltaram a interagir este mês',
    date: 'Ontem, 14:10',
    type: 'success'
  }
];

export default function AdminDashboardPage() {
  const [view, setView] = useState<DashboardView>('resumo');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const activeUsers = historyData[historyData.length - 1].activeUsers;
  const newSignups = historyData[historyData.length - 1].newSignups;
  const reactivated = historyData[historyData.length - 1].reactivated;

  const engagementRate = useMemo(() => {
    const totalBase = 1594;
    return Math.round((activeUsers / totalBase) * 100);
  }, [activeUsers]);

  return (
    <div className={styles.adminContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Painel Administrativo</h1>
        <p className={styles.pageSubtitle}>
          Monitore atividade da base, novos cadastros e performance operacional em
          tempo real.
        </p>
      </header>

      <div className={styles.mainDashboard}>
        <div className={styles.chartSection}>
          <div className={styles.chartTabs}>
            <button
              className={`${styles.tabBtn} ${view === 'resumo' ? styles.activeTab : ''}`}
              onClick={() => setView('resumo')}
              type="button"
            >
              Resumo do Mês
            </button>
            <button
              className={`${styles.tabBtn} ${view === 'historico' ? styles.activeTab : ''}`}
              onClick={() => setView('historico')}
              type="button"
            >
              Histórico de Usuários
            </button>
          </div>

          <div className={styles.chartDisplay}>
            {view === 'resumo' ? (
              <div className={styles.resumoView}>
                <AdminPieChart data={statusDistribution} activeUsers={activeUsers} />

                <div className={styles.resumoContext}>
                  <h4>Situação atual da base</h4>
                  <p>
                    A distribuição mostra concentração saudável de usuários ativos,
                    com volume de pendências sob controle no funil de entrada.
                  </p>
                  <div className={styles.healthStatus}>
                    <span className={styles.statusDot} />
                    <span>
                      Status geral: <strong>Operação Estável</strong>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
                <AdminLineChart data={historyData} />
            )}
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>Usuários ativos (mês)</span>
            <h2 className={styles.balanceValue}>{activeUsers}</h2>
            <p className={styles.balanceHint}>+124 em relação ao mês anterior</p>
          </div>

          <div className={styles.miniMetric}>
            <span className={styles.miniLabel}>Novos</span>
            <span className={styles.miniValue} style={{ color: '#60a5fa' }}>
              {newSignups}
            </span>
          </div>

          <div className={styles.miniMetric}>
            <span className={styles.miniLabel}>Reativados</span>
            <span className={styles.miniValue} style={{ color: '#f59e0b' }}>
              {reactivated}
            </span>
          </div>

          <div className={styles.primeCard}>
            <div className={styles.primeHeader}>
              <span className={styles.primeLabel}>Engajamento da base</span>
              <span className={styles.primeTag}>Meta</span>
            </div>
            <div className={styles.primeBody}>
              <span className={styles.primeValue}>{engagementRate}%</span>
              <div className={styles.primeProgress}>
                <div className={styles.progressFill} style={{ width: `${engagementRate}%` }} />
              </div>
              <p>Meta definida: 80% de atividade recorrente.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            Atividades Administrativas Recentes
          </h2>
          <button
            className={styles.detailsBtn}
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            Ver tudo
          </button>
        </div>

        <div className={styles.activityList}>
          {recentAdminEvents.map((event) => (
            <div key={event.id} className={styles.activityItem}>
              <div
                className={styles.activityIcon}
                style={{
                  background:
                    event.type === 'warning'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : event.type === 'info'
                        ? 'rgba(96, 165, 250, 0.12)'
                        : 'rgba(45, 212, 191, 0.12)',
                  color:
                    event.type === 'warning'
                      ? '#f59e0b'
                      : event.type === 'info'
                        ? '#60a5fa'
                        : '#2dd4bf'
                }}
              >
                {event.type === 'warning' ? '!' : event.type === 'info' ? 'i' : 'ok'}
              </div>
              <div className={styles.activityMain}>
                <span className={styles.activityTitle}>{event.title}</span>
                <span className={styles.activityCategory}>{event.details}</span>
              </div>
              <div className={styles.activityAmount}>{event.date}</div>
            </div>
          ))}
        </div>
      </div>

      <AdminHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        events={recentAdminEvents} 
      />
    </div>
  );
}
