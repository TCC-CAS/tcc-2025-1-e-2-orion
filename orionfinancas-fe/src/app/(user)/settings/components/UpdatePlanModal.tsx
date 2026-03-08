"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Settings.module.css';

interface UpdatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const UpdatePlanModal: React.FC<UpdatePlanModalProps> = ({ isOpen, onClose, onConfirm }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Mudar para Plano Anual"
            maxWidth="500px"
        >
            <div className={styles.modalBody}>
                <p className={styles.modalSub}>Economize mais de 20% mudando para o pagamento anual!</p>

                <div className={styles.premiumPlanCard}>
                    <div className={styles.planItemHeader}>
                        <span className={styles.planItemTitle}>Plano Anual</span>
                        <span className={styles.planItemPrice}>R$ 289,90/ano</span>
                    </div>
                    <span className={styles.planSavings}>Equivale a R$ 24,15 por mês</span>

                    <ul className={styles.planFeatures}>
                        <li><span className={styles.featureCheck}>✓</span> Vidas ilimitadas</li>
                        <li><span className={styles.featureCheck}>✓</span> Sem anúncios</li>
                        <li><span className={styles.featureCheck}>✓</span> Cursos exclusivos de investimento</li>
                    </ul>
                </div>

                <button className={styles.upgradeBtn} onClick={onConfirm}>
                    Confirmar Upgrade Anual
                </button>
            </div>
            <div className={styles.modalFooterNote}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    O valor será cobrado imediatamente no seu cartão padrão.
                </p>
            </div>
        </Modal>
    );
};

export default React.memo(UpdatePlanModal);
