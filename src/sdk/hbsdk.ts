/**
 * 蜂鸟物联平台 SDK
 * 提供设备数据获取和控制的 API 接口
 */

import { hummingbirdInstance } from '@/utils/request';
import { DEFAULT_DEVICE_ID } from '@/utils/constants';
import type { DeviceDataResponse, DeviceControlResponse, DeviceInfoResponse } from '@/types/hummingbird';

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
  /** 属性代码 */
  code: string;
  /** 开始和结束时间的时间戳数组 [startTimeMs, endTimeMs] 或按次序传入的多次 range */
  range?: number[];
  /** 是否获取全部属性 */
  isAll?: boolean;
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
    `/device/${deviceId}/thing-model/property?${queryString}`
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
  return hummingbirdInstance.post('device/control', {
    deviceId,
    data: { ...params }
  });
}

/**
 * 获取设备历史数据
 * @param deviceId - 设备ID
 * @param params - 查询参数 (code 和 range 数组)
 * @returns 历史数据响应
 */
export async function getDeviceHistoryData(
  deviceId: string = DEFAULT_DEVICE_ID,
  params: DeviceHistoryParams
): Promise<any> {
  const query = new URLSearchParams();
  query.append('code', params.code);
  if (params.isAll !== undefined) {
    query.append('isAll', String(params.isAll));
  }
  if (params.range && params.range.length > 0) {
    params.range.forEach(r => query.append('range', String(r)));
  }

  return hummingbirdInstance.get(
    `device/${deviceId}/thing-model/history-property?${query.toString()}`
  );
}

/**
 * 获取设备详细信息
 * @param deviceId - 设备ID
 * @returns 设备详细信息响应
 */
export async function getDeviceInfo(
  deviceId: string = DEFAULT_DEVICE_ID
): Promise<DeviceInfoResponse> {
  return hummingbirdInstance.get(`/device/${deviceId}`);
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
