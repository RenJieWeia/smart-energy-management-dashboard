/**
 * 压力监测图表组件
 * 使用横向柱状图展示各区域压力数据
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useHummingBirdApi } from '@/hooks';

/** 压力数据配置 */
const PRESSURE_CONFIG = [
  { code: 'hightSupplyPressure', label: '高区供水', threshold: 1100 },
  { code: 'hightReturnPressure', label: '高区回水', threshold: 1100 },
  { code: 'lowSupplyPressure', label: '低区供水', threshold: 700 },
  { code: 'lowReturnPressure', label: '低区回水', threshold: 700 },
  { code: 'wellSupplyPressure', label: '井水供水', threshold: 100 },
  { code: 'wellReturnPressure', label: '井水回水', threshold: 100 },
];

/** 获取压力颜色 */
function getPressureColor(value: number, threshold: number): string {
  const ratio = value / threshold;
  if (ratio > 1.1) return '#ef4444'; // Red - 严重过高
  if (ratio > 0.95) return '#f59e0b'; // Amber - 接近阈值
  if (ratio < 0.2) return '#64748b'; // Slate - 停机/无读数
  return '#06b6d4'; // Cyan - 正常运行
}

export const PressureChart: React.FC = () => {
  const { deviceData, loading } = useHummingBirdApi();

  const chartData = useMemo(() => {
    if (deviceData.length === 0) return [];

    const dataMap = new Map(deviceData.map(d => [d.code, d.value as number]));

    return PRESSURE_CONFIG.map(config => ({
      name: config.label,
      value: dataMap.get(config.code) || 0,
      threshold: config.threshold,
    }));
  }, [deviceData]);

  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            domain={[0, 1200]}
          />
          <YAxis
            type="category"
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#e2e8f0', fontSize: 11, fontWeight: 500 }}
            width={60}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
            }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px' }}
            itemStyle={{ color: '#22d3ee', fontSize: '13px', fontWeight: 'bold' }}
            formatter={(value: number) => [`${value.toFixed(1)} kPa`, '实时压力']}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell 
                key={index} 
                fill={getPressureColor(entry.value, entry.threshold)} 
                fillOpacity={0.9} 
                strokeWidth={0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PressureChart;
