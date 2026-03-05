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

  const numericProperties = useMemo(() =>
    deviceData
      .map(d => ({ code: d.code, name: d.name, value: Number(d.value) || 0, unit: d.unit }))
      .filter(d => typeof d.value === 'number' && !isNaN(d.value)),
    [deviceData]
  );

  return (
    <div className="flex flex-col items-stretch p-2 rounded border bg-slate-800/30 border-slate-700/30 hover:border-yellow-500/30 transition-all h-full overflow-hidden">
      {/* 设备标题 */}
      <div className="flex items-center gap-1 mb-1.5 shrink-0">
        <Zap size={10} className="text-yellow-400 shrink-0" />
        <span className="text-[11px] font-bold text-slate-300 truncate">{label}</span>
        <span className="text-[9px] text-slate-600 ml-auto shrink-0">{deviceId}</span>
      </div>

      {loading && deviceData.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-3 h-3 border border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        </div>
      ) : numericProperties.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-[10px] text-slate-600">暂无数据</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-0.5 min-h-0">
          {numericProperties.map(prop => (
            <div
              key={prop.code}
              className="flex items-center justify-between text-[10px] px-1 py-0.5 rounded hover:bg-slate-700/30"
            >
              <span className="text-slate-500 truncate max-w-[55%]" title={prop.name || prop.code}>
                {prop.name || prop.code}
              </span>
              <span className="font-tech text-yellow-400 shrink-0 ml-1">
                {prop.value.toFixed(prop.value % 1 === 0 ? 0 : 2)}
                {prop.unit && prop.unit !== '-' && (
                  <span className="text-slate-600 ml-0.5">{prop.unit}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
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
