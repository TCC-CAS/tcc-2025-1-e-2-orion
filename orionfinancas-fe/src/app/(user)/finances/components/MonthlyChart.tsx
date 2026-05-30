"use client";

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import styles from '../Finances.module.css';

interface MonthlyChartProps {
    data: { name: string; value: number; color: string }[];
}

type FocusKey = 'sem-dados' | 'poupanca' | 'equilibrio' | 'limite' | 'atencao' | 'critico';

const focusMap: Record<FocusKey, { label: string; color: string }> = {
    'sem-dados':  { label: 'Sem dados',  color: '#94a3b8' },
    'poupanca':   { label: 'Poupança',   color: '#00f2a9' },
    'equilibrio': { label: 'Equilíbrio', color: '#2dd4bf' },
    'limite':     { label: 'No limite',  color: '#facc15' },
    'atencao':    { label: 'Atenção',    color: '#f97316' },
    'critico':    { label: 'Crítico',    color: '#ef4444' },
};

const computeFocus = (income: number, expenses: number): FocusKey => {
    if (income === 0 && expenses === 0) return 'sem-dados';
    if (income === 0) return 'critico';
    const ratio = (income - expenses) / income;
    if (ratio >= 0.2) return 'poupanca';
    if (ratio > 0)    return 'equilibrio';
    if (ratio === 0)  return 'limite';
    if (ratio > -0.2) return 'atencao';
    return 'critico';
};

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
    const income = data[0]?.value ?? 0;
    const expenses = data[1]?.value ?? 0;
    const focus = focusMap[computeFocus(income, expenses)];

    return (
        <div className={styles.pieWrapper}>
            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={95}
                        outerRadius={125}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={800}
                        animationBegin={0}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '10px',
                            padding: '8px 12px',
                            fontSize: '13px'
                        }}
                        itemStyle={{ color: '#fff', padding: '2px 0' }}
                        formatter={(value: any) => `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className={styles.chartCenterInfo}>
                <span className={styles.centerLabel}>Seu Foco</span>
                <span className={styles.centerValue} style={{ color: focus.color }}>
                    {focus.label}
                </span>
            </div>
        </div>
    );
};

export default React.memo(MonthlyChart);
