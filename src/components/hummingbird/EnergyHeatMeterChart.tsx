/**
 * 电能表与热量表监测组件
 * 展示电能表瞬时功率和热量表数据
 */

import React, { useMemo } from 'react';
import { useHummingBirdApi } from '@/hooks';
import { Flame, Gauge, Zap } from 'lucide-react';
import { ExternalMeterSection } from './ExternalMeterSection';

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
    new Map(deviceData.map(d => [d.code, Number(d.value) || 0])),
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

  // 获取冷冻/冷东侧热量表累计热量
  const cumulativeHeat = useMemo(() => {
    const prop = deviceData.find(d => 
      d.name === '冷东侧热量表累计热量' || 
      d.name === '冷冻侧热量表累计热量' ||
      (d.name?.includes('热量表累计热量') && (d.name?.includes('冷东') || d.name?.includes('冷冻')))
    );
    return Number(prop?.value) || 0;
  }, [deviceData]);

  // 为了健壮性容错，如果 crCode 拿不到数据，尝试通过前缀名称或者包含"电能"等字段动态查找对应的累计值
  const internalTotalEnergy = useMemo(() => {
    let sum = 0;
    ELECTRICITY_METERS.forEach(meter => {
      // 优先取 crCode 定义的字段
      let energy = dataMap.get(meter.crCode);
      if (typeof energy !== 'number' || isNaN(energy) || energy === 0) {
        // 如果为0或找不到，通过名称做进一步推断(设备上报的字段可能带中文或变化)
        const matchedProp = deviceData.find(d => d.code === meter.crCode || (d.name?.includes(meter.short) && d.name?.includes('电能')));
        if (matchedProp) energy = Number(matchedProp.value) || 0;
      }
      sum += (energy || 0);
    });
    return sum;
  }, [dataMap, deviceData]);

  // calculation: 三块电表的用能综合 / 冷东侧热量表累计热量 (用户公式)
  const systemCOP = cumulativeHeat > 0 ? (internalTotalEnergy / cumulativeHeat) : 0;

  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-2">
      {/* 效能综合分析栏 - 清楚表达计算关系 */}
      <div className="flex gap-1 shrink-0 h-[14%] items-stretch">
        {/* 指标 A：总电能 */}
        <div className="flex-1 flex flex-col justify-center px-2 rounded bg-yellow-900/10 border border-yellow-500/20 relative group overflow-hidden">
          <div className="text-[10px] text-yellow-300/80 font-medium mb-1">主控总电能 (A)</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-tech text-yellow-400 leading-none">
              {internalTotalEnergy.toFixed(1)}
            </span>
            <span className="text-[9px] text-yellow-500/70">kWh</span>
          </div>
        </div>

        <div className="flex items-center justify-center font-tech text-slate-500 text-lg mx-0.5">÷</div>

        {/* 指标 B：累计热量 */}
        <div className="flex-1 flex flex-col justify-center px-2 rounded bg-cyan-900/10 border border-cyan-500/20 relative group overflow-hidden">
          <div className="text-[10px] text-cyan-300/80 font-medium mb-1 truncate" title="冷东侧热量表累计热量">累计热量 (B)</div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold font-tech text-cyan-400 leading-none">
              {cumulativeHeat.toFixed(1)}
            </span>
            <span className="text-[9px] text-cyan-500/70">kWh</span>
          </div>
        </div>

        <div className="flex items-center justify-center font-tech text-slate-500 text-lg mx-0.5">=</div>

        {/* 结果：系统COP */}
        <div className="flex-1 flex flex-col justify-center px-2 rounded bg-emerald-900/10 border border-emerald-500/30 relative shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          <div className="text-[10px] text-emerald-300/90 font-bold mb-1 flex items-center gap-1">
            <Gauge size={10} /> COP (A/B)
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-tech text-emerald-400 leading-none">
              {systemCOP.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 电能表数据 - 三台独立电表 */}
      <ExternalMeterSection />

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
