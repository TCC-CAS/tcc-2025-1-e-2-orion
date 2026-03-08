'use client';

import { useMemo, useState } from 'react';
import styles from './Users.module.css';

type UserStatus = 'Ativo' | 'Inativo' | 'Pendente';
type UserFilter = 'Todos' | UserStatus;

const users: { id: number; name: string; email: string; role: string; status: UserStatus }[] = [
  { id: 1, name: 'Ana Carolina', email: 'ana@orion.com', role: 'Aluno', status: 'Ativo' },
  { id: 2, name: 'Rafael Mendes', email: 'rafael@orion.com', role: 'Aluno', status: 'Pendente' },
  { id: 3, name: 'Marina Souza', email: 'marina@orion.com', role: 'Mentor', status: 'Inativo' },
  { id: 4, name: 'Lucas Martins', email: 'lucas@orion.com', role: 'Admin', status: 'Ativo' }
];

export default function AdminUsersPage() {
  const [filter, setFilter] = useState<UserFilter>('Todos');

  const filteredUsers = useMemo(() => {
    if (filter === 'Todos') return users;
    return users.filter((user) => user.status === filter);
  }, [filter]);

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
            {filteredUsers.map((user) => (
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
