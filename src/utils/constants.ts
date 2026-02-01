/**
 * 蜂鸟物联平台常量配置
 */

import type {
  DeviceRule,
  SwitchMaskItem,
  HeatPumpStatusMask,
  StatusMask
} from '@/types/hummingbird';

/** 默认设备ID */
export const DEFAULT_DEVICE_ID = '74835337';

/** 轮询间隔时间（毫秒） */
export const POLLING_INTERVAL = 5000;

/** 设备分组规则 */
export const DEVICE_RULES: DeviceRule[] = [
  { name: '低区设备属性', prefix: 'low' },
  { name: '高区设备属性', prefix: 'high' },
  { name: '深井设备属性', prefix: 'well' },
  { name: '热泵设备属性', prefix: 'heatPump' },
];

/** 开关掩码配置 */
export const SWITCH_MASK: SwitchMaskItem[] = [
  { bitMask: 1, name: '高区1#循环泵', code: 'hightCirculationFirst' },
  { bitMask: 1 << 1, name: '高区2#循环泵', code: 'hightCirculationSecond' },
  { bitMask: 1 << 2, name: '低区1#循环泵', code: 'lowCirculationFirst' },
  { bitMask: 1 << 3, name: '低区2#循环泵', code: 'lowCirculationSecond' },
  { bitMask: 1 << 4, name: '低区3#循环泵', code: 'lowCirculationThird' },
  { bitMask: 1 << 5, name: '深井1#循环泵', code: 'wellCirculationFirst' },
  { bitMask: 1 << 6, name: '深井2#循环泵', code: 'wellCirculationSecond' },
  { bitMask: 1 << 7, name: '深井3#循环泵', code: 'wellCirculationThird' },
  { bitMask: 1 << 8, name: '水泵系统启停控制', code: 'waterPump' },
];

/** 热泵状态映射 */
export const HEAT_PUMP_STATUS_MASK: HeatPumpStatusMask = {
  0: '机组待机',
  4: '压缩机启动延时',
  5: '机组正在启动',
  6: '机组制冷中',
  7: '机组制热中',
  8: '温度到,机组暂停',
  9: '压缩机停机延时',
  11: '机组报警⚠️⚠️',
  16: '防冻运行中',
  17: '机组除霜运行中',
  18: '出水温度过高,机组暂停⚠️⚠️',
  19: '出水温度过低,机组暂停⚠️⚠️',
  24: '机组正在停机',
  25: '机组井水降温中',
};

/** 状态掩码配置 */
export const STATUS_MASK: StatusMask = {
  statusFirst: [
    {
      bitMask: 1 << 0,
      name: '高区1#循环泵远程状态',
      code: 'hightCirculationRemoteStatuFirst',
      key: 'remote',
    },
    {
      bitMask: 1 << 1,
      name: '高区1#循环泵故障状态',
      code: 'hightCirculationWarningStatuFirst',
      key: 'warning',
    },
    {
      bitMask: 1 << 2,
      name: '高区1#循环泵运行状态',
      code: 'hightCirculationStatuFirst',
      key: 'default',
    },
    {
      bitMask: 1 << 3,
      name: '高区2#循环泵远程状态',
      code: 'hightCirculationRemoteStatuSecond',
      key: 'remote',
    },
    {
      bitMask: 1 << 4,
      name: '高区2#循环泵故障状态',
      code: 'hightCirculationWarningStatuSecond',
      key: 'warning',
    },
    {
      bitMask: 1 << 5,
      name: '高区2#循环泵运行状态',
      code: 'hightCirculationStatuSecond',
      key: 'default',
    },
    {
      bitMask: 1 << 6,
      name: '高区补水泵远程状态',
      code: 'hightSupplyPumpRemoteStatu',
      key: 'remote',
    },
    {
      bitMask: 1 << 7,
      name: '高区补水泵故障状态',
      code: 'hightSupplyPumpWarningStatu',
      key: 'warning',
    },
    {
      bitMask: 1 << 8,
      name: '高区补水泵运行状态',
      code: 'hightSupplyPumpStatu',
      key: 'default',
    },
    {
      bitMask: 1 << 9,
      name: '低区1#循环泵远程状态',
      code: 'lowCirculationRemoteStatuFirst',
      key: 'remote',
    },
    {
      bitMask: 1 << 10,
      name: '低区1#循环泵故障状态',
      code: 'lowCirculationWarningStatuFirst',
      key: 'warning',
    },
    {
      bitMask: 1 << 11,
      name: '低区1#循环泵运行状态',
      code: 'lowCirculationStatuFirst',
      key: 'default',
    },
    {
      bitMask: 1 << 12,
      name: '低区2#循环泵远程状态',
      code: 'lowCirculationRemoteStatuSecond',
      key: 'remote',
    },
    {
      bitMask: 1 << 13,
      name: '低区2#循环泵故障状态',
      code: 'lowCirculationWarningStatuSecond',
      key: 'warning',
    },
    {
      bitMask: 1 << 14,
      name: '低区2#循环泵运行状态',
      code: 'lowCirculationStatuSecond',
      key: 'default',
    },
    {
      bitMask: 1 << 15,
      name: '低区3#循环泵远程状态',
      code: 'lowCirculationRemoteStatuThird',
      key: 'remote',
    },
  ],
  statusSecond: [
    {
      bitMask: 1 << 0,
      name: '低区3#循环泵故障状态',
      code: 'lowCirculationWarningStatuThird',
      key: 'warning',
    },
    {
      bitMask: 1 << 1,
      name: '低区3#循环泵运行状态',
      code: 'lowCirculationStatuThird',
      key: 'default',
    },
    {
      bitMask: 1 << 2,
      name: '低区补水泵远程状态',
      code: 'lowSupplyPumpRemoteStatu',
      key: 'remote',
    },
    {
      bitMask: 1 << 3,
      name: '低区补水泵故障状态',
      code: 'lowSupplyPumpWarningStatu',
      key: 'warning',
    },
    {
      bitMask: 1 << 4,
      name: '低区补水泵运行状态',
      code: 'lowSupplyPumpStatu',
      key: 'default',
    },
    {
      bitMask: 1 << 5,
      name: '1#深井泵远程状态',
      code: 'deepWellRemoteStatuFirst',
      key: 'remote',
    },
    {
      bitMask: 1 << 6,
      name: '1#深井泵故障状态',
      code: 'deepWellWarningStatuFirst',
      key: 'warning',
    },
    {
      bitMask: 1 << 7,
      name: '1#深井泵运行状态',
      code: 'deepWellStatuFirst',
      key: 'default',
    },
    {
      bitMask: 1 << 8,
      name: '2#深井泵远程状态',
      code: 'deepWellRemoteStatuSecond',
      key: 'remote',
    },
    {
      bitMask: 1 << 9,
      name: '2#深井泵故障状态',
      code: 'deepWellWarningtatuSecond',
      key: 'warning',
    },
    {
      bitMask: 1 << 10,
      name: '2#深井泵运行状态',
      code: 'deepWellStatuSecond',
      key: 'default',
    },
    {
      bitMask: 1 << 11,
      name: '3#深井泵远程状态',
      code: 'deepWellRemoteStatuThird',
      key: 'remote',
    },
    {
      bitMask: 1 << 12,
      name: '3#深井泵故障状态',
      code: 'deepWellWarningStatuThird',
      key: 'warning',
    },
    {
      bitMask: 1 << 13,
      name: '3#深井泵运行状态',
      code: 'deepWellStatuThird',
      key: 'default',
    },
  ],
};
