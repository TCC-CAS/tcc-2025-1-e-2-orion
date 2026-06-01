'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './Users.module.css';
import { api } from '@/services/api';

type UserStatus = 'Ativo' | 'Inativo' | 'Pendente';
type UserFilter = 'Todos' | UserStatus;

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
}

const resolveUserStatus = (status: unknown): UserStatus => {
  if (status === 'Inativo') return 'Inativo';
  if (status === 'Pendente') return 'Pendente';
  return 'Ativo';
};

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<UserFilter>('Todos');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/users/admin');
      if (response.status !== 'OK') {
        throw new Error(response.message || 'Falha ao carregar usuários.');
      }

      const responseData = Array.isArray(response.data) ? response.data : [];
      const normalizedUsers = responseData.map((user: Partial<AdminUser>) => ({
        id: user.id || '',
        name: user.name || 'Usuário sem nome',
        email: user.email || '-',
        role: user.role || 'Aluno',
        status: resolveUserStatus(user.status),
      }));
      setUsers(normalizedUsers);
    } catch (requestError) {
      const message = requestError instanceof Error
        ? requestError.message
        : 'Erro ao carregar usuários.';
      setError(message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (filter === 'Todos') return users;
    return users.filter((user) => user.status === filter);
  }, [filter, users]);

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1>Gestão de Usuários</h1>
        <p>Lista simplificada para revisão de status e permissões.</p>
      </header>

      <div className={styles.filters}>
        {(['Todos', 'Ativo', 'Inativo', 'Pendente'] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`${styles.filterBtn} ${filter === status ? styles.filterActive : ''}`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Carregando usuários...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  <p style={{ marginBottom: '0.75rem' }}>{error}</p>
                  <button
                    type="button"
                    onClick={fetchUsers}
                    className={`${styles.filterBtn} ${styles.filterActive}`}
                  >
                    Tentar novamente
                  </button>
                </td>
              </tr>
            )}
            {!loading && !error && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {!loading && !error && filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      user.status === 'Ativo'
                        ? styles.active
                        : user.status === 'Inativo'
                          ? styles.inactive
                          : styles.pending
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
