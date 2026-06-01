"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Settings.module.css';

interface UpdatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    currentPlan: string;
}

const UpdatePlanModal: React.FC<UpdatePlanModalProps> = ({ isOpen, onClose, onConfirm, currentPlan }) => {
    const isGratuito = currentPlan === 'GRATUITO';
    const targetPlanName = isGratuito ? 'Plano Mensal' : 'Plano Anual';
    const targetPrice = isGratuito ? 'R$ 29,90/mês' : 'R$ 289,90/ano';
    const subText = isGratuito ? 'Liberte todo seu potencial financeiro!' : 'Economize mais de 20% mudando para o pagamento anual!';
    const savingsText = isGratuito ? 'Acesso total à plataforma de estudos' : 'Equivale a R$ 24,15 por mês';
    const title = isGratuito ? 'Assinar Plano Mensal' : 'Mudar para Plano Anual';
    const confirmMsg = isGratuito ? 'Assinar Plano Mensal' : 'Confirmar Upgrade Anual';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth="500px"
        >
            <div className={styles.modalBody}>
                <p className={styles.modalSub}>{subText}</p>

                <div className={styles.premiumPlanCard}>
                    <div className={styles.planItemHeader}>
                        <span className={styles.planItemTitle}>{targetPlanName}</span>
                        <span className={styles.planItemPrice}>{targetPrice}</span>
                    </div>
                    <span className={styles.planSavings}>{savingsText}</span>

                    <ul className={styles.planFeatures}>
                        <li><span className={styles.featureCheck}>✓</span> Vidas ilimitadas</li>
                        <li><span className={styles.featureCheck}>✓</span> Sem anúncios</li>
                        <li><span className={styles.featureCheck}>✓</span> Cursos exclusivos de investimento</li>
                    </ul>
                </div>

                <button className={styles.upgradeBtn} onClick={onConfirm}>
                    {confirmMsg}
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
