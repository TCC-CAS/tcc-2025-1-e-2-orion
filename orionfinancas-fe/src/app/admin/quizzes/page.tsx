'use client';

import { useMemo, useState } from 'react';
import styles from './Quizzes.module.css';

type AccessStatus = 'ativo' | 'inativo';

interface ModuleItem {
  id: number;
  name: string;
  lessons: number;
  quizzes: number;
  status: AccessStatus;
}

interface QuizItem {
  id: number;
  title: string;
  moduleId: number;
  questions: number;
  attempts: number;
  status: AccessStatus;
}

const INITIAL_MODULES: ModuleItem[] = [
  { id: 1, name: 'Fundamentos Financeiros', lessons: 6, quizzes: 2, status: 'ativo' },
  { id: 2, name: 'Planejamento Mensal', lessons: 5, quizzes: 1, status: 'ativo' },
  { id: 3, name: 'Reserva e Emergências', lessons: 4, quizzes: 2, status: 'inativo' },
  { id: 4, name: 'Introdução a Investimentos', lessons: 8, quizzes: 3, status: 'ativo' }
];

const INITIAL_QUIZZES: QuizItem[] = [
  { id: 1, title: 'Quiz Diagnóstico Inicial', moduleId: 1, questions: 10, attempts: 1240, status: 'ativo' },
  { id: 2, title: 'Quiz de Gastos Fixos vs Variáveis', moduleId: 2, questions: 8, attempts: 980, status: 'ativo' },
  { id: 3, title: 'Quiz Reserva de Emergência', moduleId: 3, questions: 12, attempts: 510, status: 'inativo' },
  { id: 4, title: 'Quiz Perfil de Investidor', moduleId: 4, questions: 15, attempts: 890, status: 'ativo' }
];

export default function AdminQuizzesPage() {
  const [modules, setModules] = useState<ModuleItem[]>(INITIAL_MODULES);
  const [quizzes, setQuizzes] = useState<QuizItem[]>(INITIAL_QUIZZES);

  const moduleMap = useMemo(
    () => new Map(modules.map((item) => [item.id, item.name])),
    [modules]
  );

  const summary = useMemo(() => {
    const activeModules = modules.filter((item) => item.status === 'ativo').length;
    const activeQuizzes = quizzes.filter((item) => item.status === 'ativo').length;
    const blockedAccess = modules.filter((item) => item.status === 'inativo').length;

    return { activeModules, activeQuizzes, blockedAccess };
  }, [modules, quizzes]);

  const toggleModule = (moduleId: number) => {
    setModules((prev) =>
      prev.map((item) =>
        item.id === moduleId
          ? { ...item, status: item.status === 'ativo' ? 'inativo' : 'ativo' }
          : item
      )
    );
  };

  const toggleQuiz = (quizId: number) => {
    setQuizzes((prev) =>
      prev.map((item) =>
        item.id === quizId
          ? { ...item, status: item.status === 'ativo' ? 'inativo' : 'ativo' }
          : item
      )
    );
  };

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>Administração de Quizzes e Módulos</h1>
        <p>
          Controle de acesso do conteúdo educacional. Itens inativos deixam de
          aparecer para os usuários na trilha.
        </p>
      </header>

      <div className={styles.summaryGrid}>
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
          <h2>Módulos</h2>
        </div>
        <div className={styles.tableWrapper}>
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
              {modules.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.lessons}</td>
                  <td>{item.quizzes}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.status === 'ativo' ? styles.active : styles.inactive
                      }`}
                    >
                      {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleModule(item.id)}
                      className={styles.actionBtn}
                    >
                      {item.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2>Quizzes</h2>
        </div>
        <div className={styles.tableWrapper}>
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
              {quizzes.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{moduleMap.get(item.moduleId)}</td>
                  <td>{item.questions}</td>
                  <td>{item.attempts.toLocaleString('pt-BR')}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${
                        item.status === 'ativo' ? styles.active : styles.inactive
                      }`}
                    >
                      {item.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleQuiz(item.id)}
                      className={styles.actionBtn}
                    >
                      {item.status === 'ativo' ? 'Desativar' : 'Ativar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
