"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import styles from '../Settings.module.css';
import { AlertTriangle } from 'lucide-react';

interface CancelSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
    isOpen,
    onClose,
    onConfirm
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cancelar Assinatura"
            maxWidth="400px"
        >
            <div style={{ padding: '1rem 0', textAlign: 'center' }}>
                <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    margin: '0 auto 1.5rem',
                    color: '#ef4444'
                }}>
                    <AlertTriangle size={30} />
                </div>
                
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>
                    Tem certeza disso?
                </h3>
                
                <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                    Ao cancelar sua assinatura PRO, você perderá acesso imediato aos benefícios como <strong>vidas infinitas</strong> e <strong>multiplicadores de recompensas</strong>.
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={onClose}
                        style={{ 
                            flex: 1, 
                            padding: '0.8rem', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                            background: 'transparent',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Manter Plano
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{ 
                            flex: 1, 
                            padding: '0.8rem', 
                            borderRadius: '12px', 
                            border: 'none', 
                            background: '#ef4444',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Confirmar Cancelamento
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CancelSubscriptionModal;
