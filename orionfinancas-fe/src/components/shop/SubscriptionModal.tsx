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

type Step = 'plan' | 'payment' | 'card' | 'pix';

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { refreshProfile } = useUser();
  const [step, setStep] = useState<Step>('plan');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | null>(null);

  const [cardData, setCardData] = useState({
    cpf: '',
    cardNumber: '',
    cardholderName: '',
    cvv: '',
    expiry: '',
  });

  const [pixData, setPixData] = useState({
    cpf: '',
    email: '',
  });

  const handleBypassPremium = async () => {
    try {
        const res = await api.post('/account/set-premium', {});
        if (res.status === 'OK') {
            toast.success('Modo Premium ativado via Bypass!', { 
                icon: '🔑',
                style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #eab308' } 
            });
            await refreshProfile();
            onClose();
        }
    } catch (err) {
        toast.error('Erro ao ativar Premium');
    }
  };

  const handleNextFromPlan = useCallback(() => {
    if (selectedPlan) setStep('payment');
  }, [selectedPlan]);

  const handleNextFromPayment = useCallback(() => {
    if (paymentMethod === 'card') setStep('card');
    else if (paymentMethod === 'pix') setStep('pix');
  }, [paymentMethod]);

  const handleSubscribe = useCallback(() => {
    console.log({ selectedPlan, paymentMethod, cardData, pixData });
    toast.success('Assinatura realizada com sucesso! (simulado)', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
    onClose();
    setTimeout(() => {
        setStep('plan');
        setSelectedPlan(null);
        setPaymentMethod(null);
    }, 300);
  }, [selectedPlan, paymentMethod, cardData, pixData, onClose]);

  const handleBack = useCallback(() => {
    if (step === 'payment') setStep('plan');
    else if (step === 'card' || step === 'pix') setStep('payment');
  }, [step]);

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={step === 'plan' ? 'Escolha seu plano' : step === 'payment' ? 'Forma de pagamento' : step === 'card' ? 'Pagamento via cartão' : 'Pagamento via Pix'}
        maxWidth="600px"
    >
        <div className={styles.modalBody}>
            {/* Step 1: Escolha de plano */}
            {step === 'plan' && (
            <>
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
                        disabled={!selectedPlan}
                    >
                        Próximos passos
                    </button>
                    
                    <button 
                        type="button" 
                        onClick={handleBypassPremium} 
                        style={{ 
                            background: 'rgba(234, 179, 8, 0.1)', 
                            color: '#eab308', 
                            border: '1px dashed #eab308', 
                            padding: '10px', 
                            borderRadius: '8px', 
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        ✨ Ativar Premium (Bypass Teste) ✨
                    </button>
                </div>
            </>
            )}

            {/* Step 2: Forma de pagamento */}
            {step === 'payment' && (
            <>
                <div className={styles.paymentOptions}>
                <button
                    className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.optionSelected : ''}`}
                    onClick={() => setPaymentMethod('card')}
                >
                    Cartão
                </button>
                <button
                    className={`${styles.paymentOption} ${paymentMethod === 'pix' ? styles.optionSelected : ''}`}
                    onClick={() => setPaymentMethod('pix')}
                >
                    Pix
                </button>
                </div>
                <div className={styles.footerActions}>
                <button className={styles.secondaryBtn} onClick={handleBack}>
                    Voltar
                </button>
                <button
                    className={styles.primaryBtn}
                    onClick={handleNextFromPayment}
                    disabled={!paymentMethod}
                >
                    Próximos passos
                </button>
                </div>
            </>
            )}

            {/* Step 3a: Pagamento via cartão */}
            {step === 'card' && (
            <>
                <div className={styles.formGrid}>
                <FormField label="CPF">
                    <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={cardData.cpf}
                    onChange={(e) => setCardData({ ...cardData, cpf: e.target.value })}
                    />
                </FormField>
                <FormField label="Número do cartão">
                    <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                    />
                </FormField>
                <FormField label="Nome do titular">
                    <input
                    type="text"
                    placeholder="Nome como no cartão"
                    value={cardData.cardholderName}
                    onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                    />
                </FormField>
                <div className={styles.row}>
                    <FormField label="Validade">
                    <input
                        type="text"
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    />
                    </FormField>
                    <FormField label="CVV">
                    <input
                        type="text"
                        placeholder="123"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    />
                    </FormField>
                </div>
                </div>
                <div className={styles.footerActions}>
                <button className={styles.secondaryBtn} onClick={handleBack}>
                    Voltar
                </button>
                <button className={styles.primaryBtn} onClick={handleSubscribe}>
                    Assinar
                </button>
                </div>
            </>
            )}

            {/* Step 3b: Pagamento via Pix */}
            {step === 'pix' && (
            <>
                <div className={styles.formStack}>
                <FormField label="CPF">
                    <input
                    type="text"
                    placeholder="000.000.000-00"
                    value={pixData.cpf}
                    onChange={(e) => setPixData({ ...pixData, cpf: e.target.value })}
                    />
                </FormField>
                <FormField label="Email">
                    <input
                    type="email"
                    placeholder="seu@email.com"
                    value={pixData.email}
                    onChange={(e) => setPixData({ ...pixData, email: e.target.value })}
                    />
                </FormField>
                <div className={styles.pixPlaceholder}>
                    <span>QR Code ou chave Pix será exibido aqui após preencher os dados.</span>
                </div>
                </div>
                <div className={styles.footerActions}>
                <button className={styles.secondaryBtn} onClick={handleBack}>
                    Voltar
                </button>
                <button className={styles.primaryBtn} onClick={handleSubscribe}>
                    Assinar
                </button>
                </div>
            </>
            )}
        </div>
    </Modal>
  );
}
