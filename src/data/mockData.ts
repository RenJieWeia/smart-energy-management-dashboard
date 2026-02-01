/**
 * Mock 数据文件
 * 
 * 本文件包含所有用于开发和演示的模拟数据。
 * 数据格式与实际 API 返回格式保持一致。
 */

import type {
  DashboardMeta,
  EnergyData,
  RenewableSubstitutionData,
  PhaseQualityData,
  PeakValleyData,
  RankingItem,
  CategoryData,
  Alert,
  CenterStat,
  BottomStats,
  KPIData,
} from '../types';
import { COLORS } from './colors';

// ============ 仪表盘元数据 ============

export const MOCK_DASHBOARD_META: DashboardMeta = {
  title: "智慧能源数字孪生综合监管平台",
  mainValue: "1288.5",
  mainUnit: "kW·h",
  mainLabel: "全场区实时综合用电负载",
};

// ============ 底部统计数据 ============

export const MOCK_BOTTOM_STATS: BottomStats = {
  renewableRate: 32.8,
  cleanEnergyOutput: 185.2,
  gridPower: 412.5,
};

// ============ KPI 数据 ============

export const MOCK_KPI_DATA: KPIData[] = [
  { subject: "成本", A: 95, fullMark: 100 },
  { subject: "碳中和", A: 82, fullMark: 100 },
  { subject: "安全", A: 99, fullMark: 100 },
  { subject: "绿能", A: 75, fullMark: 100 },
  { subject: "在线", A: 88, fullMark: 100 },
];

// ============ 今日能源趋势 ============

export const MOCK_TODAY_ENERGY_TREND: EnergyData[] = [
  { time: "00:00", value: 310, predictValue: 300 },
  { time: "03:00", value: 280, predictValue: 290 },
  { time: "06:00", value: 420, predictValue: 400 },
  { time: "09:00", value: 980, predictValue: 950 },
  { time: "12:00", value: 1150, predictValue: 1200 },
  { time: "15:00", value: 1020, predictValue: 1050 },
  { time: "18:00", value: 890, predictValue: 850 },
  { time: "21:00", value: 540, predictValue: 550 },
  { time: "23:59", value: 380, predictValue: 380 },
];

// ============ 可再生能源替代数据 ============

export const MOCK_RENEWABLE_SUBSTITUTION_DATA: RenewableSubstitutionData[] =
  Array.from({ length: 12 }, (_, i) => {
    const renewable = 150 + Math.random() * 100;
    const grid = 400 + Math.random() * 200;
    return {
      time: `${i * 2}:00`,
      renewable,
      grid,
      rate: Math.round((renewable / (renewable + grid)) * 100),
    };
  });

// ============ 三相电压质量数据 ============

export const MOCK_PHASE_QUALITY_DATA: PhaseQualityData[] = Array.from(
  { length: 12 },
  (_, i) => ({
    time: `${i * 2}:00`,
    a: 220 + Math.random() * 5,
    b: 218 + Math.random() * 8,
    c: 222 + Math.random() * 4,
  })
);

// ============ 峰谷分布数据 ============

export const MOCK_PEAK_VALLEY_DISTRIBUTION: PeakValleyData[] = [
  { name: "高峰时段", value: 45, color: "#ef4444" },
  { name: "平峰时段", value: 30, color: "#f59e0b" },
  { name: "谷峰时段", value: 25, color: "#10b981" },
];

// ============ 能耗排名数据 ============

export const MOCK_ENERGY_RANKING: RankingItem[] = [
  { name: "A1 柔性制造车间", value: 452.12, unit: "kW·h" },
  { name: "智算中心 DC-01", value: 389.55, unit: "kW·h" },
  { name: "精密涂装生产线", value: 312.8, unit: "kW·h" },
  { name: "综合研发办公楼", value: 156.44, unit: "kW·h" },
  { name: "园区环境辅助系统", value: 98.22, unit: "kW·h" },
];

// ============ 能源结构数据 ============

export const MOCK_ENERGY_SOURCE_MIX: CategoryData[] = [
  { name: "国家电网", value: 65, color: COLORS.grid, subLabel: "高压引入" },
  { name: "屋顶光伏", value: 18, color: COLORS.renewable, subLabel: "分布式" },
  { name: "储能系统", value: 12, color: COLORS.storage, subLabel: "磷酸铁锂" },
  { name: "风力发电", value: 5, color: "#06b6d4", subLabel: "园区微网" },
];

// ============ 告警数据 ============

export const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    level: "serious",
    title: "1号主变压器温升异常 (92℃)",
    location: "核心配电室",
    time: "10:15",
  },
  {
    id: "2",
    level: "warning",
    title: "光伏并网逆变器功率波动",
    location: "B区顶层",
    time: "11:22",
  },
  {
    id: "3",
    level: "serious",
    title: "三相电流不平衡度超标 (18%)",
    location: "生产 A 区",
    time: "12:05",
  },
  {
    id: "4",
    level: "normal",
    title: "无功补偿电容器组正常投切",
    location: "补偿柜 #2",
    time: "13:00",
  },
  {
    id: "5",
    level: "warning",
    title: "充电桩群组通信心跳中断",
    location: "南停车场",
    time: "13:45",
  },
];

// ============ 中心统计数据 ============

export const MOCK_CENTER_STATS: CenterStat[] = [
  {
    label: "碳减排强度",
    value: "2.4 kg/m²",
    pos: "top-[15%] left-[2%]",
    anchor: { x: 8, y: 15 },
    iconName: "Leaf",
  },
  {
    label: "瞬时出力",
    value: "185.2 kW",
    pos: "top-[50%] left-[8%] -translate-y-1/2",
    anchor: { x: 14, y: 50 },
    iconName: "Sun",
  },
  {
    label: "储能状态",
    value: "放电中 Mode",
    pos: "bottom-[15%] left-[2%]",
    anchor: { x: 8, y: 85 },
    iconName: "BatteryCharging",
  },
  {
    label: "电费损耗",
    value: "￥2.4 /s",
    pos: "top-[15%] right-[2%]",
    anchor: { x: 92, y: 15 },
    iconName: "Coins",
  },
  {
    label: "系统谐波",
    value: "2.8 % THD",
    pos: "top-[50%] right-[8%] -translate-y-1/2",
    anchor: { x: 86, y: 50 },
    iconName: "Zap",
  },
  {
    label: "能效 KPI",
    value: "94.2 % OK",
    pos: "bottom-[15%] right-[2%]",
    anchor: { x: 92, y: 85 },
    iconName: "BarChart3",
  },
];

// ============ 月度碳排放趋势 ============

export const MOCK_MONTHLY_CARBON_TREND: EnergyData[] = Array.from(
  { length: 12 },
  (_, i) => ({
    time: `${i + 1}月`,
    value: 450 + Math.random() * 200,
    predictValue: 500,
  })
);
