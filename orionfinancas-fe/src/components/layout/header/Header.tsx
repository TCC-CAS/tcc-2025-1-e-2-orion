'use client';

import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import styles from './Header.module.css';
import { useState, useRef, useEffect } from "react"

interface HeaderProps {
  variant?: 'public' | 'logged';
  homeHref?: string;
  profileHref?: string;
}

export function Header({ variant = 'public', homeHref, profileHref }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const notifications = [
    {
      id: 1,
      title: 'Resumo diário disponível',
      description: 'Seu resumo financeiro de hoje já está pronto.',
      time: 'Há 5 minutos',
    },
    {
      id: 2,
      title: 'Meta de economia alcançada',
      description: 'Você bateu a meta de economia deste mês. Parabéns!',
      time: 'Há 2 horas',
    },
    {
      id: 3,
      title: 'Nova dica financeira',
      description: 'Confira a nova dica para otimizar seus gastos fixos.',
      time: 'Ontem',
    },
  ];

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
              <Link href="/login" className={`${styles.navLink} ${styles.btnLogin}`}>
                Login / Cadastrar-se
              </Link>
            </nav>
          ) : (
            <div className={styles.actions}>
              <div className={styles.dropdownWrapper} ref={notificationsRef}>
                <button
                  className={styles.iconBtn}
                  onClick={() => setIsNotificationsOpen((prev) => !prev)}
                >
                  <Bell size={20} color="var(--text-primary)" />
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
                            key={notification.id}
                            className={styles.notificationItem}
                          >
                            <div className={styles.notificationTitle}>
                              {notification.title}
                            </div>
                            <div className={styles.notificationDescription}>
                              {notification.description}
                            </div>
                            <span className={styles.notificationTime}>
                              {notification.time}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <Link href={profileHref ?? "/profile"} className={styles.avatar}>
                <img
                  src="/images/avatar.png?v=2"
                  alt="Perfil"
                  className={styles.avatarImg}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.setAttribute('style', 'display: block');
                  }}
                />
                <User size={24} style={{ display: 'none' }} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

