"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import Link from 'next/link';
import styles from '../Profile.module.css';

interface AvatarModalProps {
    isOpen: boolean;
    onClose: () => void;
    ownedAvatars: any[];
    currentAvatarImg: string;
    onSelect: (img: string) => void;
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
                            <img src={avatar.img} alt={avatar.label} className={styles.optionImg} />
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
