/**
 * 蜂鸟物联平台相关类型定义
 */

/** 设备属性数据 */
export interface DeviceProperty {
  code: string;
  name: string;
  value: number | string;
  data_type: string;
  unit: string;
  access_mode: 'R' | 'RW' | 'W';
  time?: number;
}

/** 设备数据响应 */
export interface DeviceDataResponse {
  code: number;
  message: string;
  result: {
    list: DeviceProperty[];
  };
}

/** 设备控制响应 */
export interface DeviceControlResponse {
  code: number;
  message: string;
  result: unknown;
}

/** 登录响应 */
export interface LoginResponse {
  code: number;
  message: string;
  result: {
    token: string;
    [key: string]: unknown;
  };
}

/** 设备规则配置 */
export interface DeviceRule {
  name: string;
  prefix: string;
}

/** 开关掩码配置 */
export interface SwitchMaskItem {
  bitMask: number;
  name: string;
  code: string;
}

/** 状态掩码配置 */
export interface StatusMaskItem {
  bitMask: number;
  name: string;
  code: string;
  key: 'remote' | 'warning' | 'default';
}

/** 状态掩码组 */
export interface StatusMask {
  statusFirst: StatusMaskItem[];
  statusSecond: StatusMaskItem[];
}

/** 热泵状态映射 */
export type HeatPumpStatusMask = Record<number, string>;

/** 分组后的设备数据 */
export type GroupedDeviceData = {
  [accessMode in 'R' | 'RW' | 'W']?: {
    [groupKey: string]: DeviceProperty[];
  };
};

/** 开关列表项 */
export interface SwitchListItem {
  code: string;
  name: string;
  value: string;
}

/** 状态项结果 */
export interface StatusItemResult {
  [key: string]: Array<StatusMaskItem & { value: string }>;
}
