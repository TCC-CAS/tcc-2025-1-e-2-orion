"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../Finances.module.css';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.confirmModalOverlay} style={{ zIndex: 4000 }}>
                    <motion.div 
                        className={styles.welcomeModalContent}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    >
                        <div className={styles.welcomeIcon}>
                            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                        </div>
                        <h2 className={styles.welcomeTitle}>
                            Bem-vindo à sua área de <span className={styles.pageHighlight}>Finanças</span>
                        </h2>
                        <p className={styles.welcomeDesc}>
                            Organize seus ganhos, despesas e metas em um painel claro e inteligente para acompanhar sua evolução financeira em tempo real.
                        </p>
                        <button className={styles.primaryBtnWide} onClick={onClose} style={{ marginTop: '1rem', padding: '1.2rem' }}>
                            Começar agora
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default React.memo(WelcomeModal);
