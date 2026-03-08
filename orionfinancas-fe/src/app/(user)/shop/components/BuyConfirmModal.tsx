"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Coins } from 'lucide-react';
import styles from '../Shop.module.css';

interface BuyConfirmModalProps {
    item: any;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const BuyConfirmModal: React.FC<BuyConfirmModalProps> = ({ item, isOpen, onClose, onConfirm }) => {
    if (!item) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showClose={true}
            maxWidth="450px"
        >
            <div className={styles.modalHeader}>
                <div className={styles.modalIcon}>
                    <img src={item.img} alt={item.name} className={styles.modalImg} />
                </div>
                <h3 className={styles.modalTitle}>{item.name}</h3>
            </div>

            <div className={styles.modalBody}>
                <div className={styles.itemDetail}>
                    <div className={styles.itemPrice}>
                        <Coins size={20} color="#ffb800" /> {item.price} moedas
                    </div>
                </div>
                <p className={styles.confirmText}>
                    Tem certeza que deseja adquirir este item?<br />
                    <strong>Essa ação não pode ser desfeita.</strong>
                </p>
            </div>

            <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={onClose}>
                    Cancelar
                </button>
                <button className={styles.confirmBtn} onClick={onConfirm}>
                    Confirmar Compra
                </button>
            </div>
        </Modal>
    );
};

export default React.memo(BuyConfirmModal);
