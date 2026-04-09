/**
 * 蜂鸟物联平台 React Hooks
 * 提供设备数据的只读状态管理
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { getDeviceLastData, getDeviceHistoryData } from "@/sdk/hbsdk";
import { DEFAULT_DEVICE_ID, POLLING_INTERVAL } from "@/utils/constants";
import {
  groupDeviceData,
  getDeviceStatus,
  getSwitchList,
} from "@/utils/switchCodeUtil";
import type {
  DeviceProperty,
  GroupedDeviceData,
  SwitchListItem,
  StatusItemResult,
} from "@/types/hummingbird";

/** Hook 返回值类型 */
export interface UseHummingBirdApiResult {
  /** 加载状态 */
  loading: boolean;
  /** 错误信息 */
  error: Error | null;
  /** 分组后的设备数据 */
  groupedData: GroupedDeviceData;
  /** 开关控制码属性 */
  switchNum: DeviceProperty | undefined;
  /** 获取设备状态 */
  getStatus: () => StatusItemResult;
  /** 获取开关列表 */
  getSwitches: () => SwitchListItem[];
  /** 原始设备数据 */
  deviceData: DeviceProperty[];
  /** 手动刷新数据 */
  refresh: () => Promise<void>;
}

/**
 * 蜂鸟物联平台数据 Hook
 * @param deviceId - 设备ID，默认使用 DEFAULT_DEVICE_ID
 * @param pollingInterval - 轮询间隔，默认 3000ms，设为 0 禁用轮询
 * @returns 设备数据和操作方法
 */
export function useHummingBirdApi(
  deviceId: string = DEFAULT_DEVICE_ID,
  pollingInterval: number = POLLING_INTERVAL,
): UseHummingBirdApiResult {
  const [deviceData, setDeviceData] = useState<DeviceProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 分组后的设备数据
  const groupedData = useMemo(
    () => groupDeviceData(deviceData) as GroupedDeviceData,
    [deviceData],
  );

  // 开关控制码
  const switchNum = useMemo(() => groupedData.RW?.other?.at(-1), [groupedData]);

  // 第一组状态码
  const statusCodeFirst = useMemo(
    () => groupedData.R?.other?.find((v) => v.code === "statusCodeFirst"),
    [groupedData],
  );

  // 第二组状态码
  const statusCodeSecond = useMemo(
    () => groupedData.R?.other?.find((v) => v.code === "statusCodeSecond"),
    [groupedData],
  );

  // 获取设备状态
  const getStatus = useCallback((): StatusItemResult => {
    return getDeviceStatus(statusCodeFirst, statusCodeSecond);
  }, [statusCodeFirst, statusCodeSecond]);

  // 获取开关列表
  const getSwitches = useCallback((): SwitchListItem[] => {
    return getSwitchList(switchNum);
  }, [switchNum]);

  // 获取设备数据
  const fetchData = useCallback(async () => {
    try {
      const result = await getDeviceLastData(deviceId);
      setDeviceData([...result.result.list]);
      setError(null);
    } catch (err) {
      console.error("获取设备数据失败:", err);
      setError(err instanceof Error ? err : new Error("获取设备数据失败"));
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  // 手动刷新
  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  // 初始化和轮询
  useEffect(() => {
    fetchData();

    // 设置轮询（如果 pollingInterval > 0）
    if (pollingInterval > 0) {
      const intervalId = setInterval(fetchData, pollingInterval);
      return () => clearInterval(intervalId);
    }
  }, [fetchData, pollingInterval]);

  return {
    loading,
    error,
    groupedData,
    switchNum,
    getStatus,
    getSwitches,
    deviceData,
    refresh,
  };
}

/** 历史数据点 */
export interface HistoryDataPoint {
  time: string;
  [key: string]: string | number; // 允许任意电表的 code 作为 key 存入数据
}

/**
 * 获取多项设备历史数据的 Hook
 */
export function useHummingBirdHistoryApi(
  deviceId: string = DEFAULT_DEVICE_ID,
  codes: string[] = [],
  timeRangeHours: number = 1,
) {
  const [historyData, setHistoryData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistoryData = useCallback(async () => {
    if (codes.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const endTime = Date.now();
      const startTime = endTime - timeRangeHours * 3600 * 1000;

      // 封装并发请求
      const promises = codes.map((code) =>
        getDeviceHistoryData(deviceId, {
          code,
          range: [startTime, endTime],
          isAll: true,
        }).catch((err) => {
          console.error(`获取属性 ${code} 历史数据失败:`, err);
          return null; // 单个请求失败不影响其他
        }),
      );

      const results = await Promise.all(promises);

      // 合并对齐各个属性的时间戳数据
      const mergedMap = new Map<string, HistoryDataPoint>();

      results.forEach((res, index) => {
        const codeKey = codes[index];
        const list = res?.result?.list || [];
        
        list.forEach((item: any) => {
          const timeStr = new Date(item.time).toLocaleTimeString("zh-CN", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
          });
          
          if (!mergedMap.has(timeStr)) {
            mergedMap.set(timeStr, { time: timeStr });
          }
          
          const dataPoint = mergedMap.get(timeStr)!;
          dataPoint[codeKey] = Number(item.value || 0);
        });
      });

      // 排序返回结果
      const sorted = Array.from(mergedMap.values()).sort((a, b) =>
        a.time.localeCompare(b.time),
      );
      setHistoryData(sorted);
    } catch (err) {
      console.error("历史数据整理失败:", err);
      setError(err instanceof Error ? err : new Error("获取历史数据失败"));
    } finally {
      setLoading(false);
    }
  }, [deviceId, codes.join(","), timeRangeHours]);

  useEffect(() => {
    fetchHistoryData();
    const intervalId = setInterval(fetchHistoryData, 60000); // 每分钟拉取一次最新历史数据填补
    return () => clearInterval(intervalId);
  }, [fetchHistoryData]);

  return { historyData, loading, error, refresh: fetchHistoryData };
}

// 导出 getSwitchList 以保持兼容性
export { getSwitchList } from "@/utils/switchCodeUtil";
