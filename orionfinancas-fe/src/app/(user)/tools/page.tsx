"use client";

import { useState, useMemo } from 'react';
import styles from './Tools.module.css';
import { 
    Calculator, 
    TrendingUp, 
    PieChart, 
    Target,
    Info
} from 'lucide-react';

export default function ToolsPage() {
    // Calculator 1: Compound Interest
    const [ciInitial, setCiInitial] = useState<number>(1000);
    const [ciMonthly, setCiMonthly] = useState<number>(100);
    const [ciRate, setCiRate] = useState<number>(10);
    const [ciYears, setCiYears] = useState<number>(5);

    const compoundInterestResult = useMemo(() => {
        const monthlyRate = ciRate / 100 / 12;
        const totalMonths = ciYears * 12;
        
        let total = ciInitial;
        for (let i = 0; i < totalMonths; i++) {
            total = total * (1 + monthlyRate) + ciMonthly;
        }
        return total;
    }, [ciInitial, ciMonthly, ciRate, ciYears]);

    // Calculator 2: Budget 50/30/20
    const [income, setIncome] = useState<number>(5000);
    const budget = useMemo(() => ({
        needs: income * 0.5,
        wants: income * 0.3,
        savings: income * 0.2
    }), [income]);

    // Calculator 3: Goal Simulator
    const [targetAmount, setTargetAmount] = useState<number>(10000);
    const [targetMonths, setTargetMonths] = useState<number>(12);
    const monthlyToSave = useMemo(() => {
        return targetAmount / targetMonths;
    }, [targetAmount, targetMonths]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className={styles.toolsContainer}>
            <header className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>
                    Ferramentas <span className={styles.pageHighlight}>Financeiras</span>
                </h1>
                <p className={styles.pageSubtitle}>
                    Utilize nossos simuladores interativos para planejar seu futuro e dominar suas finanças com precisão.
                </p>
            </header>

            <div className={styles.toolsGrid}>
                {/* Simulador de Juros Compostos */}
                <div className={styles.toolCard}>
                    <div className={styles.toolIconHeader}>
                        <div className={styles.iconWrapper}>
                            <TrendingUp size={24} />
                        </div>
                        <h2 className={styles.toolTitle}>Juros Compostos</h2>
                    </div>
                    
                    <div className={styles.calculatorBody}>
                        <div className={styles.inputGroup}>
                            <label>Investimento Inicial (R$)</label>
                            <input 
                                type="number" 
                                value={ciInitial} 
                                onChange={(e) => setCiInitial(Number(e.target.value))} 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Aporte Mensal (R$)</label>
                            <input 
                                type="number" 
                                value={ciMonthly} 
                                onChange={(e) => setCiMonthly(Number(e.target.value))} 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Taxa de Juros Anual (%)</label>
                            <input 
                                type="number" 
                                value={ciRate} 
                                onChange={(e) => setCiRate(Number(e.target.value))} 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Período (Anos)</label>
                            <input 
                                type="number" 
                                value={ciYears} 
                                onChange={(e) => setCiYears(Number(e.target.value))} 
                            />
                        </div>

                        <div className={styles.resultBox}>
                            <span className={styles.resultLabel}>Montante Final Estimado</span>
                            <span className={styles.resultValue}>{formatCurrency(compoundInterestResult)}</span>
                        </div>
                    </div>
                </div>

                {/* Regra 50/30/20 */}
                <div className={styles.toolCard}>
                    <div className={styles.toolIconHeader}>
                        <div className={styles.iconWrapper}>
                            <PieChart size={24} />
                        </div>
                        <h2 className={styles.toolTitle}>Regra 50/30/20</h2>
                    </div>

                    <div className={styles.calculatorBody}>
                        <div className={styles.inputGroup}>
                            <label>Sua Renda Mensal Líquida (R$)</label>
                            <input 
                                type="number" 
                                value={income} 
                                onChange={(e) => setIncome(Number(e.target.value))} 
                            />
                        </div>

                        <div className={styles.budgetBars}>
                            <div className={styles.barNeeds} style={{ width: '50%' }}></div>
                            <div className={styles.barWants} style={{ width: '30%' }}></div>
                            <div className={styles.barSavings} style={{ width: '20%' }}></div>
                        </div>

                        <div className={styles.legendGrid}>
                            <div className={styles.legendItem}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={`${styles.legendDot} ${styles.barNeeds}`}></span>
                                    <span className={styles.legendLabel}>Necessidades (50%)</span>
                                </div>
                                <span className={styles.legendValue}>{formatCurrency(budget.needs)}</span>
                            </div>
                            <div className={styles.legendItem}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={`${styles.legendDot} ${styles.barWants}`}></span>
                                    <span className={styles.legendLabel}>Desejos (30%)</span>
                                </div>
                                <span className={styles.legendValue}>{formatCurrency(budget.wants)}</span>
                            </div>
                            <div className={styles.legendItem}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span className={`${styles.legendDot} ${styles.barSavings}`}></span>
                                    <span className={styles.legendLabel}>Investimentos (20%)</span>
                                </div>
                                <span className={styles.legendValue}>{formatCurrency(budget.savings)}</span>
                            </div>
                        </div>

                        <div className={styles.eduCard} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginTop: '0.5rem', display: 'flex', gap: '0.8rem', alignItems: 'start' }}>
                            <Info size={16} color="var(--primary-color)" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Essa regra ajuda a equilibrar seu estilo de vida e garante que você sempre reserve uma parte para o futuro.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Simulador de Metas */}
                <div className={styles.toolCard}>
                    <div className={styles.toolIconHeader}>
                        <div className={styles.iconWrapper}>
                            <Target size={24} />
                        </div>
                        <h2 className={styles.toolTitle}>Simulador de Metas</h2>
                    </div>

                    <div className={styles.calculatorBody}>
                        <div className={styles.inputGroup}>
                            <label>Qual seu Objetivo? (R$)</label>
                            <input 
                                type="number" 
                                value={targetAmount} 
                                onChange={(e) => setTargetAmount(Number(e.target.value))} 
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Em quantos meses?</label>
                            <input 
                                type="number" 
                                value={targetMonths} 
                                onChange={(e) => setTargetMonths(Number(e.target.value))} 
                            />
                        </div>

                        <div className={styles.resultBox} style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px dashed rgba(59, 130, 246, 0.2)' }}>
                            <span className={styles.resultLabel}>Você deve poupar mensalmente</span>
                            <span className={styles.resultValue} style={{ color: '#3b82f6' }}>{formatCurrency(monthlyToSave)}</span>
                        </div>

                        <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                Definir parcelas mensais torna seus sonhos mais alcançáveis e menos assustadores.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
