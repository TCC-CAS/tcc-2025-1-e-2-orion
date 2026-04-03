'use client';

import { Header } from '@/components/layout/header/Header';
import styles from './UserLayout.module.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Wallet,
    BookOpen,
    Target,
    Trophy,
    ShoppingBag,
    LogOut,
    Flame,
    Heart,
    Sparkles,
    Coins
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState, useRef } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

// Nav items
const NAV_ITEMS: NavItem[] = [
    { href: '/finances', label: 'Finanças', icon: <Wallet size={20} /> },
    { href: '/learning', label: 'Aprender', icon: <BookOpen size={20} /> },
    { href: '/missions', label: 'Missões', icon: <Target size={20} /> },
    { href: '/goals', label: 'Metas', icon: <Trophy size={20} /> },
    { href: '/shop', label: 'Loja', icon: <ShoppingBag size={20} /> }
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, stats: userStats, refreshProfile } = useUser();
    const [animateLives, setAnimateLives] = useState(false);
    const lastLivesRef = useRef(userStats.lives);

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    useEffect(() => {
        if (lastLivesRef.current !== userStats.lives) {
            const lastNum = parseInt(lastLivesRef.current.split('/')[0]) || 0;
            const currNum = parseInt(userStats.lives.split('/')[0]) || 0;
            if (currNum < lastNum) {
                setAnimateLives(true);
                const timer = setTimeout(() => setAnimateLives(false), 500);
                return () => clearTimeout(timer);
            }
        }
        lastLivesRef.current = userStats.lives;
    }, [userStats.lives]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    const stats = [
        { id: 'streak', label: 'Ofensiva', value: userStats.streak, icon: <Flame size={20} color="#ff4d4d" /> },
        { id: 'lives', label: 'Vidas', value: userStats.lives, icon: <Heart size={20} color="#ff4d4d" /> },
        { id: 'xp', label: 'XP', value: userStats.xp, icon: <Sparkles size={20} color="#ffb800" /> },
        { id: 'coins', label: 'Moedas', value: userStats.coins, icon: <Coins size={20} color="#ffb800" /> }
    ];

    return (
        <AuthGuard>
            <div className={styles.userWrapper}>
                <Header variant="logged" userData={user} />

                <div className={styles.appLayout}>
                    <aside className={styles.sidebarLeft}>
                        <nav className={styles.sidebarNav}>
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navItem} ${pathname === item.href || pathname.startsWith(item.href + '/')
                                        ? styles.active
                                        : ''
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <Link
                            href="/"
                            onClick={handleLogout}
                            className={`${styles.navItem} ${styles.logoutItem}`}
                        >
                            <LogOut size={20} />
                            Sair
                        </Link>
                    </aside>

                    <main className={styles.mainContent}>{children}</main>

                    <aside className={styles.sidebarRight}>
                        <div className={styles.gamificationPanel}>
                            {stats.map((stat) => (
                                <div 
                                    key={stat.id} 
                                    className={`${styles.statItem} ${stat.id === 'lives' && animateLives ? styles.lifeLostAnimate : ''}`}
                                >
                                    <span className={styles.statIcon}>
                                        {stat.icon}
                                    </span>
                                    <div className={styles.statInfo}>
                                        <span className={styles.statLabel}>{stat.label}</span>
                                        <span className={styles.statValue}>{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>
        </AuthGuard>
    );
}