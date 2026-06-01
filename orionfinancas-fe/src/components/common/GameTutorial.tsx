'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GameTutorial.module.css';
import Image from 'next/image';
import robotIdleGif from '@/assets/Robots_Idle-export.gif';
import { X, ChevronRight, ChevronLeft, Check, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TutorialStep {
    title: string;
    content: string;
    targetId?: string; // ID of the element to highlight
    placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface GameTutorialProps {
    steps: TutorialStep[];
    onComplete?: () => void;
    tutorialKey: string;
}

export function GameTutorial({ steps, onComplete, tutorialKey }: GameTutorialProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [windowSize, setWindowSize] = useState(() => ({
        width: typeof window !== 'undefined' ? window.innerWidth : 0,
        height: typeof window !== 'undefined' ? window.innerHeight : 0,
    }));

    const updateTargetRect = useCallback((isStepChange = false) => {
        if (!isVisible) return;
        const step = steps[currentStep];
        if (step && step.targetId) {
            const el = document.getElementById(step.targetId);
            if (el) {
                if (isStepChange) {
                    const rect = el.getBoundingClientRect();
                    const isFullyInView = (
                        rect.top >= 100 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 100
                    );
                    if (!isFullyInView) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
                setTargetRect(el.getBoundingClientRect());
            } else {
                setTargetRect(null);
            }
        } else {
            setTargetRect(null);
        }
    }, [currentStep, isVisible, steps]);

    useEffect(() => {
        const hasSeen = localStorage.getItem(`tutorial_${tutorialKey}`);
        if (!hasSeen) {
            setIsVisible(true);
        }
        
        const handleScroll = () => updateTargetRect(false);
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            updateTargetRect(false);
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [tutorialKey, updateTargetRect]);

    // Force update rect when step changes or visibility changes
    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        // Small delay to ensure DOM is ready and any layout shifts are done
        const timer = setTimeout(() => updateTargetRect(true), 100);
        return () => clearTimeout(timer);
    }, [currentStep, isVisible, updateTargetRect]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleFinish();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleFinish = () => {
        localStorage.setItem(`tutorial_${tutorialKey}`, 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    const restartTutorial = () => {
        setCurrentStep(0);
        setIsVisible(true);
    };

    const step = steps[currentStep];

    // Calculate dialogue position
    let dialogueStyle: React.CSSProperties = {};
    let arrowStyle: React.CSSProperties = { display: 'none' };

    const isMobile = windowSize.width === 0 || windowSize.width <= 768;

    // IMPORTANTE: não usamos `transform` para centralizar porque o Framer Motion
    // controla o transform (animação de scale) e sobrescreveria o translate,
    // jogando o modal para fora da tela. A centralização é feita via flexbox no
    // .overlayContainer; aqui só posicionamos casos especiais (desktop com alvo).
    if (!isMobile && targetRect && step.placement !== 'center') {
        const dialogW = Math.min(600, windowSize.width * 0.9);
        const leftPx = Math.max(16, (windowSize.width - dialogW) / 2);
        const isTargetAtBottom = targetRect.top + (targetRect.height / 2) > windowSize.height / 2;

        dialogueStyle = {
            position: 'absolute',
            left: `${leftPx}px`,
            width: `${dialogW}px`,
            margin: 0,
        };

        if (isTargetAtBottom) {
            dialogueStyle.top = '40px';
        } else {
            dialogueStyle.bottom = '40px';
        }

        arrowStyle = { display: 'none' };
    } else {
        // Centralizado pelo flex do overlay — sem transform para não brigar com o Framer Motion
        dialogueStyle = {
            position: 'relative',
            margin: 0,
            width: isMobile ? 'calc(100vw - 2rem)' : 'auto',
            maxWidth: isMobile ? '480px' : '600px',
        };
    }

    return (
        <>
            {!isVisible && (
                <button 
                    className={styles.restartBtn} 
                    onClick={restartTutorial}
                    title="Ver tutorial novamente"
                >
                    <Lightbulb size={24} />
                </button>
            )}

            {isVisible && (
                <div className={styles.overlayContainer} onClick={handleFinish}>
                    {/* SVG Mask for spotlight effect */}
                    <svg className={styles.spotlightMask}>
                        <defs>
                            <mask id="spotlight">
                                <rect width="100%" height="100%" fill="white" />
                                {targetRect && (
                                    <rect 
                                        x={targetRect.left - 10} 
                                        y={targetRect.top - 10} 
                                        width={targetRect.width + 20} 
                                        height={targetRect.height + 20} 
                                        rx="12" 
                                        fill="black" 
                                    />
                                )}
                            </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="rgba(2, 6, 23, 0.85)" mask="url(#spotlight)" />
                    </svg>

                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentStep}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className={styles.dialogueBox}
                            style={dialogueStyle}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={arrowStyle} />
                            
                            <div className={styles.mascotContainer}>
                                <Image 
                                    src={robotIdleGif} 
                                    alt="Mascote" 
                                    width={120} 
                                    height={120} 
                                    className={styles.mascot} 
                                    unoptimized
                                />
                            </div>
                            
                            <div className={styles.content}>
                                <h3 className={styles.title}>{step.title}</h3>
                                <p className={styles.text}>{step.content}</p>
                                
                                <div className={styles.footer}>
                                    <div className={styles.progress}>
                                        {steps.map((_, i) => (
                                            <div key={i} className={`${styles.dot} ${i === currentStep ? styles.activeDot : ''}`} />
                                        ))}
                                    </div>
                                    
                                    <div className={styles.actions}>
                                        {currentStep > 0 && (
                                            <button className={styles.btnBack} onClick={handleBack}>
                                                <ChevronLeft size={20} />
                                                Voltar
                                            </button>
                                        )}
                                        <button className={styles.btnNext} onClick={handleNext}>
                                            {currentStep === steps.length - 1 ? (
                                                <>Entendi! <Check size={20} /></>
                                            ) : (
                                                <>Próximo <ChevronRight size={20} /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button className={styles.btnClose} onClick={handleFinish}>
                                <X size={20} />
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </>
    );
}
