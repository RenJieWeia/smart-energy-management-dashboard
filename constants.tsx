/**
 * @deprecated 此文件已废弃，请使用新的数据模块
 * 
 * - Mock 数据请使用: import { MOCK_* } from './data'
 * - 颜色常量请使用: import { COLORS } from './data'
 * - 类型定义请使用: import type { ... } from './types'
 * 
 * 保留此文件仅用于向后兼容
 */

import {
  EnergyData,
  Alert,
  RankingItem,
  CategoryData,
  CenterStat,
  PeakValleyData,
  KPIData,
} from "./types";

// 从新的数据模块重新导出
export { COLORS } from './data/colors';

export {
  MOCK_DASHBOARD_META as DASHBOARD_META,
  MOCK_BOTTOM_STATS as BOTTOM_STATS,
  MOCK_KPI_DATA as KPI_DATA,
  MOCK_TODAY_ENERGY_TREND as TODAY_ENERGY_TREND,
  MOCK_RENEWABLE_SUBSTITUTION_DATA as RENEWABLE_SUBSTITUTION_DATA,
  MOCK_PHASE_QUALITY_DATA as PHASE_QUALITY_DATA,
  MOCK_PEAK_VALLEY_DISTRIBUTION as PEAK_VALLEY_DISTRIBUTION,
  MOCK_ENERGY_RANKING as ENERGY_RANKING,
  MOCK_ENERGY_SOURCE_MIX as ENERGY_SOURCE_MIX,
  MOCK_ALERTS as ALERTS,
  MOCK_CENTER_STATS as CENTER_STATS,
  MOCK_MONTHLY_CARBON_TREND as MONTHLY_CARBON_TREND,
} from './data/mockData';

// 重新导出类型（保持兼容）
export type { RenewableSubstitutionData } from './types';
