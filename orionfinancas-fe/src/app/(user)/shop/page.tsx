"use client";

import { useState, useRef, useCallback, useMemo } from 'react';
import { SubscriptionModal } from '@/components/shop/SubscriptionModal';
import styles from './Shop.module.css';
import { Coins } from 'lucide-react';
import BuyConfirmModal from './components/BuyConfirmModal';

export default function ShopPage() {
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

    const shopItems = useMemo(() => [
        { id: 1, name: "Ícone Clássico", price: 300, type: "icon", img: "/images/avatar.png" },
        { id: 2, name: "Ninja das Finanças", price: 500, type: "icon", img: "/images/avatar1.png" },
        { id: 3, name: "Socialite", price: 800, type: "icon", img: "/images/avatar2.png" },
        { id: 4, name: "Master Invest", price: 1200, type: "icon", img: "/images/avatar3.png" },
        { id: 5, name: "Punk Rock", price: 600, type: "icon", img: "/images/avatar4.png" },
        { id: 6, name: "Astronauta", price: 1500, type: "icon", img: "/images/avatar5.png" },
        { id: 7, name: "Ícone Clássico", price: 300, type: "icon", img: "/images/avatar.png" },
        { id: 8, name: "Ninja das Finanças", price: 500, type: "icon", img: "/images/avatar1.png" },
        { id: 9, name: "Socialite", price: 800, type: "icon", img: "/images/avatar2.png" },
        { id: 10, name: "Master Invest", price: 1200, type: "icon", img: "/images/avatar3.png" },
        { id: 11, name: "Punk Rock", price: 600, type: "icon", img: "/images/avatar4.png" },
        { id: 12, name: "Astronauta", price: 1500, type: "icon", img: "/images/avatar5.png" },
        { id: 13, name: "Ícone Clássico", price: 300, type: "icon", img: "/images/avatar.png" },
        { id: 14, name: "Ninja das Finanças", price: 500, type: "icon", img: "/images/avatar1.png" },
        { id: 15, name: "Socialite", price: 800, type: "icon", img: "/images/avatar2.png" },
        { id: 16, name: "Master Invest", price: 1200, type: "icon", img: "/images/avatar3.png" },
        { id: 17, name: "Punk Rock", price: 600, type: "icon", img: "/images/avatar4.png" },
        { id: 18, name: "Astronauta", price: 1500, type: "icon", img: "/images/avatar5.png" },
        { id: 19, name: "Ícone Clássico", price: 300, type: "icon", img: "/images/avatar.png" },
        { id: 20, name: "Ninja das Finanças", price: 500, type: "icon", img: "/images/avatar1.png" },
        { id: 21, name: "Socialite", price: 800, type: "icon", img: "/images/avatar2.png" },
        { id: 22, name: "Master Invest", price: 1200, type: "icon", img: "/images/avatar3.png" },
        { id: 23, name: "Punk Rock", price: 600, type: "icon", img: "/images/avatar4.png" },
        { id: 24, name: "Astronauta", price: 1500, type: "icon", img: "/images/avatar5.png" },
    ], []);

    const handleBuyClick = useCallback((item: any) => {
        setSelectedItem(item);
    }, []);

    const closeModal = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const confirmPurchase = useCallback(() => {
        if (!selectedItem) return;
        // Aqui viria a lógica de backend
        console.log("Comprado:", selectedItem);
        alert(`Você comprou: ${selectedItem.name}!`);
        setSelectedItem(null);
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
                    {shopItems.map((item) => (
                        <div key={item.id} className={styles.itemCard}>
                            <div className={styles.imageContainer}>
                                <img src={item.img} alt={item.name} className={styles.itemImg} />
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
                    ))}
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
