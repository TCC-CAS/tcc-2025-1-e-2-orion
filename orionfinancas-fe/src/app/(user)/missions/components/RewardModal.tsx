"use client";

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Trophy, Star, Coins, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface RewardModalProps {
    isOpen: boolean;
    onClose: () => void;
    reward: {
        xp: number;
        coins: number;
    };
    title?: string;
}

const RewardModal: React.FC<RewardModalProps> = ({
    isOpen,
    onClose,
    reward,
    title = "Missão Resgatada!"
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-color)' }}>
                    <Trophy size={20} />
                    <span style={{ fontWeight: 800 }}>{title}</span>
                </div>
            }
            maxWidth="400px"
        >
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '1rem 0',
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                    style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(0, 200, 150, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)',
                        marginBottom: '1.5rem',
                        boxShadow: '0 0 30px rgba(0, 200, 150, 0.2)'
                    }}
                >
                    <CheckCircle2 size={48} />
                </motion.div>

                <h3 style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 800, 
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                }}>
                    Bom trabalho!
                </h3>
                
                <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.95rem',
                    marginBottom: '2rem',
                    lineHeight: 1.5
                }}>
                    Suas recompensas foram adicionadas à sua conta. Continue assim para evoluir suas finanças!
                </p>

                <div style={{ 
                    display: 'flex', 
                    gap: '1rem', 
                    width: '100%',
                    justifyContent: 'center'
                }}>
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '1rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Zap size={24} color="#00d2ff" fill="#00d2ff" style={{ opacity: 0.8 }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>+{reward.xp}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>XP</span>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            flex: 1,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            padding: '1rem',
                            borderRadius: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Coins size={24} color="#ffcc00" fill="#ffcc00" style={{ opacity: 0.8 }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>+{reward.coins}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Moedas</span>
                    </motion.div>
                </div>

                <button 
                   onClick={onClose}
                   style={{
                       marginTop: '2rem',
                       width: '100%',
                       padding: '1rem',
                       borderRadius: '12px',
                       border: 'none',
                       background: 'var(--primary-color)',
                       color: 'var(--dark-bg)',
                       fontWeight: 800,
                       fontSize: '1rem',
                       cursor: 'pointer',
                       transition: 'all 0.2s ease',
                       boxShadow: '0 4px 15px rgba(0, 200, 150, 0.3)'
                   }}
                   onMouseOver={(e) => {
                       e.currentTarget.style.filter = 'brightness(1.1)';
                       e.currentTarget.style.transform = 'translateY(-2px)';
                   }}
                   onMouseOut={(e) => {
                       e.currentTarget.style.filter = 'brightness(1)';
                       e.currentTarget.style.transform = 'translateY(0)';
                   }}
                >
                    Entendido!
                </button>
            </div>
        </Modal>
    );
};

export default RewardModal;
