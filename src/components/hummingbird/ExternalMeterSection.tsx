/**
 * 外部电表数据展示组件
 * 展示三台独立电表设备（62415514、47862598、28022392）的实时数据
 */

import React, { useMemo } from 'react';
import { useHummingBirdApi } from '@/hooks';
import { POLLING_INTERVAL } from '@/utils/constants';
import { Zap } from 'lucide-react';

const EXTERNAL_METERS = [
  { id: '62415514', label: '1#电表' },
  { id: '47862598', label: '2#电表' },
  { id: '28022392', label: '3#电表' },
];

/** 从设备属性列表中提取功率值：优先匹配含 power 的属性，fallback 取第一个数值属性 */
function extractPower(deviceData: Array<{ code: string; name: string; value: number | string; unit: string }>): number {
  const numeric = deviceData.map(d => ({ ...d, num: Number(d.value) || 0 }));
  const powerProp = numeric.find(d => /power/i.test(d.code) || /功率/.test(d.name));
  if (powerProp) return powerProp.num;
  return numeric[0]?.num ?? 0;
}

/** 获取三台外部电表总功率 */
export function useExternalMetersTotalPower(): number {
  const { deviceData: d1 } = useHummingBirdApi(EXTERNAL_METERS[0].id, POLLING_INTERVAL);
  const { deviceData: d2 } = useHummingBirdApi(EXTERNAL_METERS[1].id, POLLING_INTERVAL);
  const { deviceData: d3 } = useHummingBirdApi(EXTERNAL_METERS[2].id, POLLING_INTERVAL);

  return useMemo(
    () => extractPower(d1) + extractPower(d2) + extractPower(d3),
    [d1, d2, d3]
  );
}

interface DeviceMeterCardProps {
  deviceId: string;
  label: string;
}

const DeviceMeterCard: React.FC<DeviceMeterCardProps> = ({ deviceId, label }) => {
  const { deviceData, loading } = useHummingBirdApi(deviceId, POLLING_INTERVAL);

  const powerData = useMemo(() => {
    const numeric = deviceData.map(d => ({ ...d, num: Number(d.value) || 0 }));
    return numeric.find(d => /power/i.test(d.code) || /功率/.test(d.name)) || numeric[0];
  }, [deviceData]);

  return (
    <div className="flex flex-col p-2.5 rounded border bg-slate-800/40 border-slate-700/50 hover:border-yellow-500/50 transition-all h-full justify-between relative overflow-hidden group">
      {/* 装饰光晕 */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none group-hover:bg-yellow-500/10 transition-colors"></div>
      
      {/* 设备标题 */}
      <div className="flex items-center gap-1.5 shrink-0 z-10 relative">
        <Zap size={12} className="text-yellow-400 shrink-0" />
        <span className="text-xs font-bold text-slate-200 truncate">{label}</span>
      </div>

      <div className="flex-1 flex flex-col justify-end mt-2 z-10 relative">
        {loading && deviceData.length === 0 ? (
          <div className="w-4 h-4 border border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin self-center my-auto" />
        ) : !powerData ? (
          <span className="text-xs text-slate-600 self-center my-auto">暂无数据</span>
        ) : (
          <>
            <div className="text-[10px] text-slate-500 mb-0.5 flex justify-between items-end">
              <span>瞬时功率</span>
              <span className="text-[9px] text-slate-600 font-tech">{deviceId}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-tech text-yellow-400 leading-none tracking-tight">
                {powerData.num.toFixed(powerData.num % 1 === 0 ? 0 : 2)}
              </span>
              {(powerData.unit && powerData.unit !== '-') && (
                <span className="text-xs text-slate-500 ml-0.5">{powerData.unit}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ExternalMeterSection: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1 px-1 flex items-center gap-1.5 shrink-0">
        <Zap size={12} className="text-yellow-500" />
        电能表瞬时功率
      </div>
      <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
        {EXTERNAL_METERS.map(meter => (
          <DeviceMeterCard key={meter.id} deviceId={meter.id} label={meter.label} />
        ))}
      </div>
    </div>
  );
};

export default ExternalMeterSection;
