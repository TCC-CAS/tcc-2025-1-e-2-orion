"use client";

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from '../Finances.module.css';

interface HistoryChartProps {
    data: any[];
}

const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
    return (
        <div className={styles.historyWrapper}>
            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        formatter={(value: any) => `R$ ${value}`}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                    <Bar 
                        name="Ganhos" 
                        dataKey="ganhos" 
                        fill="#2dd4bf" 
                        radius={[6, 6, 0, 0]} 
                        barSize={20} 
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                    <Bar 
                        name="Gastos" 
                        dataKey="gastos" 
                        fill="#ef4444" 
                        radius={[6, 6, 0, 0]} 
                        barSize={20} 
                        isAnimationActive={true}
                        animationDuration={1000}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(HistoryChart);
