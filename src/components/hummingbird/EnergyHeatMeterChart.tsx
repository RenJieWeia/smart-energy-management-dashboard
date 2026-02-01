/**
 * 电能表与热量表监测组件
 * 展示电能表瞬时功率和热量表数据
 */

import React, { useMemo } from 'react';
import { useHummingBirdApi } from '@/hooks';
import { Zap, Flame, Gauge } from 'lucide-react';

/** 电能表配置 */
const ELECTRICITY_METERS = [
  { code: 'heatPumpElectricityMeterFirstIR', crCode: 'heatPumpElectricityMeterFirstCR', label: '1#热泵', short: '1#热泵' },
  { code: 'heatPumpElectricityMeterSecondIR', crCode: 'heatPumpElectricityMeterSecondCR', label: '2#热泵', short: '2#热泵' },
  { code: 'waterPumpElectricityMeterIR', crCode: 'waterPumpElectricityMeterCR', label: '水泵', short: '水泵' },
];

/** 热量表配置 */
const HEAT_METERS = [
  { 
    heatCode: 'heatMeterCondensationIHR', 
    flowCode: 'heatMeterCondensationIFR', 
    label: '冷凝侧', 
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30'
  },
  { 
    heatCode: 'heatMeterFreezeSideIHR', 
    flowCode: 'heatMeterFreezeSideIFR', 
    label: '冷冻侧',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30'
  },
];

export const EnergyHeatMeterChart: React.FC = () => {
  const { deviceData, loading } = useHummingBirdApi();

  const dataMap = useMemo(() => 
    new Map(deviceData.map(d => [d.code, d.value as number])),
    [deviceData]
  );

  const electricityData = useMemo(() => 
    ELECTRICITY_METERS.map(meter => ({
      ...meter,
      power: dataMap.get(meter.code) || 0,
      energy: dataMap.get(meter.crCode) || 0,
    })),
    [dataMap]
  );

  const heatData = useMemo(() => 
    HEAT_METERS.map(meter => ({
      ...meter,
      heat: dataMap.get(meter.heatCode) || 0,
      flow: dataMap.get(meter.flowCode) || 0,
    })),
    [dataMap]
  );

  const totalPower = useMemo(() => 
    electricityData.reduce((sum, item) => sum + item.power, 0),
    [electricityData]
  );

  const systemCOP = dataMap.get('systemICOP') || 0;

  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      {/* 系统COP & 总功率 */}
      <div className="flex gap-2 shrink-0 h-[14%]">
        <div className="flex-1 flex items-center justify-between px-3 rounded bg-emerald-900/10 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            <Gauge size={16} className="text-emerald-400" />
            <span className="text-xs text-emerald-300/80 font-medium">系统COP</span>
          </div>
          <span className="text-2xl font-bold font-tech text-emerald-400 leading-none">
            {systemCOP.toFixed(2)}
          </span>
        </div>
        <div className="flex-1 flex items-center justify-between px-3 rounded bg-yellow-900/10 border border-yellow-500/20">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-yellow-400" />
            <span className="text-xs text-yellow-300/80 font-medium">总功率</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-tech text-yellow-400 leading-none">
              {totalPower.toFixed(1)}
            </span>
            <span className="text-[10px] text-yellow-500/70 font-medium">kW</span>
          </div>
        </div>
      </div>

      {/* 电能表瞬时功率 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 px-1 flex items-center gap-1.5 shrink-0">
          <Zap size={12} className="text-yellow-500" />
          电能表瞬时功率
        </div>
        <div className="grid grid-cols-3 gap-2 flex-1">
          {electricityData.map(item => (
            <div 
              key={item.code}
              className="flex flex-col items-center justify-center p-2 rounded border bg-slate-800/30 border-slate-700/30 hover:border-yellow-500/30 transition-all h-full"
            >
              <span className="text-[11px] text-slate-400 mb-1">{item.short}</span>
              <div className="flex items-baseline gap-0.5 mb-1">
                <span className="text-xl font-bold font-tech text-yellow-400 leading-none">
                  {item.power.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-600 font-medium">kW</span>
              </div>
              {/* 累计电能 */}
              <div className="text-[10px] text-slate-500 bg-slate-900/40 px-2 py-0.5 rounded-full">
                <span className="font-tech text-slate-400">{item.energy.toFixed(0)}</span> kW·h
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 热量表数据 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 px-1 flex items-center gap-1.5 shrink-0">
          <Flame size={12} className="text-orange-500" />
          热量表监测
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {heatData.map(item => (
            <div 
              key={item.heatCode}
              className={`px-4 py-2 rounded border ${item.bgColor} ${item.borderColor} h-full flex flex-col justify-center`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-slate-300">{item.label}</div>
                <div className={`text-[10px] px-1.5 rounded ${item.color.replace('text-', 'bg-')}/10 ${item.color}`}>Running</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">瞬时热量</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-xl font-bold font-tech ${item.color} leading-none`}>
                      {item.heat.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-600">kW</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 mb-0.5">瞬时流量</div>
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className={`text-xl font-bold font-tech ${item.color} leading-none`}>
                      {item.flow.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-slate-600">m³/h</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnergyHeatMeterChart;
