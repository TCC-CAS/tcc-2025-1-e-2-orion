'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './AdminDashboard.module.css';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

// Componentes extraídos com carregamento dinâmico para performance
const AdminPieChart = dynamic(() => import('./components/AdminPieChart'), { 
    ssr: false,
    loading: () => <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24 }}>Carregando gráfico...</div>
});
const AdminLineChart = dynamic(() => import('./components/AdminLineChart'), { 
    ssr: false,
    loading: () => <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 24 }}>Carregando histórico...</div>
});
const AdminHistoryModal = dynamic(() => import('./components/AdminHistoryModal'), { ssr: false });

type DashboardView = 'resumo' | 'historico' | 'config';

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

export default function AdminDashboardPage() {
  const [view, setView] = useState<DashboardView>('resumo');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalQuizzes: 0, totalSubscriptions: 0 });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // RN15 Settings
  const [settings, setSettings] = useState({ xpPerQuestion: 10, coinsPerQuestion: 5, minPassingScore: 70 });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/account/admin/stats'),
      api.get('/account/admin/activity'),
      api.get('/account/admin/settings')
    ]).then(([statsRes, activityRes, settingsRes]) => {
      if (statsRes.status === 'OK') setStats(statsRes.data);
      if (activityRes.status === 'OK') setActivities(activityRes.data);
      if (settingsRes.status === 'OK') setSettings(settingsRes.data);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await api.put('/account/admin/settings', settings);
      if (res.status === 'OK') {
        toast.success('Configurações atualizadas!');
      }
    } catch (err) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const activeUsers = stats.activeUsers;
  const totalBase = stats.totalUsers || 1;
  const engagementRate = Math.round((activeUsers / totalBase) * 100);

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
            <button
              className={`${styles.tabBtn} ${view === 'config' ? styles.activeTab : ''}`}
              onClick={() => setView('config')}
              type="button"
            >
              Configurações
            </button>
          </div>

          <div className={styles.chartDisplay}>
            {view === 'resumo' ? (
              <div className={styles.resumoView}>
                <div className={styles.chartContainer}>
                    <AdminPieChart data={statusDistribution} activeUsers={activeUsers} />
                </div>

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
            ) : view === 'historico' ? (
                <AdminLineChart data={historyData} />
            ) : (
                <div className={styles.configView}>
                    <form className={styles.settingsForm} onSubmit={handleSaveSettings}>
                        <div className={styles.field}>
                            <label>XP por Questão</label>
                            <input type="number" value={settings.xpPerQuestion} onChange={e => setSettings({...settings, xpPerQuestion: Number(e.target.value)})} />
                        </div>
                        <div className={styles.field}>
                            <label>Moedas por Questão</label>
                            <input type="number" value={settings.coinsPerQuestion} onChange={e => setSettings({...settings, coinsPerQuestion: Number(e.target.value)})} />
                        </div>
                        <div className={styles.field}>
                            <label>Média para Aprovação (%)</label>
                            <input type="number" value={settings.minPassingScore} onChange={e => setSettings({...settings, minPassingScore: Number(e.target.value)})} />
                        </div>
                        <button type="submit" className={styles.saveBtn} disabled={isSavingSettings}>
                            {isSavingSettings ? 'Salvando...' : 'Salvar Parâmetros'}
                        </button>
                    </form>
                </div>
            )}
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.balanceCard}>
            <span className={styles.balanceLabel}>Total de Usuários</span>
            <h2 className={styles.balanceValue}>{stats.totalUsers}</h2>
            <p className={styles.balanceHint}>Base total cadastrada</p>
          </div>

          <div className={styles.miniMetric}>
            <span className={styles.miniLabel}>Quizzes</span>
            <span className={styles.miniValue} style={{ color: '#60a5fa' }}>
              {stats.totalQuizzes}
            </span>
          </div>

          <div className={styles.miniMetric}>
            <span className={styles.miniLabel}>PROs</span>
            <span className={styles.miniValue} style={{ color: '#f59e0b' }}>
              {stats.totalSubscriptions}
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
          {activities.length === 0 && (
             <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.5 }}>Nenhuma atividade recente registrada.</div>
          )}
          {activities.map((event) => (
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
              <div className={styles.activityAmount}>{formatDate(event.date)}</div>
            </div>
          ))}
        </div>
      </div>

      <AdminHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        events={activities} 
      />
    </div>
  );
}
