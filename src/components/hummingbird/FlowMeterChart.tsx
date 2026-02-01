/**
 * 流量计监测图表组件
 * 展示各流量计的瞬时流量
 */

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { useHummingBirdApi } from '@/hooks';

/** 流量计配置 */
const FLOW_METERS = [
  { code: 'flowMeterFluxFirst', label: '1#流量', fullLabel: '1#流量计' },
  { code: 'flowMeterFluxSecond', label: '2#流量', fullLabel: '2#流量计' },
  { code: 'flowMeterFluxThird', label: '3#流量', fullLabel: '3#流量计' },
  { code: 'flowMeterFluxFourth', label: '4#流量', fullLabel: '4#流量计' },
  { code: 'flowMeterFluxFifth', label: '5#流量', fullLabel: '5#流量计' },
];

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
        {data.value.toFixed(2)} <span className="text-[10px] text-slate-500">m³/h</span>
      </div>
    </div>
  );
};

export const FlowMeterChart: React.FC = () => {
  const { deviceData, loading } = useHummingBirdApi();

  const chartData = useMemo(() => {
    const dataMap = new Map(deviceData.map(d => [d.code, d.value as number]));
    
    return FLOW_METERS.map(meter => ({
      name: meter.label,
      fullLabel: meter.fullLabel,
      value: dataMap.get(meter.code) || 0,
    }));
  }, [deviceData]);

  const avgFlow = useMemo(() => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    return total / chartData.length;
  }, [chartData]);

  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* 标题和统计 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">瞬时流量监测</span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-blue-400 font-tech">{avgFlow.toFixed(1)}</span>
          <span className="text-[10px] text-slate-500 font-medium">m³/h 平均</span>
        </div>
      </div>

      {/* 图表 */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              dy={5}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              domain={[0, 'auto']}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <ReferenceLine 
              y={avgFlow} 
              stroke="#64748b" 
              strokeDasharray="3 3" 
              strokeOpacity={0.5}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#flowGradient)"
              dot={{ fill: '#3b82f6', strokeWidth: 0, r: 2 }}
              activeDot={{ fill: '#60a5fa', strokeWidth: 2, stroke: '#fff', r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 数值列表 - 优化对齐和字体 */}
      <div className="flex justify-between px-1 mt-1 border-t border-slate-800/50 pt-2">
        {chartData.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="text-[13px] font-bold text-blue-400 font-tech leading-none">{item.value.toFixed(0)}</div>
            <div className="text-[9px] text-slate-500 mt-0.5 scale-90">{index + 1}#</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlowMeterChart;
