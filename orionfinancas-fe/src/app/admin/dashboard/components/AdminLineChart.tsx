"use client";

import React from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import styles from '../AdminDashboard.module.css';

interface AdminLineChartProps {
    data: any[];
}

const formatMetric = (value: number | string): string =>
  typeof value === 'number' ? value.toLocaleString('pt-BR') : String(value);

const AdminLineChart: React.FC<AdminLineChartProps> = ({ data }) => {
    return (
        <div className={styles.historyWrapper}>
            <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
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
                        cursor={{ stroke: 'rgba(255,255,255,0.2)' }}
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px'
                        }}
                        formatter={(value: any) => formatMetric(value)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }} />
                    <Line
                        type="monotone"
                        name="Usuários ativos"
                        dataKey="activeUsers"
                        stroke="#2dd4bf"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        isAnimationActive={true}
                        animationDuration={800}
                    />
                    <Line
                        type="monotone"
                        name="Novos cadastros"
                        dataKey="newSignups"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1000}
                    />
                    <Line
                        type="monotone"
                        name="Reativados"
                        dataKey="reactivated"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        isAnimationActive={true}
                        animationDuration={1200}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default React.memo(AdminLineChart);
