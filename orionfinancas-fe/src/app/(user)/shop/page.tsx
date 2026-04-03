"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import { SubscriptionModal } from '@/components/shop/SubscriptionModal';
import styles from './Shop.module.css';
import { Coins } from 'lucide-react';
import BuyConfirmModal from './components/BuyConfirmModal';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';

export default function ShopPage() {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [shopItems, setShopItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { refreshProfile } = useUser();

    useEffect(() => {
        setIsLoading(true);
        api.get('/shop/items')
            .then(res => {
                if (res.status === 'OK' && res.data) {
                    setShopItems(res.data);
                }
            })
            .catch(err => console.error('Erro ao buscar itens', err))
            .finally(() => setIsLoading(false));
    }, []);

    const handleBuyClick = useCallback((item: any) => {
        setSelectedItem(item);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const confirmPurchase = useCallback(async () => {
        if (!selectedItem) return;

        try {
            const res = await api.post('/shop/buy', { itemId: selectedItem._id || selectedItem.id });
            if (res.status === 'OK') {
                toast.success(`Você comprou: ${selectedItem.name}!`, { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
                await refreshProfile();
            } else {
                toast.error(res.message || 'Erro ao comprar item', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
            }
        } catch (error: any) {
            console.error('Erro na compra:', error);
            toast.error(error?.response?.data?.message || 'Erro ao efetuar compra.', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
        } finally {
            setSelectedItem(null);
        }
    }, [selectedItem]);

    const scrollAreaRef = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.shopContainer}>
            <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    Sua <span className={styles.pageHighlight}>Loja</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Use suas moedas para desbloquear itens visuais e recursos exclusivos da plataforma.
                </p>
            </header>

            <div
                className={styles.banner}
                onClick={() => setIsSubscriptionModalOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setIsSubscriptionModalOpen(true)}
            >
                <h2 className={styles.bannerTitle}>PLANO DE ASSINATURA</h2>
                <p className={styles.bannerSubtitle}>Desbloqueie conteúdos exclusivos!</p>
            </div>

            <SubscriptionModal
                isOpen={isSubscriptionModalOpen}
                onClose={() => setIsSubscriptionModalOpen(false)}
            />

            <div className={styles.shopScrollArea} ref={scrollAreaRef}>
                <div className={styles.shopGrid}>
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={`skel-${i}`} className={styles.itemCard} style={{ animation: 'pulse 1.5s infinite' }}>
                                <div className={styles.imageContainer} style={{ background: 'rgba(255,255,255,0.05)' }}></div>
                                <div className={styles.itemInfo}>
                                    <div style={{ height: '20px', width: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                                    <div style={{ height: '36px', width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
                                </div>
                            </div>
                        ))
                    ) : shopItems.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', width: '100%', gridColumn: '1 / -1' }}>
                            Nenhum item disponível na loja no momento.
                        </div>
                    ) : (
                        shopItems.map((item) => (
                            <div key={item._id || item.id} className={styles.itemCard}>
                                <div className={styles.imageContainer}>
                                    <img src={item.imageUrl || item.img} alt={item.name} className={styles.itemImg} />
                                </div>

                                <div className={styles.itemInfo}>
                                    <div className={styles.itemPrice}>
                                        <Coins size={20} color="#ffb800" /> {item.price}
                                    </div>
                                    <button
                                        className={styles.buyBtn}
                                        onClick={() => handleBuyClick(item)}
                                    >
                                        Comprar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BuyConfirmModal
                item={selectedItem}
                isOpen={!!selectedItem}
                onClose={closeModal}
                onConfirm={confirmPurchase}
            />
        </div>
    );
}
