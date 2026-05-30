'use client';

import Link from 'next/link';
import { Bell, User, Sparkles, Sun, Moon } from 'lucide-react';
import styles from './Header.module.css';
import { useState, useRef, useEffect } from "react";
import { api } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  variant?: 'public' | 'logged';
  homeHref?: string;
  profileHref?: string;
  hideNotifications?: boolean;
  isPremium?: boolean;
  onPremiumClick?: () => void;
  userData?: {
    name?: string;
    avatarUrl?: string | null;
  } | null;
}

export function Header({ 
  variant = 'public', 
  homeHref, 
  profileHref, 
  hideNotifications, 
  userData,
  isPremium,
  onPremiumClick
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const [notifications, setNotifications] = useState<any[]>([]);
  
  const hasUnread = notifications.some(n => !n.read);

  useEffect(() => {
    if (variant === 'logged' && !hideNotifications) {
      api.get('/account/notifications')
        .then(res => {
          if (res.status === 'OK') setNotifications(res.data || []);
        })
        .catch((err: unknown) => {
          const apiError = err as { status?: string | number; message?: string };
          const statusCode = Number(apiError?.status);
          const message = (apiError?.message || '').toLowerCase();
          const isUnauthenticated =
            statusCode === 401 ||
            message.includes('token de acesso não fornecido') ||
            message.includes('token inválido') ||
            message.includes('unauthorized');

          if (!isUnauthenticated) {
            console.error('Erro ao buscar notificações:', err);
          }
        });
    }
  }, [variant, hideNotifications]);

  const formatDistance = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `Há ${diffInSeconds} segundos`;
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Há ${Math.floor(diffInSeconds / 86400)} dias`;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationsToggle = () => {
    if (!isNotificationsOpen && hasUnread) {
      api.put('/account/notifications/mark-read', {})
        .then(() => {
          setNotifications(prev => prev.map(n => ({...n, read: true})));
        })
        .catch(err => console.error('Erro ao ler notificações:', err));
    }
    setIsNotificationsOpen((prev) => !prev);
  };

  return (
    <header className={`${styles.header} ${styles[variant]}`}>
      <div className={styles.container}>
        <div className={styles.headerContent}>
          <Link href={homeHref ?? (variant === 'logged' ? '/learning' : '/')} className={styles.logo}>
            <span className={styles.logoText}>Órion Finanças</span>
          </Link>

          {variant === 'public' ? (
            <nav className={styles.nav}>
              <Link href="/about" className={styles.navLink}>
                Sobre
              </Link>
              <Link href="/userservices" className={styles.navLink}>
                Serviços
              </Link>
              <button
                className={styles.themeBtn}
                onClick={toggleTheme}
                aria-label="Alternar tema"
                title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <Link href="/login" className={`${styles.navLink} ${styles.btnLogin}`}>
                Login / Cadastrar-se
              </Link>
            </nav>
          ) : (
            <div className={styles.actions}>
              <button
                className={styles.themeBtn}
                onClick={toggleTheme}
                aria-label="Alternar tema"
                title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              {!isPremium && (
                <button 
                  className={styles.premiumHeaderBtn}
                  onClick={onPremiumClick}
                >
                  <Sparkles size={16} />
                  <span>Seja PRO</span>
                </button>
              )}
              {!hideNotifications && (
                <div className={styles.dropdownWrapper} ref={notificationsRef}>
                  <button
                    className={styles.iconBtn}
                    onClick={handleNotificationsToggle}
                  >
                    <div style={{ position: 'relative' }}>
                      <Bell size={20} color="var(--text-primary)" />
                      {hasUnread && <span className={styles.unreadBadge}></span>}
                    </div>
                  </button>

                  {isNotificationsOpen && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownTitle}>Notificações</div>

                      {notifications.length === 0 ? (
                        <div className={styles.emptyState}>
                          Nenhuma notificação no momento.
                        </div>
                      ) : (
                        <ul className={styles.notificationList}>
                          {notifications.map((notification) => (
                            <li
                              key={notification.id || notification._id}
                              className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                            >
                              <div className={styles.notificationTitle}>
                                {notification.title}
                              </div>
                              <div className={styles.notificationDescription}>
                                {notification.description}
                              </div>
                              <span className={styles.notificationTime}>
                                {notification.time || formatDistance(notification.createdAt)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              <Link href={profileHref ?? "/profile"} className={styles.avatar}>
                {userData?.avatarUrl ? (
                  <img
                    src={userData.avatarUrl}
                    alt={userData?.name || "Perfil"}
                    className={styles.avatarImg}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const svg = e.currentTarget.nextElementSibling as HTMLElement;
                      if (svg) svg.style.display = 'block';
                    }}
                  />
                ) : null}
                <User 
                  size={24} 
                  style={{ display: userData?.avatarUrl ? 'none' : 'block' }} 
                  color="var(--text-secondary)"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

