/**
 * 设备状态滚动列表组件
 * 展示热泵状态、泵频率等实时数据
 */

import React, { useMemo } from 'react';
import { useHummingBirdApi } from '@/hooks';
import { HEAT_PUMP_STATUS_MASK } from '@/utils/constants';
import { Activity, Droplets, Gauge } from 'lucide-react';

/** 频率配置 */
const FREQUENCY_CONFIG = [
  { code: 'hightCirculationPumpFrequencyFirst', label: '高区1#', short: '高1' },
  { code: 'hightCirculationPumpFrequencySecond', label: '高区2#', short: '高2' },
  { code: 'lowCirculationPumpFrequencyFirst', label: '低区1#', short: '低1' },
  { code: 'lowCirculationPumpFrequencySecond', label: '低区2#', short: '低2' },
  { code: 'lowCirculationPumpFrequencyThird', label: '低区3#', short: '低3' },
  { code: 'wellPumpFrequencyFirst', label: '深井1#', short: '井1' },
  { code: 'wellPumpFrequencySecond', label: '深井2#', short: '井2' },
  { code: 'wellPumpFrequencyThird', label: '深井3#', short: '井3' },
  { code: 'hightSupplyPumpFrequency', label: '补水(高)', short: '高补' },
  { code: 'lowSupplyPumpFrequency', label: '补水(低)', short: '低补' },
];

/** 泵频率小卡片 */
const PumpFreqCard: React.FC<{
  label: string;
  value: number;
}> = ({ label, value }) => {
  const isRunning = value > 0;
  
  return (
    <div className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
      isRunning 
        ? 'bg-cyan-500/10 border-cyan-500/30' 
        : 'bg-slate-800/30 border-slate-700/20 opacity-60'
    }`}>
      <span className="text-[10px] text-slate-400 mb-0.5">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className={`text-lg font-bold font-tech leading-none ${isRunning ? 'text-cyan-400' : 'text-slate-500'}`}>
          {value.toFixed(0)}
        </span>
        <span className="text-[9px] text-slate-600 font-medium">Hz</span>
      </div>
      {/* 简单的可视化条 */}
      <div className="w-full h-1 bg-slate-700/50 rounded-full mt-2 overflow-hidden">
        <div 
          className="h-full bg-cyan-500 transition-all duration-500"
          style={{ width: `${Math.min(value * 2, 100)}%` }}
        />
      </div>
    </div>
  );
};

/** 热泵状态卡片 - 紧凑版 */
const HeatPumpCard: React.FC<{
  index: number;
  status: number;
  cSupply?: number;
  cReturn?: number;
  eSupply?: number;
  eReturn?: number;
}> = ({ index, status, cSupply, cReturn, eSupply, eReturn }) => {
  const statusText = HEAT_PUMP_STATUS_MASK[status] || `${status}`;
  const isRunning = [5, 6, 7, 16, 17, 25].includes(status);
  const isWarning = [11, 18, 19].includes(status);

  return (
    <div className={`p-3 rounded border mb-2 transition-all ${
      isWarning ? 'bg-yellow-500/5 border-yellow-500/20' : 
      isRunning ? 'bg-green-500/5 border-green-500/20' : 
      'bg-slate-800/30 border-slate-700/20'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity size={12} className={isWarning ? 'text-yellow-500' : isRunning ? 'text-green-500' : 'text-slate-500'} />
          <span className="text-[13px] font-bold text-slate-200">{index}# 机组</span>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider ${
          isWarning ? 'bg-yellow-500/20 text-yellow-400' :
          isRunning ? 'bg-green-500/20 text-green-400' :
          'bg-slate-700 text-slate-400'
        }`}>
          {statusText}
        </span>
      </div>
      
      {/* 供回水温度 - 紧凑网格 */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span className="text-slate-500">冷凝供/回</span>
          <div className="font-tech font-bold">
            <span className="text-cyan-400 text-[13px]">{cSupply?.toFixed(1) || '-'}</span>
            <span className="text-slate-700 mx-1 text-[10px]">/</span>
            <span className="text-cyan-400 text-[13px]">{cReturn?.toFixed(1) || '-'}</span>
          </div>
        </div>
        <div className="flex justify-between items-center border-b border-white/5 pb-1">
          <span className="text-slate-500">蒸发供/回</span>
          <div className="font-tech font-bold">
            <span className="text-blue-400 text-[13px]">{eSupply?.toFixed(1) || '-'}</span>
            <span className="text-slate-700 mx-1 text-[10px]">/</span>
            <span className="text-blue-400 text-[13px]">{eReturn?.toFixed(1) || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DeviceStatusList: React.FC = () => {
  const { deviceData, loading } = useHummingBirdApi();

  const dataMap = useMemo(() => 
    new Map(deviceData.map(d => [d.code, d.value as number])),
    [deviceData]
  );

  const frequencyData = useMemo(() => 
    FREQUENCY_CONFIG.map(config => ({
      ...config,
      value: dataMap.get(config.code) || 0,
    })),
    [dataMap]
  );

  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-4">
      {/* 补水箱水位 - 独立显示 */}
      <div className="flex items-center justify-between p-3 rounded bg-blue-900/10 border border-blue-500/20">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" />
          <span className="text-[13px] font-medium text-blue-200">补水箱水位</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-tech text-blue-400 leading-none">
            {(dataMap.get('waterTankVolume') || 0).toFixed(2)}
          </span>
          <span className="text-[10px] text-blue-500/70 font-medium">m³</span>
        </div>
      </div>

      {/* 热泵状态 */}
      <div>
        <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2 px-1">机组运行状态</div>
        <HeatPumpCard
          index={1}
          status={dataMap.get('heatPumpStatusFirst') || 0}
          cSupply={dataMap.get('heatPumpCondensationSupplyTempFirst')}
          cReturn={dataMap.get('heatPumpCondensationReturnTempFirst')}
          eSupply={dataMap.get('heatPumpEvaporationSupplyTempFirst')}
          eReturn={dataMap.get('heatPumpEvaporationReturnTempFirst')}
        />
        <HeatPumpCard
          index={2}
          status={dataMap.get('heatPumpStatusSecond') || 0}
          cSupply={dataMap.get('heatPumpCondensationSupplyTempThird')}
          cReturn={dataMap.get('heatPumpCondensationReturnTempThird')}
          eSupply={dataMap.get('heatPumpEvaporationSupplyTempThird')}
          eReturn={dataMap.get('heatPumpEvaporationReturnTempThird')}
        />
      </div>

      {/* 泵运行频率 - 网格布局 */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Gauge size={14} className="text-slate-500" />
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">水泵变频监测</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {frequencyData.map(item => (
            <PumpFreqCard
              key={item.code}
              label={item.short}
              value={item.value}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


export default DeviceStatusList;
