/**
 * 电表能耗历史趋势分析组件
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from 'recharts';
import { useHummingBirdApi } from '@/hooks';
import { getDeviceHistoryData, getDeviceInfo } from '@/sdk/hbsdk';
import type { DeviceProperty } from '@/types/hummingbird';

interface DataPoint {
  time: string;
  timestamp: number;
  total: number;
  [key: string]: string | number;
}

const METER_DEVICE_IDS = ['62415514', '47862598', '28022392'];

function getPowerPropertyName(deviceData: DeviceProperty[], fallback: string): string {
  const byCode = deviceData.find((item) => item.code === 'power' && item.name);
  if (byCode?.name) {
    return byCode.name;
  }

  const byKeyword = deviceData.find(
    (item) => /功率|电能|有功/i.test(item.name) || /power/i.test(item.code),
  );
  if (byKeyword?.name) {
    return byKeyword.name;
  }

  return fallback;
}

function pickHistoryList(response: unknown): Array<{ time?: number; timestamp?: number; value?: number | string }> {
  const data = response as {
    result?:
      | Array<{ time?: number; timestamp?: number; value?: number | string }>
      | {
          list?: Array<{ time?: number; timestamp?: number; value?: number | string }>;
          records?: Array<{ time?: number; timestamp?: number; value?: number | string }>;
        };
  };

  if (Array.isArray(data?.result)) {
    return data.result;
  }
  if (Array.isArray(data?.result?.list)) {
    return data.result.list;
  }
  if (Array.isArray(data?.result?.records)) {
    return data.result.records;
  }
  return [];
}

export const EnergyHistoryChart: React.FC = () => {
  const [timeRangeHours, setTimeRangeHours] = useState<number>(1);
  const [historyData, setHistoryData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deviceNameMap, setDeviceNameMap] = useState<Record<string, string>>({});

  // 参考 API-Test 的调用方式：按设备 ID 拉实时属性，名称直接取 API 返回值
  const meter1 = useHummingBirdApi(METER_DEVICE_IDS[0], 0);
  const meter2 = useHummingBirdApi(METER_DEVICE_IDS[1], 0);
  const meter3 = useHummingBirdApi(METER_DEVICE_IDS[2], 0);

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

  const meterSeries = useMemo(() => {
    const series = [
      {
        deviceId: METER_DEVICE_IDS[0],
        key: `device_${METER_DEVICE_IDS[0]}`,
        deviceName: deviceNameMap[METER_DEVICE_IDS[0]] || `设备 ${METER_DEVICE_IDS[0]}`,
        metricName: getPowerPropertyName(meter1.deviceData, '功率'),
      },
      {
        deviceId: METER_DEVICE_IDS[1],
        key: `device_${METER_DEVICE_IDS[1]}`,
        deviceName: deviceNameMap[METER_DEVICE_IDS[1]] || `设备 ${METER_DEVICE_IDS[1]}`,
        metricName: getPowerPropertyName(meter2.deviceData, '功率'),
      },
      {
        deviceId: METER_DEVICE_IDS[2],
        key: `device_${METER_DEVICE_IDS[2]}`,
        deviceName: deviceNameMap[METER_DEVICE_IDS[2]] || `设备 ${METER_DEVICE_IDS[2]}`,
        metricName: getPowerPropertyName(meter3.deviceData, '功率'),
      },
    ];

    // 优先展示电表设备名称，避免都显示为同一属性名（如“用功总电能”）
    const nameCounter = new Map<string, number>();
    return series.map((item) => {
      const count = (nameCounter.get(item.deviceName) ?? 0) + 1;
      nameCounter.set(item.deviceName, count);
      return {
        ...item,
        displayName: count > 1 ? `${item.deviceName} (${item.deviceId})` : item.deviceName,
      };
    });
  }, [meter1.deviceData, meter2.deviceData, meter3.deviceData, deviceNameMap]);

  const fetchHistoryData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const endTime = Date.now();
      const startTime = endTime - timeRangeHours * 3600 * 1000;

      // 参考 demo：每个电表设备都按 code=power 拉历史
      const responses = await Promise.all(
        meterSeries.map((series) =>
          getDeviceHistoryData(series.deviceId, {
            code: 'power',
            range: [startTime, endTime],
            isAll: true,
          }).catch((err) => {
            console.error(`拉取电表历史失败: ${series.deviceId}`, err);
            return null;
          }),
        ),
      );

      const mergedMap = new Map<number, DataPoint>();

      responses.forEach((response, index) => {
        const series = meterSeries[index];
        const list = pickHistoryList(response);

        list.forEach((item) => {
          const rawTime = Number(item.time ?? item.timestamp ?? 0);
          if (!rawTime) {
            return;
          }

          // 按分钟聚合，避免秒级时间差造成无法对齐
          const bucket = Math.floor(rawTime / 60000) * 60000;
          const value = Number(item.value ?? 0) || 0;

          if (!mergedMap.has(bucket)) {
            const date = new Date(bucket);
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            mergedMap.set(bucket, {
              timestamp: bucket,
              time: `${hh}:${mm}`,
              total: 0,
            });
          }

          const point = mergedMap.get(bucket)!;
          point[series.key] = value;
        });
      });

      const merged = Array.from(mergedMap.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((point) => {
          const total = meterSeries.reduce((sum, series) => {
            return sum + Number(point[series.key] || 0);
          }, 0);

          // 补齐缺失 series，防止折线断裂
          meterSeries.forEach((series) => {
            if (point[series.key] === undefined) {
              point[series.key] = 0;
            }
          });

          return {
            ...point,
            total: Number(total.toFixed(2)),
          };
        });

      setHistoryData(merged);
    } catch (err) {
      console.error('获取电表历史数据失败:', err);
      setError(err instanceof Error ? err : new Error('获取历史数据失败'));
    } finally {
      setLoading(false);
    }
  }, [meterSeries, timeRangeHours]);

  useEffect(() => {
    fetchHistoryData();
    const intervalId = setInterval(fetchHistoryData, 60000);
    return () => clearInterval(intervalId);
  }, [fetchHistoryData]);

  const chartData = historyData;

  // 计算实时环比变化(与窗口期最前端数据对比)
  const stats = useMemo(() => {
    if (chartData.length < 2) {
      return { currentTotal: '0.0', momRatio: '0.0', isIncrease: false };
    }
    const current = chartData[chartData.length - 1].total;
    const oldest = chartData[0].total; // 与窗口期开始时对比
    const momRatio = oldest > 0 ? ((current - oldest) / oldest) * 100 : 0;
    
    return {
      currentTotal: current.toFixed(1),
      momRatio: momRatio.toFixed(1),
      isIncrease: momRatio >= 0
    };
  }, [chartData]);

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f43f5e', '#14b8a6', '#f97316'];

  return (
    <div className="h-full flex flex-col pt-2">
      {/* 头部控制与统计 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">实时总功率 (kW)</span>
            <span className="text-xl font-bold text-cyan-400">{stats.currentTotal}</span>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              较期初峰值: 
              <span className={`font-bold ${stats.isIncrease ? 'text-rose-500' : 'text-emerald-500'}`}>
                {stats.isIncrease ? '↑' : '↓'} {Math.abs(Number(stats.momRatio))}%
              </span>
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          {error ? (
             <div className="text-red-500 text-xs self-center mr-2 truncate max-w-[100px]">{error.message}</div>
          ) : loading ? (
             <div className="text-cyan-500 text-xs self-center mr-2 animate-pulse">请求中...</div>
          ) : (
             <div className="text-emerald-500 text-xs self-center mr-2 cursor-pointer hover:text-emerald-400" onClick={fetchHistoryData} title="手动刷新">数据就绪</div>
          )}
          <button 
            className={`px-3 py-1 text-xs rounded border ${timeRangeHours === 1 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
            onClick={() => setTimeRangeHours(1)}
          >
            近1小时
          </button>
          <button 
            className={`px-3 py-1 text-xs rounded border ${timeRangeHours === 4 ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
            onClick={() => setTimeRangeHours(4)}
          >
            近4小时
          </button>
        </div>
      </div>

      {/* 图表 */}
      <div className="flex-1 min-h-0">
        {!loading && chartData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
            当前时间段暂无历史数据
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Line 
              name="总功率 (kW)"
              type="monotone" 
              dataKey="total" 
              stroke="#06b6d4" 
              strokeWidth={3}
              dot={{ r: 2, fill: '#0a0f1c', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#06b6d4', stroke: '#fff' }}
              isAnimationActive={true}
            />
            {meterSeries.map((series, index) => (
              <Line 
                key={series.key}
                name={series.displayName} 
                type="monotone" 
                dataKey={series.key} 
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={1} 
                strokeDasharray="3 3" 
                dot={false} 
                isAnimationActive={true} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EnergyHistoryChart;