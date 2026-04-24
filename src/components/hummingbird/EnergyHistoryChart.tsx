/**
 * 电表能耗历史趋势分析组件
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDeviceHistoryData, getDeviceInfo } from '@/sdk/hbsdk';

interface DataPoint {
  time: string;
  timestamp: number;
  bucketIndex: number;
  total: number;
  compareTotal: number;
  [key: string]: string | number;
}

type TimeUnit = 'day' | 'month' | 'year';

interface MeterSeriesItem {
  deviceId: string;
  key: string;
  deviceName: string;
  displayName: string;
}

interface TimeBucket {
  key: string;
  label: string;
  timestamp: number;
}

const METER_DEVICE_IDS = ['62415514', '47862598', '28022392'];
const METER_NAME_FALLBACK_MAP: Record<string, string> = {
  '62415514': '1#电表',
  '47862598': '2#电表',
  '28022392': '3#电表',
};

const CURRENT_STACK_COLORS = ['#22d3ee', '#34d399', '#60a5fa'];
const COMPARE_BAR_STYLE = {
  fill: '#f59e0b',
  stroke: '#fbbf24',
};

function formatDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatMonthInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function parseDateInputValue(value: string): Date | null {
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function parseMonthInputValue(value: string): Date | null {
  const [yearStr, monthStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!year || !month) {
    return null;
  }

  return new Date(year, month - 1, 1, 12, 0, 0, 0);
}

function shiftAnchorDate(unit: TimeUnit, anchorDate: Date, offset: number): Date {
  const next = new Date(anchorDate.getTime());

  if (unit === 'day') {
    next.setDate(next.getDate() + offset);
    return next;
  }

  if (unit === 'month') {
    next.setMonth(next.getMonth() + offset, 1);
    return next;
  }

  next.setFullYear(next.getFullYear() + offset, 0, 1);
  return next;
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

function getPeriodRange(
  unit: TimeUnit,
  anchorDate: Date,
  scope: 'current' | 'previous' = 'current',
): { startTime: number; endTime: number } {
  const targetDate = scope === 'previous' ? shiftAnchorDate(unit, anchorDate, -1) : anchorDate;
  const y = targetDate.getFullYear();
  const m = targetDate.getMonth();
  const d = targetDate.getDate();

  if (unit === 'day') {
    return {
      startTime: new Date(y, m, d, 0, 0, 0, 0).getTime(),
      endTime: new Date(y, m, d, 23, 59, 59, 999).getTime(),
    };
  }

  if (unit === 'month') {
    return {
      startTime: new Date(y, m, 1, 0, 0, 0, 0).getTime(),
      endTime: new Date(y, m + 1, 0, 23, 59, 59, 999).getTime(),
    };
  }

  return {
    startTime: new Date(y, 0, 1, 0, 0, 0, 0).getTime(),
    endTime: new Date(y, 11, 31, 23, 59, 59, 999).getTime(),
  };
}

function createTimeBuckets(unit: TimeUnit, anchorDate: Date): TimeBucket[] {
  const y = anchorDate.getFullYear();
  const m = anchorDate.getMonth();
  const d = anchorDate.getDate();

  if (unit === 'day') {
    return Array.from({ length: 24 }, (_, hour) => ({
      key: String(hour),
      label: `${String(hour).padStart(2, '0')}:00`,
      timestamp: new Date(y, m, d, hour, 0, 0, 0).getTime(),
    }));
  }

  if (unit === 'month') {
    const dayCount = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: dayCount }, (_, dayIndex) => {
      const day = dayIndex + 1;
      return {
        key: String(day),
        label: `${String(day).padStart(2, '0')}日`,
        timestamp: new Date(y, m, day, 0, 0, 0, 0).getTime(),
      };
    });
  }

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const month = monthIndex + 1;
    return {
      key: String(month),
      label: `${String(month).padStart(2, '0')}月`,
      timestamp: new Date(y, monthIndex, 1, 0, 0, 0, 0).getTime(),
    };
  });
}

function resolveBucketKey(rawTime: number, unit: TimeUnit): string {
  const date = new Date(rawTime);
  if (unit === 'day') {
    return String(date.getHours());
  }
  if (unit === 'month') {
    return String(date.getDate());
  }
  return String(date.getMonth() + 1);
}

function getComparePeriodLabel(unit: TimeUnit): string {
  if (unit === 'day') {
    return '前一日';
  }
  if (unit === 'month') {
    return '前一月';
  }
  return '前一年';
}

function getXAxisInterval(unit: TimeUnit, count: number): number {
  if (unit === 'day') {
    return 1;
  }
  if (unit === 'month') {
    return count > 15 ? 2 : 1;
  }
  return 0;
}

function getFallbackMeterName(deviceId: string): string {
  return METER_NAME_FALLBACK_MAP[deviceId] || `电表-${deviceId.slice(-4)}`;
}

export const EnergyHistoryChart: React.FC = () => {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('day');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');
  const [selectedAnchorDate, setSelectedAnchorDate] = useState<Date>(() => new Date());
  const [historyData, setHistoryData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [deviceNameMap, setDeviceNameMap] = useState<Record<string, string>>({});

  const dateInputValue = useMemo(
    () => formatDateInputValue(selectedAnchorDate),
    [selectedAnchorDate],
  );

  const monthInputValue = useMemo(
    () => formatMonthInputValue(selectedAnchorDate),
    [selectedAnchorDate],
  );

  useEffect(() => {
    let mounted = true;

    const fetchDeviceNames = async () => {
      const entries = await Promise.all(
        METER_DEVICE_IDS.map(async (deviceId) => {
          try {
            const res = await getDeviceInfo(deviceId);
            return [deviceId, res?.result?.name || getFallbackMeterName(deviceId)] as const;
          } catch {
            return [deviceId, getFallbackMeterName(deviceId)] as const;
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

  const meterSeries = useMemo<MeterSeriesItem[]>(() => {
    const series = METER_DEVICE_IDS.map((deviceId) => ({
      deviceId,
      key: `device_${deviceId}`,
      deviceName: deviceNameMap[deviceId] || getFallbackMeterName(deviceId),
    }));

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
  }, [deviceNameMap]);

  const activeSeries = useMemo<MeterSeriesItem[]>(() => {
    if (selectedSourceId === 'all') {
      return meterSeries;
    }
    return meterSeries.filter((series) => series.deviceId === selectedSourceId);
  }, [meterSeries, selectedSourceId]);

  const selectedSourceLabel = useMemo(() => {
    if (selectedSourceId === 'all') {
      return '全部电表';
    }
    return (
      meterSeries.find((series) => series.deviceId === selectedSourceId)?.displayName ||
      getFallbackMeterName(selectedSourceId)
    );
  }, [meterSeries, selectedSourceId]);

  const handleDayChange = useCallback((value: string) => {
    const parsedDate = parseDateInputValue(value);
    if (!parsedDate) {
      return;
    }
    setSelectedAnchorDate(parsedDate);
  }, []);

  const handleMonthChange = useCallback((value: string) => {
    const parsedDate = parseMonthInputValue(value);
    if (!parsedDate) {
      return;
    }
    setSelectedAnchorDate(parsedDate);
  }, []);

  const handleYearChange = useCallback((value: string) => {
    const year = Number(value);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return;
    }
    setSelectedAnchorDate(new Date(year, 0, 1, 12, 0, 0, 0));
  }, []);

  const fetchHistoryData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentRange = getPeriodRange(timeUnit, selectedAnchorDate, 'current');
      const previousRange = getPeriodRange(timeUnit, selectedAnchorDate, 'previous');
      const buckets = createTimeBuckets(timeUnit, selectedAnchorDate);

      const mergedMap = new Map<string, DataPoint>();

      buckets.forEach((bucket, index) => {
        mergedMap.set(bucket.key, {
          time: bucket.label,
          timestamp: bucket.timestamp,
          bucketIndex: index,
          total: 0,
          compareTotal: 0,
        });
      });

      const [currentResponses, compareResponses] = await Promise.all([
        Promise.all(
          activeSeries.map((series) =>
            getDeviceHistoryData(series.deviceId, {
              code: 'power',
              range: [currentRange.startTime, currentRange.endTime],
              isAll: true,
            }).catch((err) => {
              console.error(`拉取当期电表历史失败: ${series.deviceId}`, err);
              return null;
            }),
          ),
        ),
        Promise.all(
          activeSeries.map((series) =>
            getDeviceHistoryData(series.deviceId, {
              code: 'power',
              range: [previousRange.startTime, previousRange.endTime],
              isAll: true,
            }).catch((err) => {
              console.error(`拉取对比期电表历史失败: ${series.deviceId}`, err);
              return null;
            }),
          ),
        ),
      ]);

      const mergePeriodResponses = (
        responses: Array<unknown | null>,
        range: { startTime: number; endTime: number },
        scope: 'current' | 'compare',
      ) => {
        responses.forEach((response, index) => {
          const series = activeSeries[index];
          const list = pickHistoryList(response);

          if (!series) {
            return;
          }

          list.forEach((item) => {
            const rawTime = Number(item.time ?? item.timestamp ?? 0);
            if (!rawTime || rawTime < range.startTime || rawTime > range.endTime) {
              return;
            }

            const bucketKey = resolveBucketKey(rawTime, timeUnit);
            const value = Number(item.value ?? 0) || 0;
            const point = mergedMap.get(bucketKey);

            if (!point) {
              return;
            }

            const sumKey = `${series.key}_${scope}_sum`;
            const countKey = `${series.key}_${scope}_count`;

            point[sumKey] = Number(point[sumKey] || 0) + value;
            point[countKey] = Number(point[countKey] || 0) + 1;
          });
        });
      };

      mergePeriodResponses(currentResponses, currentRange, 'current');
      mergePeriodResponses(compareResponses, previousRange, 'compare');

      const merged = Array.from(mergedMap.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((point) => {
          let total = 0;
          let compareTotal = 0;

          activeSeries.forEach((series) => {
            const currentSumKey = `${series.key}_current_sum`;
            const currentCountKey = `${series.key}_current_count`;
            const compareSumKey = `${series.key}_compare_sum`;
            const compareCountKey = `${series.key}_compare_count`;

            const currentSum = Number(point[currentSumKey] || 0);
            const currentCount = Number(point[currentCountKey] || 0);
            const currentAverage = currentCount > 0 ? currentSum / currentCount : 0;

            const compareSum = Number(point[compareSumKey] || 0);
            const compareCount = Number(point[compareCountKey] || 0);
            const compareAverage = compareCount > 0 ? compareSum / compareCount : 0;

            point[series.key] = Number(currentAverage.toFixed(2));
            total += currentAverage;
            compareTotal += compareAverage;

            delete point[currentSumKey];
            delete point[currentCountKey];
            delete point[compareSumKey];
            delete point[compareCountKey];
          });

          return {
            ...point,
            total: Number(total.toFixed(2)),
            compareTotal: Number(compareTotal.toFixed(2)),
          };
        });

      setHistoryData(merged);
    } catch (err) {
      console.error('获取电表历史数据失败:', err);
      setError(err instanceof Error ? err : new Error('获取历史数据失败'));
    } finally {
      setLoading(false);
    }
  }, [activeSeries, timeUnit, selectedAnchorDate]);

  useEffect(() => {
    fetchHistoryData();
    const intervalId = setInterval(fetchHistoryData, 60000);
    return () => clearInterval(intervalId);
  }, [fetchHistoryData]);

  const chartData = historyData;
  const hasData = useMemo(
    () => chartData.some((point) => point.total > 0 || Number(point.compareTotal) > 0),
    [chartData],
  );

  const comparePeriodLabel = useMemo(() => getComparePeriodLabel(timeUnit), [timeUnit]);

  const periodLabel = useMemo(() => {
    const y = selectedAnchorDate.getFullYear();
    const m = String(selectedAnchorDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedAnchorDate.getDate()).padStart(2, '0');

    if (timeUnit === 'day') {
      return `${y}-${m}-${d}`;
    }
    if (timeUnit === 'month') {
      return `${y}-${m}`;
    }
    return String(y);
  }, [timeUnit, selectedAnchorDate]);

  const granularityLabel = useMemo(() => {
    if (timeUnit === 'day') {
      return '小时';
    }
    if (timeUnit === 'month') {
      return '日';
    }
    return '月';
  }, [timeUnit]);

  // 计算当前周期与前一周期变化
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        currentTotal: '0.0',
        periodCompareRatio: '0.0',
        currentPeriodTotal: '0.0',
        comparePeriodTotal: '0.0',
        isIncrease: false,
      };
    }

    const activePoints = chartData.filter((point) => point.total > 0);
    const currentPoint =
      activePoints[activePoints.length - 1] || chartData[chartData.length - 1];

    const current = currentPoint?.total || 0;
    const currentPeriodTotal = chartData.reduce(
      (sum, point) => sum + Number(point.total || 0),
      0,
    );
    const comparePeriodTotal = chartData.reduce(
      (sum, point) => sum + Number(point.compareTotal || 0),
      0,
    );
    const periodCompareRatio =
      comparePeriodTotal > 0
        ? ((currentPeriodTotal - comparePeriodTotal) / comparePeriodTotal) * 100
        : 0;

    return {
      currentTotal: current.toFixed(1),
      periodCompareRatio: periodCompareRatio.toFixed(1),
      currentPeriodTotal: currentPeriodTotal.toFixed(1),
      comparePeriodTotal: comparePeriodTotal.toFixed(1),
      isIncrease: periodCompareRatio >= 0,
    };
  }, [chartData]);

  return (
    <div className="h-full flex flex-col pt-2">
      {/* 头部控制与统计 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">
              {selectedSourceId === 'all' ? '当前总功率 (kW)' : '当前功率 (kW)'}
            </span>
            <span className="text-xl font-bold text-cyan-400">{stats.currentTotal}</span>
            <span className="text-[10px] text-slate-500 mt-0.5">统计周期: {periodLabel}</span>
            <span className="text-[10px] text-slate-500">数据源: {selectedSourceLabel}</span>
          </div>
          <div className="flex flex-col justify-end pb-1">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              较{comparePeriodLabel}累计:
              <span className={`font-bold ${stats.isIncrease ? 'text-rose-500' : 'text-emerald-500'}`}>
                {stats.isIncrease ? '↑' : '↓'} {Math.abs(Number(stats.periodCompareRatio))}%
              </span>
            </span>
            <span className="text-[10px] text-slate-500">
              累计: {stats.currentPeriodTotal} / {stats.comparePeriodTotal} (kW)
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-end">
          {error ? (
            <div className="text-red-500 text-xs self-center mr-2 truncate max-w-[120px]">{error.message}</div>
          ) : loading ? (
            <div className="text-cyan-500 text-xs self-center mr-2 animate-pulse">请求中...</div>
          ) : (
            <div
              className="text-emerald-500 text-xs self-center mr-2 cursor-pointer hover:text-emerald-400"
              onClick={fetchHistoryData}
              title="手动刷新"
            >
              数据就绪
            </div>
          )}

          <select
            value={selectedSourceId}
            onChange={(event) => setSelectedSourceId(event.target.value)}
            className="h-7 rounded border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-200 outline-none hover:border-slate-500 focus:border-cyan-500"
            title="选择数据源"
          >
            <option value="all">全部电表</option>
            {meterSeries.map((series) => (
              <option key={series.deviceId} value={series.deviceId}>
                {series.displayName}
              </option>
            ))}
          </select>

          {timeUnit === 'day' && (
            <input
              type="date"
              value={dateInputValue}
              onChange={(event) => handleDayChange(event.target.value)}
              className="h-7 rounded border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-200 outline-none hover:border-slate-500 focus:border-cyan-500"
              title="选择日期"
            />
          )}

          {timeUnit === 'month' && (
            <input
              type="month"
              value={monthInputValue}
              onChange={(event) => handleMonthChange(event.target.value)}
              className="h-7 rounded border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-200 outline-none hover:border-slate-500 focus:border-cyan-500"
              title="选择月份"
            />
          )}

          {timeUnit === 'year' && (
            <input
              type="number"
              min={2000}
              max={2100}
              step={1}
              value={selectedAnchorDate.getFullYear()}
              onChange={(event) => handleYearChange(event.target.value)}
              className="h-7 w-20 rounded border border-slate-700 bg-slate-900/80 px-2 text-xs text-slate-200 outline-none hover:border-slate-500 focus:border-cyan-500"
              title="选择年份"
            />
          )}
        </div>
      </div>

      <div className="mb-2 text-[10px] text-slate-500">
        对比维度: 当期按{granularityLabel}统计，并与{comparePeriodLabel}总功率同位叠加显示
      </div>

      {/* 图表 */}
      <div className="flex-1 min-h-0">
        {!loading && !hasData ? (
          <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
            当前周期与对比周期暂无历史数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              barCategoryGap="24%"
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={getXAxisInterval(timeUnit, chartData.length)}
                minTickGap={4}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '8px',
                }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '12px' }}
                labelFormatter={(label) => `${granularityLabel}: ${String(label)}`}
                formatter={(value: number | string, name: string) => [
                  `${Number(value).toFixed(2)} kW`,
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

              <Bar
                name={`${comparePeriodLabel}${selectedSourceId === 'all' ? '总功率' : '功率'}`}
                dataKey="compareTotal"
                fill={COMPARE_BAR_STYLE.fill}
                stroke={COMPARE_BAR_STYLE.stroke}
                strokeWidth={1}
                barSize={12}
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
              />

              {activeSeries.map((series, index) => (
                <Bar
                  key={series.key}
                  name={series.displayName}
                  dataKey={series.key}
                  stackId="current"
                  fill={CURRENT_STACK_COLORS[index % CURRENT_STACK_COLORS.length]}
                  barSize={12}
                  radius={index === meterSeries.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                  isAnimationActive={true}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EnergyHistoryChart;