"use client";

import React, { useState } from 'react';
import styles from './QuickTools.module.css';
import { TrendingUp, PieChart, Target, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';

// Limites para evitar overflow numérico e valores absurdos.
// 9999999999 (~10 bilhões) cobre qualquer cenário realista de finanças pessoais.
const MAX_MONEY = 9999999999;
const clamp = (n: number, min: number, max: number) => {
    if (Number.isNaN(n)) return min;
    return Math.min(Math.max(n, min), max);
};
const clampMoney = (v: string) => clamp(Number(v), 0, MAX_MONEY);

export default function QuickTools() {
    const [openModal, setOpenModal] = useState<string | null>(null);

    return (
        <section className={styles.container}>
            <h2 className={styles.sectionTitle} style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Simuladores Educativos</h2>
            <div className={styles.toolsGrid}>
                <div className={styles.toolCard} onClick={() => setOpenModal('compound')}>
                    <div className={styles.iconWrapper}><TrendingUp size={20} /></div>
                    <div className={styles.toolInfo}>
                        <span className={styles.toolName}>Juros Compostos</span>
                        <span className={styles.toolTag}>Simulador de Projeção</span>
                    </div>
                </div>

                <div className={styles.toolCard} onClick={() => setOpenModal('budget')}>
                    <div className={styles.iconWrapper}><PieChart size={20} /></div>
                    <div className={styles.toolInfo}>
                        <span className={styles.toolName}>Regra 50/30/20</span>
                        <span className={styles.toolTag}>Divisão de Gastos</span>
                    </div>
                </div>

                <div className={styles.toolCard} onClick={() => setOpenModal('goal')}>
                    <div className={styles.iconWrapper}><Target size={20} /></div>
                    <div className={styles.toolInfo}>
                        <span className={styles.toolName}>Simulador de Metas</span>
                        <span className={styles.toolTag}>Quanto poupar por mês</span>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {openModal === 'compound' && <CompoundInterestModal onClose={() => setOpenModal(null)} />}
            {openModal === 'budget' && <BudgetRuleModal onClose={() => setOpenModal(null)} />}
            {openModal === 'goal' && <GoalSimModal onClose={() => setOpenModal(null)} />}
        </section>
    );
}

// Sub-components for Calculators
function CompoundInterestModal({ onClose }: { onClose: () => void }) {
    const [initial, setInitial] = useState(1000);
    const [monthly, setMonthly] = useState(100);
    const [rate, setRate] = useState(10);
    const [years, setYears] = useState(5);

    const result = React.useMemo(() => {
        const monthlyRate = rate / 100 / 12;
        const totalMonths = years * 12;
        let total = initial;
        for (let i = 0; i < totalMonths; i++) {
            total = total * (1 + monthlyRate) + monthly;
        }
        return total;
    }, [initial, monthly, rate, years]);

    return (
        <Modal isOpen={true} onClose={onClose} title="Simulador de Juros Compostos" maxWidth="450px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                <div style={inputStyle}>
                    <label style={labelStyle}>Investimento Inicial (R$)</label>
                    <input type="number" min="0" max="9999999999" value={initial} onChange={e => setInitial(clampMoney(e.target.value))} style={fieldStyle} />
                </div>
                <div style={inputStyle}>
                    <label style={labelStyle}>Aporte Mensal (R$)</label>
                    <input type="number" min="0" max="9999999999" value={monthly} onChange={e => setMonthly(clampMoney(e.target.value))} style={fieldStyle} />
                </div>
                <div style={inputStyle}>
                    <label style={labelStyle}>Taxa Anual (%)</label>
                    <input type="number" min="0" max="999" value={rate} onChange={e => setRate(clamp(Number(e.target.value), 0, 999))} style={fieldStyle} />
                </div>
                <div style={inputStyle}>
                    <label style={labelStyle}>Anos</label>
                    <input type="number" min="0" max="100" value={years} onChange={e => setYears(clamp(Number(e.target.value), 0, 100))} style={fieldStyle} />
                </div>
                <div style={resultStyle}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>RESULTADO ESTIMADO</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2dd4bf' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result)}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

function BudgetRuleModal({ onClose }: { onClose: () => void }) {
    const [income, setIncome] = useState(5000);
    const format = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    return (
        <Modal isOpen={true} onClose={onClose} title="Regra 50/30/20" maxWidth="450px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                <div style={inputStyle}>
                    <label style={labelStyle}>Sua Renda Mensal Líquida (R$)</label>
                    <input type="number" min="0" max="9999999999" value={income} onChange={e => setIncome(clampMoney(e.target.value))} style={fieldStyle} />
                </div>
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', margin: '0.5rem 0' }}>
                    <div style={{ width: '50%', background: '#2dd4bf' }}></div>
                    <div style={{ width: '30%', background: '#3b82f6' }}></div>
                    <div style={{ width: '20%', background: '#8b5cf6' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div><span style={{ fontSize: '0.7rem', opacity: 0.6 }}>NECESSIDADES (50%)</span><div style={{ fontWeight: 700 }}>{format(income * 0.5)}</div></div>
                    <div><span style={{ fontSize: '0.7rem', opacity: 0.6 }}>DESEJOS (30%)</span><div style={{ fontWeight: 700 }}>{format(income * 0.3)}</div></div>
                    <div><span style={{ fontSize: '0.7rem', opacity: 0.6 }}>INVESTIMENTOS (20%)</span><div style={{ fontWeight: 700 }}>{format(income * 0.2)}</div></div>
                </div>
                <p style={{ fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic' }}>Ideal para quem busca equilíbrio financeiro.</p>
            </div>
        </Modal>
    );
}

function GoalSimModal({ onClose }: { onClose: () => void }) {
    const [target, setTarget] = useState(10000);
    const [months, setMonths] = useState(12);

    return (
        <Modal isOpen={true} onClose={onClose} title="Simulador de Metas" maxWidth="450px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                <div style={inputStyle}>
                    <label style={labelStyle}>Qual seu Objetivo? (R$)</label>
                    <input type="number" min="0" max="9999999999" value={target} onChange={e => setTarget(clampMoney(e.target.value))} style={fieldStyle} />
                </div>
                <div style={inputStyle}>
                    <label style={labelStyle}>Em quantos meses?</label>
                    <input type="number" min="1" max="1200" value={months} onChange={e => setMonths(clamp(Number(e.target.value), 1, 1200))} style={fieldStyle} />
                </div>
                <div style={{ ...resultStyle, background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>POUPANÇA MENSAL NECESSÁRIA</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(target / (months || 1))}
                    </div>
                </div>
            </div>
        </Modal>
    );
}

// Shared Styles
const inputStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.4rem' };
const labelStyle: React.CSSProperties = { fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 };
const fieldStyle: React.CSSProperties = { 
    background: 'rgba(255,255,255,0.05)', 
    border: '1px solid rgba(255,255,255,0.1)', 
    borderRadius: '10px', 
    padding: '0.7rem', 
    color: '#fff', 
    outline: 'none' 
};
const resultStyle: React.CSSProperties = { 
    marginTop: '1rem', 
    padding: '1.25rem', 
    background: 'rgba(45, 212, 191, 0.1)', 
    borderRadius: '16px', 
    border: '1px dashed rgba(45, 212, 191, 0.3)', 
    textAlign: 'center' 
};
