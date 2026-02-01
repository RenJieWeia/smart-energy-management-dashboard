/**
 * 工具函数模块
 */

export { IconMap } from './iconMap';

// Token 管理
export { getToken, setToken, clearToken, validToken } from './token';

// HTTP 请求
export { hummingbirdInstance, loginInstance, login } from './request';

// 常量配置
export {
  DEFAULT_DEVICE_ID,
  POLLING_INTERVAL,
  DEVICE_RULES,
  SWITCH_MASK,
  HEAT_PUMP_STATUS_MASK,
  STATUS_MASK,
} from './constants';

// 开关状态码工具
export {
  processHeatPumpStatus,
  groupDeviceData,
  processStatusItems,
  getDeviceStatus,
  getSwitchList,
  isSwitchOn,
  toggleSwitch,
} from './switchCodeUtil';
