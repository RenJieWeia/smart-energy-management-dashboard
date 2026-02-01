/**
 * 蜂鸟物联平台 SDK
 * 提供设备数据获取和控制的 API 接口
 */

import { hummingbirdInstance } from '@/utils/request';
import { DEFAULT_DEVICE_ID } from '@/utils/constants';
import type { DeviceDataResponse, DeviceControlResponse } from '@/types/hummingbird';

/** 设备数据查询参数 */
export interface DeviceDataParams {
  /** 是否获取全部属性 */
  isAll?: boolean;
  /** 是否只获取最新数据 */
  last?: boolean;
}

/** 设备控制参数 */
export interface DeviceControlParams {
  [key: string]: number | string | boolean;
}

/** 设备历史数据查询参数 */
export interface DeviceHistoryParams {
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 属性代码 */
  propertyCode?: string;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  pageSize?: number;
}

/**
 * 获取设备最新数据
 * @param deviceId - 设备ID
 * @param params - 查询参数
 * @returns 设备数据响应
 */
export async function getDeviceLastData(
  deviceId: string = DEFAULT_DEVICE_ID,
  params: DeviceDataParams = { isAll: true, last: true }
): Promise<DeviceDataResponse> {
  const queryString = new URLSearchParams({
    isAll: String(params.isAll ?? true),
    last: String(params.last ?? true)
  }).toString();

  return hummingbirdInstance.get(
    `/api/v1/device/${deviceId}/thing-model/property?${queryString}`
  );
}

/**
 * 更新设备控制参数
 * @param deviceId - 设备ID
 * @param params - 控制参数
 * @returns 控制响应
 */
export async function updateDevice(
  deviceId: string = DEFAULT_DEVICE_ID,
  params: DeviceControlParams
): Promise<DeviceControlResponse> {
  return hummingbirdInstance.post('/api/v1/device/control', {
    deviceId,
    data: { ...params }
  });
}

/**
 * 获取设备历史数据
 * @param deviceId - 设备ID
 * @param params - 查询参数
 * @returns 历史数据响应
 */
export async function getDeviceHistoryData(
  deviceId: string = DEFAULT_DEVICE_ID,
  params: DeviceHistoryParams = {}
): Promise<unknown> {
  return hummingbirdInstance.get(
    `/api/v1/device/${deviceId}/thing-model/history`,
    { params }
  );
}

/**
 * 批量获取多个设备的最新数据
 * @param deviceIds - 设备ID数组
 * @returns 设备数据数组
 */
export async function getMultipleDevicesData(
  deviceIds: string[]
): Promise<DeviceDataResponse[]> {
  const promises = deviceIds.map((id) => getDeviceLastData(id));
  return Promise.all(promises);
}

/**
 * 发送设备控制命令
 * @param deviceId - 设备ID
 * @param controlCode - 控制码
 * @returns 控制响应
 */
export async function sendControlCommand(
  deviceId: string = DEFAULT_DEVICE_ID,
  controlCode: number
): Promise<DeviceControlResponse> {
  return updateDevice(deviceId, { controlCode });
}
