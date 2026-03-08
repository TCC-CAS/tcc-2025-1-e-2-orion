'use client';

import { Footer } from '@/components/layout/footer/Footer';
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
interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface StatItem {
    id: string;
    label: string;
    value: string;
    icon: React.ReactNode;
}

// Mock data (dados mockados)
const NAV_ITEMS: NavItem[] = [
    { href: '/finances', label: 'Finanças', icon: <Wallet size={20} /> },
    { href: '/learning', label: 'Aprender', icon: <BookOpen size={20} /> },
    { href: '/missions', label: 'Missões', icon: <Target size={20} /> },
    { href: '/goals', label: 'Metas', icon: <Trophy size={20} /> },
    { href: '/shop', label: 'Loja', icon: <ShoppingBag size={20} /> }
];

const USER_STATS: StatItem[] = [
    { id: 'streak', label: 'Ofensiva', value: '5 dias', icon: <Flame size={20} color="#ff4d4d" /> },
    { id: 'lives', label: 'Vidas', value: '5/5', icon: <Heart size={20} color="#ff4d4d" /> },
    { id: 'xp', label: 'XP', value: '1250', icon: <Sparkles size={20} color="#ffb800" /> },
    { id: 'coins', label: 'Moedas', value: '340', icon: <Coins size={20} color="#ffb800" /> }
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    };

    return (
        <div className={styles.userWrapper}>
            <Header variant="logged" />


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
                        {USER_STATS.map((stat) => (
                            <div key={stat.id} className={styles.statItem}>
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
    );
}