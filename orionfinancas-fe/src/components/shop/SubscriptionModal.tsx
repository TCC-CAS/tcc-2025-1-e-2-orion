'use client';

import { useState, useCallback } from 'react';
import { FormField } from '@/components/ui/form/FormField';
import Modal from '@/components/ui/Modal';
import styles from './SubscriptionModal.module.css';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { useUser } from '@/contexts/UserContext';



interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);



  const handleNextFromPlan = async () => {
    if (!selectedPlan) return;
    
    setIsProcessing(true);
    try {
        const res = await api.post('/account/abacatepay-checkout', { plan: selectedPlan });
        if (res.status === 'OK' && res.url) {
            toast.success('Redirecionando para o AbacatePay...', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
            window.location.href = res.url;
            setIsProcessing(false);
            onClose();
        } else {
            toast.error(res.message || 'Erro ao gerar pagamento');
            setIsProcessing(false);
        }
    } catch (err) {
        toast.error('Erro de conexão ao gerar pagamento');
        setIsProcessing(false);
    }
  };

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Escolha seu plano"
        maxWidth="600px"
    >
        <div className={styles.modalBody}>
            <div className={styles.planGrid}>
                <button
                    className={`${styles.planCard} ${selectedPlan === 'monthly' ? styles.planSelected : ''}`}
                    onClick={() => setSelectedPlan('monthly')}
                >
                    <h3 className={styles.planName}>Plano Mensal</h3>
                    <p className={styles.planDesc}>
                    Acesso mensal a todos os conteúdos exclusivos. Cancele quando quiser.
                    </p>
                    <span className={styles.planPrice}>R$ 29,90/mês</span>
                </button>
                <button
                    className={`${styles.planCard} ${selectedPlan === 'annual' ? styles.planSelected : ''}`}
                    onClick={() => setSelectedPlan('annual')}
                >
                    <h3 className={styles.planName}>Plano Anual</h3>
                    <p className={styles.planDesc}>
                    Economize 2 meses! Acesso anual com desconto especial.
                    </p>
                    <span className={styles.planPrice}>R$ 299,00/ano</span>
                </button>
                </div>
                
                <div className={styles.footerActions} style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                    <button
                        className={styles.primaryBtn}
                        onClick={handleNextFromPlan}
                        disabled={!selectedPlan || isProcessing}
                    >
                        {isProcessing ? 'Gerando link seguro...' : 'Ir para Pagamento'}
                    </button>
                </div>
        </div>
    </Modal>
  );
}
