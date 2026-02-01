/**
 * 仪表盘数据服务
 * 
 * 提供 Mock 数据服务和真实 API 服务的统一接口。
 * 通过环境变量 VITE_USE_MOCK 控制使用哪种数据源。
 */

import type { DashboardData } from '../types';
import {
  MOCK_DASHBOARD_META,
  MOCK_TODAY_ENERGY_TREND,
  MOCK_RENEWABLE_SUBSTITUTION_DATA,
  MOCK_PHASE_QUALITY_DATA,
  MOCK_PEAK_VALLEY_DISTRIBUTION,
  MOCK_ENERGY_RANKING,
  MOCK_ENERGY_SOURCE_MIX,
  MOCK_ALERTS,
  MOCK_CENTER_STATS,
  MOCK_MONTHLY_CARBON_TREND,
  MOCK_BOTTOM_STATS,
  MOCK_KPI_DATA,
} from '../data';
import { IDashboardApi, RealDashboardApi, API_CONFIG } from './api';

// ============ 工具函数 ============

/** 数值波动函数 */
const fluctuate = (value: number, percent: number = 0.05) => {
  const change = value * percent * (Math.random() - 0.5) * 2;
  return Number((value + change).toFixed(2));
};

/** 字符串数值波动函数 */
const fluctuateString = (valueStr: string, percent: number = 0.05) => {
  const num = parseFloat(valueStr);
  if (isNaN(num)) return valueStr;
  return fluctuate(num, percent).toFixed(1);
};

// ============ Mock API 实现 ============

/**
 * Mock API 实现类
 * 
 * 用于开发和演示，模拟后端 API 返回数据
 */
export class MockDashboardApi implements IDashboardApi {
  private currentData: DashboardData;

  constructor() {
    // 初始化数据，深拷贝避免修改原始 Mock 数据
    this.currentData = {
      dashboardMeta: { ...MOCK_DASHBOARD_META },
      todayEnergyTrend: MOCK_TODAY_ENERGY_TREND.map(item => ({ ...item })),
      renewableSubstitutionData: MOCK_RENEWABLE_SUBSTITUTION_DATA.map(item => ({ ...item })),
      phaseQualityData: MOCK_PHASE_QUALITY_DATA.map(item => ({ ...item })),
      peakValleyDistribution: MOCK_PEAK_VALLEY_DISTRIBUTION.map(item => ({ ...item })),
      energyRanking: MOCK_ENERGY_RANKING.map(item => ({ ...item })),
      energySourceMix: MOCK_ENERGY_SOURCE_MIX.map(item => ({ ...item })),
      alerts: MOCK_ALERTS.map(item => ({ ...item })),
      centerStats: MOCK_CENTER_STATS.map(item => ({ ...item })),
      monthlyCarbonTrend: MOCK_MONTHLY_CARBON_TREND.map(item => ({ ...item })),
      bottomStats: { ...MOCK_BOTTOM_STATS },
      kpiData: MOCK_KPI_DATA.map(item => ({ ...item })),
    };
  }

  /** 模拟数据波动，让仪表盘看起来更真实 */
  private simulateDataFluctuation(): void {
    const prev = this.currentData;

    // 1. 更新主数值
    const newMainValue = fluctuateString(prev.dashboardMeta.mainValue);

    // 2. 更新今日能源趋势
    const newTodayTrend = prev.todayEnergyTrend.map(item => ({
      ...item,
      value: fluctuate(item.value, 0.02),
    }));

    // 3. 更新可再生能源替代数据
    const newRenewable = prev.renewableSubstitutionData.map(item => {
      const newR = fluctuate(item.renewable, 0.03);
      const newG = fluctuate(item.grid, 0.03);
      return {
        ...item,
        renewable: newR,
        grid: newG,
        rate: Math.round((newR / (newR + newG)) * 100),
      };
    });

    // 4. 更新三相电压质量
    const newPhaseQuality = prev.phaseQualityData.map(item => ({
      ...item,
      a: fluctuate(item.a, 0.01),
      b: fluctuate(item.b, 0.01),
      c: fluctuate(item.c, 0.01),
    }));

    // 5. 更新能耗排名
    const newRanking = prev.energyRanking
      .map(item => ({
        ...item,
        value: fluctuate(item.value, 0.02),
      }))
      .sort((a, b) => b.value - a.value);

    // 6. 更新中心统计
    const newCenterStats = prev.centerStats.map(stat => {
      const match = stat.value.match(/([\d.]+)\s*(.*)/);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = match[2];
        if (!isNaN(val)) {
          return {
            ...stat,
            value: `${fluctuate(val, 0.05).toFixed(1)} ${unit}`,
          };
        }
      }
      return stat;
    });

    // 7. 更新底部统计
    const newBottomStats = {
      renewableRate: fluctuate(prev.bottomStats.renewableRate, 0.02),
      cleanEnergyOutput: fluctuate(prev.bottomStats.cleanEnergyOutput, 0.03),
      gridPower: fluctuate(prev.bottomStats.gridPower, 0.03),
    };

    // 8. 更新 KPI 数据
    const newKpiData = prev.kpiData.map(item => ({
      ...item,
      A: Math.min(100, Math.max(0, Math.round(fluctuate(item.A, 0.05)))),
    }));

    // 9. 更新能源结构
    const newEnergySourceMix = prev.energySourceMix.map(item => ({
      ...item,
      value: Math.max(0, Math.round(fluctuate(item.value, 0.05))),
    }));
    const totalMix = newEnergySourceMix.reduce((acc, item) => acc + item.value, 0);
    const normalizedMix = newEnergySourceMix.map(item => ({
      ...item,
      value: Math.round((item.value / totalMix) * 100),
    }));

    this.currentData = {
      ...prev,
      dashboardMeta: { ...prev.dashboardMeta, mainValue: newMainValue },
      todayEnergyTrend: newTodayTrend,
      renewableSubstitutionData: newRenewable,
      phaseQualityData: newPhaseQuality,
      energyRanking: newRanking,
      centerStats: newCenterStats,
      bottomStats: newBottomStats,
      kpiData: newKpiData,
      energySourceMix: normalizedMix,
    };
  }

  async getDashboardData() {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 100));
    this.simulateDataFluctuation();
    return this.currentData;
  }

  async getDashboardMeta() {
    return this.currentData.dashboardMeta;
  }

  async getTodayEnergyTrend() {
    return this.currentData.todayEnergyTrend;
  }

  async getRenewableSubstitution() {
    return this.currentData.renewableSubstitutionData;
  }

  async getPhaseQuality() {
    return this.currentData.phaseQualityData;
  }

  async getPeakValleyDistribution() {
    return this.currentData.peakValleyDistribution;
  }

  async getEnergyRanking() {
    return this.currentData.energyRanking;
  }

  async getEnergySourceMix() {
    return this.currentData.energySourceMix;
  }

  async getAlerts() {
    return this.currentData.alerts;
  }

  async getCenterStats() {
    return this.currentData.centerStats;
  }

  async getMonthlyCarbonTrend() {
    return this.currentData.monthlyCarbonTrend;
  }

  async getBottomStats() {
    return this.currentData.bottomStats;
  }

  async getKpiData() {
    return this.currentData.kpiData;
  }
}

// ============ 服务工厂 ============

/**
 * 创建仪表盘 API 服务实例
 * 
 * 根据环境变量自动选择 Mock 或真实 API
 */
export function createDashboardApi(): IDashboardApi {
  if (API_CONFIG.useMock) {
    console.log('[DashboardService] Using Mock API');
    return new MockDashboardApi();
  } else {
    console.log('[DashboardService] Using Real API');
    return new RealDashboardApi();
  }
}

/** 默认仪表盘 API 实例 */
export const dashboardApi = createDashboardApi();

// ============ 兼容旧接口 ============

/** @deprecated 请使用 dashboardApi 代替 */
export interface IDashboardService {
  getData(): Promise<DashboardData>;
}

/** @deprecated 请使用 MockDashboardApi 代替 */
export class MockDashboardService implements IDashboardService {
  private api = new MockDashboardApi();

  async getData(): Promise<DashboardData> {
    return this.api.getDashboardData();
  }
}

/** @deprecated 请使用 RealDashboardApi 代替 */
export class ApiDashboardService implements IDashboardService {
  private api = new RealDashboardApi();

  async getData(): Promise<DashboardData> {
    return this.api.getDashboardData();
  }
}

/** @deprecated 请使用 dashboardApi 代替 */
export const dashboardService = API_CONFIG.useMock
  ? new MockDashboardService()
  : new ApiDashboardService();

