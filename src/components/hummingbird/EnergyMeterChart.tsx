/**
 * 电能监测图表组件
 * 展示各电表的实时功率和累计电量
 */

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useHummingBirdApi } from '@/hooks';

/** 电表配置 */
const POWER_METERS = [
  { code: 'electricMeterPowerFirst', label: '1#' },
  { code: 'electricMeterPowerSecond', label: '2#' },
  { code: 'electricMeterPowerThird', label: '3#' },
  { code: 'electricMeterPowerFourth', label: '4#' },
  { code: 'electricMeterPowerFifth', label: '5#' },
  { code: 'electricMeterPowerSixth', label: '6#' },
];

const COLORS = {
  low: '#22c55e',    // 绿色 - 低功率
  medium: '#3b82f6', // 蓝色 - 中等功率
  high: '#f59e0b',   // 橙色 - 较高功率
  critical: '#ef4444', // 红色 - 高功率
};

const getColor = (value: number): string => {
  if (value < 10) return COLORS.low;
  if (value < 30) return COLORS.medium;
  if (value < 50) return COLORS.high;
  return COLORS.critical;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { fullLabel: string; value: number } }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  return (
    <div className="bg-slate-900/95 px-3 py-2 rounded-lg border border-cyan-500/30 shadow-lg">
      <div className="text-xs text-slate-300">{data.fullLabel}</div>
      <div className="text-sm font-bold text-cyan-400">
        {data.value.toFixed(2)} <span className="text-[10px] text-slate-500">kW</span>
      </div>
    </div>
  );
};

export const EnergyMeterChart: React.FC = () => {
  const { deviceData, loading } = useHummingBirdApi();

  const chartData = useMemo(() => {
    const dataMap = new Map(deviceData.map(d => [d.code, d.value as number]));
    
    return POWER_METERS.map(meter => ({
      name: meter.label,
      fullLabel: `${meter.label}电表`,
      value: dataMap.get(meter.code) || 0,
    }));
  }, [deviceData]);

  const totalPower = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 总功率显示 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">实时功率监测</span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-cyan-400 font-tech">{totalPower.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500">kW 总计</span>
        </div>
      </div>

      {/* 图表 */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" barSize={12}>
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              domain={[0, 'auto']}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              width={24}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 图例 */}
      <div className="flex justify-center gap-3 mt-1">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-[9px] text-slate-500">&lt;10kW</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-[9px] text-slate-500">10-30kW</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span className="text-[9px] text-slate-500">30-50kW</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          <span className="text-[9px] text-slate-500">&gt;50kW</span>
        </div>
      </div>
    </div>
  );
};

export default EnergyMeterChart;
