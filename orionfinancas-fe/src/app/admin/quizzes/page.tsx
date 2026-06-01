'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './Quizzes.module.css';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

interface TrailItem {
  id: string;
  title: string;
  modules: number;
  lessons: number;
  quizzes: number;
  isActive: boolean;
}

interface ModuleItem {
  id: string;
  trailId: string;
  trailTitle: string;
  name: string;
  lessons: number;
  quizzes: number;
  isActive: boolean;
}

interface QuizItem {
  id: string;
  moduleId: string | null;
  moduleName: string;
  title: string;
  questions: number;
  attempts: number;
  isActive: boolean;
}

interface AdminCatalogResponse {
  trails: TrailItem[];
  modules: ModuleItem[];
  quizzes: QuizItem[];
}

export default function AdminQuizzesPage() {
  const [trails, setTrails] = useState<TrailItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingTrailId, setUpdatingTrailId] = useState<string | null>(null);
  const [updatingModuleId, setUpdatingModuleId] = useState<string | null>(null);
  const [updatingQuizId, setUpdatingQuizId] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/quizzes/admin/catalog');
      if (response.status !== 'OK') {
        throw new Error(response.message || 'Falha ao carregar catálogo de quizzes.');
      }

      const data: AdminCatalogResponse = response.data || { trails: [], modules: [], quizzes: [] };
      setTrails(data.trails || []);
      setModules(data.modules || []);
      setQuizzes(data.quizzes || []);
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Erro ao carregar catálogo de quizzes.';
      setError(message);
      setTrails([]);
      setModules([]);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const moduleMap = useMemo(
    () => new Map(modules.map((item) => [item.id, item.name])),
    [modules]
  );

  const summary = useMemo(() => {
    const activeTrails = trails.filter((item) => item.isActive).length;
    const inactiveTrails = trails.filter((item) => !item.isActive).length;
    const activeModules = modules.filter((item) => item.isActive).length;
    const activeQuizzes = quizzes.filter((item) => item.isActive).length;
    const blockedAccess = modules.filter((item) => !item.isActive).length;

    return { activeTrails, inactiveTrails, activeModules, activeQuizzes, blockedAccess };
  }, [trails, modules, quizzes]);

  const toggleTrail = useCallback(async (trailItem: TrailItem) => {
    const nextStatus = !trailItem.isActive;
    setUpdatingTrailId(trailItem.id);

    try {
      const response = await api.put(
        `/quizzes/admin/trails/${trailItem.id}/status`,
        { isActive: nextStatus }
      );

      if (response.status !== 'OK') {
        throw new Error(response.message || 'Erro ao atualizar trilha.');
      }

      toast.success(
        `Trilha ${nextStatus ? 'ativada' : 'desativada'} com cascata para módulos e quizzes.`,
        { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } }
      );

      await fetchCatalog();
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Erro ao atualizar trilha.';

      toast.error(message, {
        style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' }
      });
    } finally {
      setUpdatingTrailId(null);
    }
  }, [fetchCatalog]);

  const toggleModule = useCallback(async (moduleItem: ModuleItem) => {
    const nextStatus = !moduleItem.isActive;
    setUpdatingModuleId(moduleItem.id);

    try {
      const response = await api.put(
        `/quizzes/admin/modules/${moduleItem.id}/status`,
        {
          trailId: moduleItem.trailId,
          isActive: nextStatus
        }
      );

      if (response.status !== 'OK') {
        throw new Error(response.message || 'Erro ao atualizar módulo.');
      }

      toast.success(
        `Módulo ${nextStatus ? 'ativado' : 'desativado'} com sucesso.`,
        { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } }
      );

      await fetchCatalog();
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Erro ao atualizar módulo.';

      toast.error(message, {
        style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' }
      });
    } finally {
      setUpdatingModuleId(null);
    }
  }, [fetchCatalog]);

  const toggleQuiz = useCallback(async (quizItem: QuizItem) => {
    const nextStatus = !quizItem.isActive;
    setUpdatingQuizId(quizItem.id);

    try {
      const response = await api.put(
        `/quizzes/admin/quizzes/${quizItem.id}/status`,
        { isActive: nextStatus }
      );

      if (response.status !== 'OK') {
        throw new Error(response.message || 'Erro ao atualizar quiz.');
      }

      toast.success(
        `Quiz ${nextStatus ? 'ativado' : 'desativado'} com sucesso.`,
        { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } }
      );

      await fetchCatalog();
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Erro ao atualizar quiz.';

      toast.error(message, {
        style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' }
      });
    } finally {
      setUpdatingQuizId(null);
    }
  }, [fetchCatalog]);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>Administração de Trilhas, Quizzes e Módulos</h1>
        <p>
          Controle de acesso do conteúdo educacional. Itens inativos deixam de
          aparecer para os usuários na trilha.
        </p>
      </header>

      <div className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <span>Trilhas ativas</span>
          <strong>{summary.activeTrails}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Trilhas inativas</span>
          <strong>{summary.inactiveTrails}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Módulos ativos</span>
          <strong>{summary.activeModules}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Quizzes ativos</span>
          <strong>{summary.activeQuizzes}</strong>
        </article>
        <article className={styles.summaryCard}>
          <span>Bloqueios de acesso</span>
          <strong>{summary.blockedAccess}</strong>
        </article>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Trilhas</h2>
        </div>
        <div className={styles.tableWrapper}>
          {loading && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Carregando trilhas...</div>
          )}
          {!loading && error && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.75rem' }}>{error}</p>
              <button type="button" className={styles.actionBtn} onClick={fetchCatalog}>
                Tentar novamente
              </button>
            </div>
          )}
          {!loading && !error && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Trilha</th>
                <th>Módulos</th>
                <th>Aulas</th>
                <th>Quizzes</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {trails.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    Nenhuma trilha encontrada.
                  </td>
                </tr>
              )}
              {trails.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.modules}</td>
                  <td>{item.lessons}</td>
                  <td>{item.quizzes}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.isActive ? styles.active : styles.inactive
                      }`}
                    >
                      {item.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleTrail(item)}
                      className={styles.actionBtn}
                      disabled={updatingTrailId === item.id}
                    >
                      {updatingTrailId === item.id
                        ? 'Salvando...'
                        : item.isActive
                          ? 'Desativar'
                          : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Módulos</h2>
        </div>
        <div className={styles.tableWrapper}>
          {loading && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Carregando módulos...</div>
          )}
          {!loading && error && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.75rem' }}>{error}</p>
              <button type="button" className={styles.actionBtn} onClick={fetchCatalog}>
                Tentar novamente
              </button>
            </div>
          )}
          {!loading && !error && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Aulas</th>
                <th>Quizzes</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {modules.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    Nenhum módulo encontrado.
                  </td>
                </tr>
              )}
              {modules.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.name}
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.trailTitle}</div>
                  </td>
                  <td>{item.lessons}</td>
                  <td>{item.quizzes}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.isActive ? styles.active : styles.inactive
                      }`}
                    >
                      {item.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleModule(item)}
                      className={styles.actionBtn}
                      disabled={updatingModuleId === item.id}
                    >
                      {updatingModuleId === item.id
                        ? 'Salvando...'
                        : item.isActive
                          ? 'Desativar'
                          : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Quizzes</h2>
        </div>
        <div className={styles.tableWrapper}>
          {loading && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>Carregando quizzes...</div>
          )}
          {!loading && error && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <p style={{ marginBottom: '0.75rem' }}>{error}</p>
              <button type="button" className={styles.actionBtn} onClick={fetchCatalog}>
                Tentar novamente
              </button>
            </div>
          )}
          {!loading && !error && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Módulo</th>
                <th>Perguntas</th>
                <th>Tentativas</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    Nenhum quiz encontrado.
                  </td>
                </tr>
              )}
              {quizzes.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.moduleId ? moduleMap.get(item.moduleId) || item.moduleName : item.moduleName}</td>
                  <td>{item.questions}</td>
                  <td>{item.attempts.toLocaleString('pt-BR')}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.isActive ? styles.active : styles.inactive
                      }`}
                    >
                      {item.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleQuiz(item)}
                      className={styles.actionBtn}
                      disabled={updatingQuizId === item.id}
                    >
                      {updatingQuizId === item.id
                        ? 'Salvando...'
                        : item.isActive
                          ? 'Desativar'
                          : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </section>
    </section>
  );
}
