
export interface EnergyData {
  time: string;
  value: number;
  prevValue?: number;
  predictValue?: number; // 预测值
}

export interface Alert {
  id: string;
  level: 'serious' | 'warning' | 'normal';
  title: string;
  location: string;
  time: string;
}

export interface RankingItem {
  name: string;
  value: number;
  unit: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
  subLabel?: string;
}

export interface CenterStat {
  label: string;
  value: string;
  pos: string;
  anchor: { x: number; y: number };
  iconName: 'Leaf' | 'Sun' | 'BatteryCharging' | 'Coins' | 'Zap' | 'BarChart3';
}

export interface PeakValleyData {
  name: string;
  value: number;
  color: string;
}

export interface KPIData {
  subject: string;
  A: number;
  fullMark: number;
}

// ============ 新增：用于 API 对接的类型定义 ============

/** 仪表盘元数据 */
export interface DashboardMeta {
  title: string;
  mainValue: string;
  mainUnit: string;
  mainLabel: string;
}

/** 可再生能源替代数据 */
export interface RenewableSubstitutionData {
  time: string;
  renewable: number;
  grid: number;
  rate: number;
}

/** 三相电压质量数据 */
export interface PhaseQualityData {
  time: string;
  a: number;
  b: number;
  c: number;
}

/** 底部统计数据 */
export interface BottomStats {
  renewableRate: number;
  cleanEnergyOutput: number;
  gridPower: number;
}

/** 仪表盘完整数据结构 - 用于 API 接口定义 */
export interface DashboardData {
  dashboardMeta: DashboardMeta;
  todayEnergyTrend: EnergyData[];
  renewableSubstitutionData: RenewableSubstitutionData[];
  phaseQualityData: PhaseQualityData[];
  peakValleyDistribution: PeakValleyData[];
  energyRanking: RankingItem[];
  energySourceMix: CategoryData[];
  alerts: Alert[];
  centerStats: CenterStat[];
  monthlyCarbonTrend: EnergyData[];
  bottomStats: BottomStats;
  kpiData: KPIData[];
}

// ============ API 响应包装类型 ============

/** 通用 API 响应结构 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

/** 分页信息 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

/** 带分页的 API 响应 */
export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: Pagination;
}
