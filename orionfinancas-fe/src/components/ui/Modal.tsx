"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string | React.ReactNode;
    children: React.ReactNode;
    maxWidth?: string;
    showClose?: boolean;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '500px',
    showClose = true,
    className = ''
}) => {
    // Prevent scroll on body when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.modalRoot}>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        transition={{ duration: 0.1 }}
                    />

                    {/* Content Container */}
                    <div className={styles.container}>
                        <motion.div
                            className={`${styles.content} ${className}`}
                            style={{ maxWidth }}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ 
                                duration: 0.15,
                                ease: "easeOut"
                            }}
                        >
                            {(title || showClose) && (
                                <header className={styles.header}>
                                    {title && <div className={styles.title}>{title}</div>}
                                    {showClose && (
                                        <button 
                                            className={styles.closeBtn} 
                                            onClick={onClose}
                                            aria-label="Fechar"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </header>
                            )}
                            <div className={styles.body}>
                                {children}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default React.memo(Modal);
