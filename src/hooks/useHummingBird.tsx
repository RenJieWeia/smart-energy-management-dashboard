/**
 * 蜂鸟物联平台 React Hooks
 * 提供设备数据的只读状态管理
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import { getDeviceLastData } from "@/sdk/hbsdk";
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

// 导出 getSwitchList 以保持兼容性
export { getSwitchList } from "@/utils/switchCodeUtil";
