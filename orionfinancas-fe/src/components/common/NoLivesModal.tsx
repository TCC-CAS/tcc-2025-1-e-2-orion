'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import styles from './NoLivesModal.module.css';

interface NoLivesModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Timestamp (ms) de quando a próxima vida será regenerada */
    nextRegenAt: number | null;
}

function formatCountdown(ms: number): string {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function NoLivesModal({ isOpen, onClose, nextRegenAt }: NoLivesModalProps) {
    const [remaining, setRemaining] = useState<number>(0);

    const calcRemaining = useCallback(() => {
        if (!nextRegenAt) return 0;
        return Math.max(0, nextRegenAt - Date.now());
    }, [nextRegenAt]);

    useEffect(() => {
        if (!isOpen) return;
        setRemaining(calcRemaining());

        const interval = setInterval(() => {
            const r = calcRemaining();
            setRemaining(r);
            if (r <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, calcRemaining]);

    if (!isOpen) return null;

    const hearts = [0, 1, 2, 3, 4]; // 5 corações, todos vazios

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* Corações vazios */}
                <div className={styles.heartsRow}>
                    {hearts.map((i) => (
                        <Heart
                            key={i}
                            size={32}
                            className={styles.heartEmpty}
                        />
                    ))}
                </div>

                <h2 className={styles.title}>Sem Vidas!</h2>

                <p className={styles.subtitle}>
                    Você ficou sem vidas. Aguarde a recarga automática
                    ou compre mais na Loja para continuar aprendendo.
                </p>

                {/* Timer de recarga */}
                <div className={styles.timerBox}>
                    <span className={styles.timerLabel}>Próxima vida em</span>
                    <span className={styles.timerValue}>
                        {nextRegenAt ? formatCountdown(remaining) : '--:--'}
                    </span>
                    <span className={styles.timerSub}>1 vida regenera a cada 10 minutos</span>
                </div>

                {/* Ações */}
                <div className={styles.actions}>
                    <Link href="/shop" className={styles.btnShop} onClick={onClose}>
                        <ShoppingBag size={18} />
                        Comprar vidas na Loja
                    </Link>
                    <button className={styles.btnClose} onClick={onClose}>
                        Aguardar regeneração
                    </button>
                </div>

                <p className={styles.proPill}>
                    Com o <Link href="/shop">plano PRO</Link> você tem vidas infinitas!
                </p>
            </div>
        </div>
    );
}
