"use client";

import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import styles from '../Finances.module.css';

interface MonthlyChartProps {
    data: any[];
}

const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
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
                <span className={styles.centerValue}>Equilíbrio</span>
            </div>
        </div>
    );
};

export default React.memo(MonthlyChart);
