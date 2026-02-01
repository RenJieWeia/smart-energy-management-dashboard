/**
 * 温度监测图表组件
 * 使用分组柱状图展示各区域温度数据 + 室外温度
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
  Legend,
} from 'recharts';
import { useHummingBirdApi } from '@/hooks';
import { Thermometer } from 'lucide-react';

/** 温度数据分组配置 */
const TEMP_GROUPS = [
  { key: 'high', label: '高区', supply: 'hightSupplyTemp', return: 'hightReturnTemp' },
  { key: 'low', label: '低区', supply: 'lowSupplyTemp', return: 'lowReturnTemp' },
  { key: 'well', label: '井水', supply: 'wellSupplyTemp', return: 'wellReturnTemp' },
];

export const TemperatureChart: React.FC = () => {
  const { deviceData, loading } = useHummingBirdApi();

  const { chartData, outsideTemp } = useMemo(() => {
    if (deviceData.length === 0) return { chartData: [], outsideTemp: 0 };

    const dataMap = new Map(deviceData.map(d => [d.code, d.value as number]));

    const chartData = TEMP_GROUPS.map(group => ({
      name: group.label,
      '供水温度': dataMap.get(group.supply) || 0,
      '回水温度': dataMap.get(group.return) || 0,
    }));

    return {
      chartData,
      outsideTemp: dataMap.get('outsideTemp') || 0
    };
  }, [deviceData]);

  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* 头部信息：室外温度 */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">区域供回水对比</div>
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
          <Thermometer size={14} className="text-cyan-400" />
          <span className="text-[10px] text-slate-400 font-medium">室外</span>
          <span className="text-lg font-bold font-tech text-cyan-400 leading-none">{outsideTemp.toFixed(1)}°C</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
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
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              formatter={(value: number) => [`${value.toFixed(2)} °C`]}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              iconType="rect"
              iconSize={8}
              wrapperStyle={{ fontSize: '10px', paddingTop: '0px', color: '#94a3b8' }}
            />
            <Bar name="供水温度" dataKey="供水温度" fill="#ef4444" radius={[2, 2, 0, 0]} barSize={10} activeBar={{ fill: '#f87171' }} />
            <Bar name="回水温度" dataKey="回水温度" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={10} activeBar={{ fill: '#60a5fa' }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;
