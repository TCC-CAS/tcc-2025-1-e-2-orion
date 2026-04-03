"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import { User } from 'lucide-react';
import styles from '../Profile.module.css';

interface AvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedAvatars: any[];
    currentAvatarImg: string | null;
    onSelect: (img: string | null) => void;
}

const AvatarModal: React.FC<AvatarModalProps> = ({
    isOpen,
    onClose,
    ownedAvatars,
    currentAvatarImg,
    onSelect
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Escolha seu Ícone"
            maxWidth="500px"
        >
            <p className={styles.modalSub}>Sua coleção de ícones comprados na loja:</p>

            <div className={styles.avatarGrid}>
                {ownedAvatars.map((avatar) => (
                    <div
                        key={avatar.id}
                        className={`${styles.avatarOption} ${currentAvatarImg === avatar.img ? styles.selected : ''}`}
                        onClick={() => onSelect(avatar.img)}
                    >
                        <div className={styles.optionCircle}>
                            {avatar.img ? (
                                <img 
                                    src={avatar.img} 
                                    alt={avatar.label} 
                                    className={styles.optionImg} 
                                    style={{ color: 'transparent' }}
                                    onError={(e) => { 
                                        e.currentTarget.style.display = 'none';
                                        (e.currentTarget.parentElement?.querySelector('.fallback-icon-modal') as HTMLElement).style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div 
                                className="fallback-icon-modal" 
                                style={{ 
                                    display: avatar.img ? 'none' : 'flex',
                                    width: '100%',
                                    height: '100%',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '50%',
                                    color: 'rgba(255,255,255,0.4)'
                                }}
                            >
                                <User size={24} />
                            </div>
                        </div>
                        <span>{avatar.label}</span>
                    </div>
                ))}
            </div>
            <div className={styles.modalFooterNote}>
                <Link href="/shop" className={styles.shopLink}>
                    Ir para a loja comprar novos ícones
                </Link>
            </div>
        </Modal>
    );
};

export default React.memo(AvatarModal);
