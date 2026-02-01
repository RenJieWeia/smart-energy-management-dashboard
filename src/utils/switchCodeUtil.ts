/**
 * 开关状态码工具函数
 */

import type { 
  DeviceProperty, 
  StatusMaskItem, 
  StatusItemResult,
  SwitchListItem 
} from '@/types/hummingbird';
import { 
  SWITCH_MASK, 
  HEAT_PUMP_STATUS_MASK, 
  DEVICE_RULES,
  STATUS_MASK 
} from './constants';

/**
 * 处理热泵状态
 * @param deviceProp - 设备属性
 * @returns 处理后的设备属性
 */
export function processHeatPumpStatus(deviceProp: DeviceProperty): DeviceProperty {
  if (
    deviceProp.code.includes('heatPumpStatus') &&
    Number.isInteger(deviceProp.value)
  ) {
    return {
      ...deviceProp,
      value: HEAT_PUMP_STATUS_MASK[deviceProp.value as number] || '未知状态',
      data_type: '-',
      unit: '',
    };
  }
  return deviceProp;
}

/**
 * 分组设备数据
 * @param deviceData - 设备数据数组
 * @returns 按访问模式和前缀分组的数据
 */
export function groupDeviceData(
  deviceData: DeviceProperty[]
): Record<string, Record<string, DeviceProperty[]>> {
  return deviceData.reduce((result, currentProp) => {
    const processedProp = processHeatPumpStatus(currentProp);
    const targetGroupKey =
      DEVICE_RULES.find((item) => processedProp.code.startsWith(item.prefix))
        ?.prefix || 'other';

    if (!result[processedProp.access_mode]) {
      result[processedProp.access_mode] = {};
    }

    if (!result[processedProp.access_mode][targetGroupKey]) {
      result[processedProp.access_mode][targetGroupKey] = [];
    }

    result[processedProp.access_mode][targetGroupKey].push(processedProp);
    return result;
  }, {} as Record<string, Record<string, DeviceProperty[]>>);
}

/**
 * 处理状态项
 * @param statusArray - 状态掩码数组
 * @param statusCode - 状态码属性
 * @param initialResult - 初始结果
 * @returns 处理后的状态结果
 */
export function processStatusItems(
  statusArray: StatusMaskItem[],
  statusCode: DeviceProperty | undefined,
  initialResult: StatusItemResult = {}
): StatusItemResult {
  if (!statusCode) return initialResult;

  const curStatusCode = ((statusCode.value as number) >>> 0) & 0xffff;

  return statusArray.reduce((result, currentItem) => {
    const isBitSet = (currentItem.bitMask & curStatusCode) !== 0;
    const currentGroup = result[currentItem.key] || [];

    let statusValue: string;
    switch (currentItem.key) {
      case 'warning':
        statusValue = isBitSet ? '警告⚠️⚠️' : '未警告';
        break;
      case 'remote':
        statusValue = isBitSet ? '可远程' : '本地';
        break;
      case 'default':
        statusValue = isBitSet ? '正在运行' : '停止';
        break;
      default:
        statusValue = '未知';
    }

    return {
      ...result,
      [currentItem.key]: [
        ...currentGroup,
        { ...currentItem, value: statusValue },
      ],
    };
  }, initialResult);
}

/**
 * 获取设备状态
 * @param statusCodeFirst - 第一组状态码
 * @param statusCodeSecond - 第二组状态码
 * @returns 完整的状态结果
 */
export function getDeviceStatus(
  statusCodeFirst: DeviceProperty | undefined,
  statusCodeSecond: DeviceProperty | undefined
): StatusItemResult {
  if (!statusCodeFirst || !statusCodeSecond) {
    return {};
  }

  const firstPart = processStatusItems(
    STATUS_MASK.statusFirst,
    statusCodeFirst
  );
  
  return processStatusItems(
    STATUS_MASK.statusSecond,
    statusCodeSecond,
    firstPart
  );
}

/**
 * 获取开关列表
 * @param switchNum - 开关控制码属性
 * @returns 开关列表
 */
export function getSwitchList(switchNum: DeviceProperty | undefined): SwitchListItem[] {
  if (!switchNum?.value) return [];

  const value = switchNum.value as number;

  return SWITCH_MASK.map(({ code, name, bitMask }) => ({
    code,
    name,
    value:
      code !== 'waterPump'
        ? (bitMask & value) !== 0
          ? '关闭'
          : '开启 ✅'
        : (bitMask & value) !== 0
          ? '开启 ✅'
          : '关闭',
  }));
}

/**
 * 检查开关是否开启
 * @param switchNum - 开关控制码
 * @param bitMask - 位掩码
 * @param isWaterPump - 是否为水泵（逻辑相反）
 * @returns 是否开启
 */
export function isSwitchOn(
  switchNum: number,
  bitMask: number,
  isWaterPump: boolean = false
): boolean {
  const bitSet = (bitMask & switchNum) !== 0;
  return isWaterPump ? bitSet : !bitSet;
}

/**
 * 切换开关状态
 * @param currentValue - 当前控制码值
 * @param bitMask - 要切换的位掩码
 * @returns 新的控制码值
 */
export function toggleSwitch(currentValue: number, bitMask: number): number {
  return currentValue ^ bitMask;
}
