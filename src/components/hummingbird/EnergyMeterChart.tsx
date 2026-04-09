/**
 * 电能监测图表组件
 * 展示独立电表设备的实时功率监测
 */

import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useHummingBirdApi } from '@/hooks';
import { getDeviceInfo } from '@/sdk/hbsdk';
import { POLLING_INTERVAL } from '@/utils/constants';
import type { DeviceProperty } from '@/types/hummingbird';

const METER_DEVICE_IDS = ['62415514', '47862598', '28022392'];

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

const getLevelText = (value: number): string => {
  if (value < 10) return '低负载';
  if (value < 30) return '正常';
  if (value < 50) return '偏高';
  return '高负载';
};

interface MeterRealtimeRow {
  key: string;
  deviceId: string;
  name: string;
  fullLabel: string;
  metricName: string;
  value: number;
  unit: string;
  ratio: number;
  levelText: string;
}

const extractPowerProperty = (deviceData: DeviceProperty[]): DeviceProperty | undefined => {
  return (
    deviceData.find((item) => item.code === 'power') ||
    deviceData.find((item) => /power/i.test(item.code)) ||
    deviceData.find((item) => /功率/.test(item.name)) ||
    deviceData[0]
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: MeterRealtimeRow;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload;
  return (
    <div className="bg-slate-900/95 px-3 py-2 rounded-lg border border-cyan-500/30 shadow-lg">
      <div className="text-xs text-slate-300">{data.fullLabel}</div>
      <div className="mt-1 text-sm font-bold text-cyan-400">
        {data.value.toFixed(2)} <span className="text-[10px] text-slate-500">kW</span>
      </div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
        <span>占比 {data.ratio.toFixed(1)}%</span>
        <span>{data.levelText}</span>
      </div>
    </div>
  );
};

export const EnergyMeterChart: React.FC = () => {
  // 参考 API-Test：按独立电表设备 ID 拉取实际数据
  const meterA = useHummingBirdApi(METER_DEVICE_IDS[0], POLLING_INTERVAL);
  const meterB = useHummingBirdApi(METER_DEVICE_IDS[1], POLLING_INTERVAL);
  const meterC = useHummingBirdApi(METER_DEVICE_IDS[2], POLLING_INTERVAL);

  const [deviceNameMap, setDeviceNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;

    const fetchDeviceNames = async () => {
      const entries = await Promise.all(
        METER_DEVICE_IDS.map(async (deviceId) => {
          try {
            const res = await getDeviceInfo(deviceId);
            return [deviceId, res?.result?.name || `设备 ${deviceId}`] as const;
          } catch {
            return [deviceId, `设备 ${deviceId}`] as const;
          }
        }),
      );

      if (mounted) {
        setDeviceNameMap(Object.fromEntries(entries));
      }
    };

    fetchDeviceNames();
    return () => {
      mounted = false;
    };
  }, []);

  const chartData = useMemo<MeterRealtimeRow[]>(() => {
    const sourceList = [
      { deviceId: METER_DEVICE_IDS[0], deviceData: meterA.deviceData },
      { deviceId: METER_DEVICE_IDS[1], deviceData: meterB.deviceData },
      { deviceId: METER_DEVICE_IDS[2], deviceData: meterC.deviceData },
    ];

    const rows = sourceList.map(({ deviceId, deviceData }) => {
      const prop = extractPowerProperty(deviceData);
      const value = Number(prop?.value) || 0;
      const metricName = prop?.name || '功率';
      const unit = prop?.unit && prop.unit !== '-' ? String(prop.unit) : 'kW';
      const meterName = deviceNameMap[deviceId] || `设备 ${deviceId}`;

      return {
        key: deviceId,
        deviceId,
        name: meterName,
        fullLabel: `${meterName} / ${metricName}`,
        metricName,
        value,
        unit,
      };
    });

    const total = rows.reduce((sum, item) => sum + item.value, 0);
    return rows.map((item) => ({
      ...item,
      ratio: total > 0 ? (item.value / total) * 100 : 0,
      levelText: getLevelText(item.value),
    }));
  }, [meterA.deviceData, meterB.deviceData, meterC.deviceData, deviceNameMap]);
    
  const sortedData = useMemo(
    () => [...chartData].sort((a, b) => b.value - a.value),
    [chartData],
  );

  const displayUnit = useMemo(
    () => chartData.find((item) => item.unit)?.unit || 'kW',
    [chartData],
  );

  const totalPower = useMemo(() => 
    chartData.reduce((sum, item) => sum + item.value, 0),
    [chartData]
  );

  const avgPower = useMemo(
    () => (chartData.length ? totalPower / chartData.length : 0),
    [chartData.length, totalPower],
  );

  const activeMeters = useMemo(
    () => chartData.filter((item) => item.value > 0).length,
    [chartData],
  );

  const peakMeter = useMemo(
    () => sortedData[0],
    [sortedData],
  );

  const loading =
    (meterA.loading && meterA.deviceData.length === 0) ||
    (meterB.loading && meterB.deviceData.length === 0) ||
    (meterC.loading && meterC.deviceData.length === 0);

  if (loading && chartData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
          <p className="text-[10px] text-cyan-200/80">总功率</p>
          <p className="mt-1 text-lg font-bold text-cyan-300 font-tech">{totalPower.toFixed(1)} {displayUnit}</p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <p className="text-[10px] text-emerald-200/80">平均功率</p>
          <p className="mt-1 text-lg font-bold text-emerald-300 font-tech">{avgPower.toFixed(1)} {displayUnit}</p>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2">
          <p className="text-[10px] text-indigo-200/80">活跃电表</p>
          <p className="mt-1 text-lg font-bold text-indigo-200 font-tech">{activeMeters}/{chartData.length}</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
          <p className="text-[10px] text-amber-200/80">峰值回路</p>
          <p className="mt-1 truncate text-sm font-bold text-amber-300" title={peakMeter?.fullLabel || '-'}>
            {peakMeter?.name || '-'}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-xl border border-cyan-500/15 bg-slate-950/35 px-2 py-2">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-500">实时功率监测</span>
            <span className="text-[10px] text-slate-500">单位: {displayUnit}</span>
          </div>

          <div className="h-[170px] md:h-[190px] xl:h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" barSize={11} margin={{ left: 4, right: 6, top: 4, bottom: 4 }}>
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
                  tick={{ fill: '#cbd5e1', fontSize: 10 }}
                  width={78}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.key} fill={getColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-cyan-500/15 bg-slate-950/35 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">功率贡献排行</p>
          <div className="space-y-2">
            {sortedData.map((item, index) => (
              <div key={item.key} className="rounded-lg border border-slate-700/60 bg-slate-900/60 px-2 py-1.5">
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="truncate text-slate-300" title={item.fullLabel}>
                    {index + 1}. {item.name}
                  </span>
                  <span className="font-tech text-cyan-300">{item.value.toFixed(1)} {item.unit}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/70">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(item.ratio, 2)}%`, backgroundColor: getColor(item.value) }}
                  ></div>
                </div>
                <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
                  <span>{item.levelText}</span>
                  <span>占比 {item.ratio.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <span className="inline-flex items-center gap-1 text-[9px] text-slate-500"><span className="h-2 w-2 rounded-full bg-green-500"></span>&lt;10kW</span>
        <span className="inline-flex items-center gap-1 text-[9px] text-slate-500"><span className="h-2 w-2 rounded-full bg-blue-500"></span>10-30kW</span>
        <span className="inline-flex items-center gap-1 text-[9px] text-slate-500"><span className="h-2 w-2 rounded-full bg-amber-500"></span>30-50kW</span>
        <span className="inline-flex items-center gap-1 text-[9px] text-slate-500"><span className="h-2 w-2 rounded-full bg-red-500"></span>&gt;50kW</span>
      </div>
    </div>
  );
};

export default EnergyMeterChart;
