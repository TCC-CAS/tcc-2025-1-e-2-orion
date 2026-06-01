"use client";

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import styles from '../AdminDashboard.module.css';

interface AdminPieChartProps {
    data: any[];
    activeUsers: number;
}

const AdminPieChart: React.FC<AdminPieChartProps> = ({ data, activeUsers }) => {
    return (
        <div className={styles.pieWrapper}>
            <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={90}
                        outerRadius={115}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                        animationDuration={800}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
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
                        formatter={(value: any) => value.toLocaleString('pt-BR')}
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className={styles.chartCenterInfo}>
                <span className={styles.centerLabel}>Base Ativa</span>
                <span className={styles.centerValue}>{activeUsers}</span>
            </div>
        </div>
    );
};

export default React.memo(AdminPieChart);
