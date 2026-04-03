'use client';

import React from 'react';

import { Header } from '@/components/layout/header/Header';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileQuestion,
  MessageSquareMore,
  CreditCard,
  LogOut,
  Activity,
  AlertTriangle,
  Award
} from 'lucide-react';
import styles from './AdminLayout.module.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/users', label: 'Usuários', icon: <Users size={18} /> },
  { href: '/admin/quizzes', label: 'Quizzes', icon: <FileQuestion size={18} /> },
  { href: '/admin/missions', label: 'Missões', icon: <Award size={18} /> },
  { href: '/admin/feedbacks', label: 'Feedbacks', icon: <MessageSquareMore size={18} /> },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard size={18} /> }
];

export default function AdminLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  const isLoginPage = pathname === '/admin/login';

  React.useEffect(() => {
    if (!isLoginPage) {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        router.push('/admin/login');
      } else {
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [isLoginPage, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  if (isCheckingAuth) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0f172a',
        color: 'white',
        fontFamily: 'Inter, sans-serif'
      }}>
        Carregando...
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className={styles.adminWrapper}>
      <Header variant="logged" homeHref="/admin/dashboard" profileHref="/admin/profile" hideNotifications />

      <div className={styles.appLayout}>
        <aside className={styles.sidebarLeft}>
          <nav className={styles.sidebarNav}>
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  >
                    {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className={`${styles.navItem} ${styles.logoutItem}`}
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left',
              cursor: 'pointer',
              font: 'inherit'
            }}
          >
            <LogOut size={18} />
            Sair
          </button>
        </aside>

        <main className={styles.mainContent}>{children}</main>

        <aside className={styles.sidebarRight}>
          <div className={styles.gamificationPanel}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>
                <Activity size={16} />
              </span>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Status</span>
                <span className={styles.statValue}>Operacional</span>
              </div>
            </div>

            <div className={styles.statusTitle}>
              <Activity size={16} />
              Status da Plataforma
            </div>
            <p>API principal: Operacional</p>
            <p>Fila de jobs: Estável</p>
            <p>Última sincronização: agora</p>

            <div className={styles.statusTitle}>
              <AlertTriangle size={16} />
              Pendências
            </div>
            <p>2 usuários aguardando validação de cadastro.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
