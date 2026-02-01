/**
 * API 接口定义文件
 * 
 * 本文件定义所有后端 API 接口，方便对接实际后端服务。
 * 对接时只需修改此文件中的接口实现即可。
 */

import type {
  DashboardData,
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
  ApiResponse,
} from '../types';

// ============ API 配置 ============

/** API 基础配置 */
export const API_CONFIG = {
  /** API 基础路径，可通过环境变量配置 */
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  
  /** 请求超时时间（毫秒） */
  timeout: 10000,
  
  /** 是否使用 Mock 数据 */
  useMock: import.meta.env.VITE_USE_MOCK !== 'false',
};

// ============ API 端点定义 ============

/** API 端点路径 */
export const API_ENDPOINTS = {
  /** 获取仪表盘完整数据 */
  dashboard: '/dashboard/data',
  
  /** 获取仪表盘元数据 */
  dashboardMeta: '/dashboard/meta',
  
  /** 获取今日能源趋势 */
  todayEnergyTrend: '/energy/today-trend',
  
  /** 获取可再生能源替代数据 */
  renewableSubstitution: '/energy/renewable-substitution',
  
  /** 获取三相电压质量数据 */
  phaseQuality: '/energy/phase-quality',
  
  /** 获取峰谷分布数据 */
  peakValleyDistribution: '/energy/peak-valley',
  
  /** 获取能耗排名 */
  energyRanking: '/energy/ranking',
  
  /** 获取能源结构 */
  energySourceMix: '/energy/source-mix',
  
  /** 获取告警列表 */
  alerts: '/alerts',
  
  /** 获取中心统计数据 */
  centerStats: '/stats/center',
  
  /** 获取月度碳排放趋势 */
  monthlyCarbonTrend: '/carbon/monthly-trend',
  
  /** 获取底部统计数据 */
  bottomStats: '/stats/bottom',
  
  /** 获取 KPI 数据 */
  kpiData: '/kpi',
};

// ============ API 接口定义 ============

/**
 * 仪表盘 API 接口
 * 
 * 对接实际后端时，实现此接口即可
 */
export interface IDashboardApi {
  /** 获取仪表盘完整数据 */
  getDashboardData(): Promise<DashboardData>;
  
  /** 获取仪表盘元数据 */
  getDashboardMeta(): Promise<DashboardMeta>;
  
  /** 获取今日能源趋势 */
  getTodayEnergyTrend(): Promise<EnergyData[]>;
  
  /** 获取可再生能源替代数据 */
  getRenewableSubstitution(): Promise<RenewableSubstitutionData[]>;
  
  /** 获取三相电压质量数据 */
  getPhaseQuality(): Promise<PhaseQualityData[]>;
  
  /** 获取峰谷分布数据 */
  getPeakValleyDistribution(): Promise<PeakValleyData[]>;
  
  /** 获取能耗排名 */
  getEnergyRanking(): Promise<RankingItem[]>;
  
  /** 获取能源结构 */
  getEnergySourceMix(): Promise<CategoryData[]>;
  
  /** 获取告警列表 */
  getAlerts(): Promise<Alert[]>;
  
  /** 获取中心统计数据 */
  getCenterStats(): Promise<CenterStat[]>;
  
  /** 获取月度碳排放趋势 */
  getMonthlyCarbonTrend(): Promise<EnergyData[]>;
  
  /** 获取底部统计数据 */
  getBottomStats(): Promise<BottomStats>;
  
  /** 获取 KPI 数据 */
  getKpiData(): Promise<KPIData[]>;
}

// ============ HTTP 请求工具 ============

/**
 * 通用 HTTP 请求方法
 */
async function request<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const result: ApiResponse<T> = await response.json();
    
    // 如果后端返回标准响应格式，解析 data 字段
    if ('code' in result && 'data' in result) {
      if (result.code !== 0 && result.code !== 200) {
        throw new Error(result.message || 'API Error');
      }
      return result.data;
    }
    
    // 如果后端直接返回数据
    return result as T;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// ============ 真实 API 实现 ============

/**
 * 真实 API 实现类
 * 
 * 对接实际后端时使用此类
 */
export class RealDashboardApi implements IDashboardApi {
  async getDashboardData(): Promise<DashboardData> {
    return request<DashboardData>(API_ENDPOINTS.dashboard);
  }
  
  async getDashboardMeta(): Promise<DashboardMeta> {
    return request<DashboardMeta>(API_ENDPOINTS.dashboardMeta);
  }
  
  async getTodayEnergyTrend(): Promise<EnergyData[]> {
    return request<EnergyData[]>(API_ENDPOINTS.todayEnergyTrend);
  }
  
  async getRenewableSubstitution(): Promise<RenewableSubstitutionData[]> {
    return request<RenewableSubstitutionData[]>(API_ENDPOINTS.renewableSubstitution);
  }
  
  async getPhaseQuality(): Promise<PhaseQualityData[]> {
    return request<PhaseQualityData[]>(API_ENDPOINTS.phaseQuality);
  }
  
  async getPeakValleyDistribution(): Promise<PeakValleyData[]> {
    return request<PeakValleyData[]>(API_ENDPOINTS.peakValleyDistribution);
  }
  
  async getEnergyRanking(): Promise<RankingItem[]> {
    return request<RankingItem[]>(API_ENDPOINTS.energyRanking);
  }
  
  async getEnergySourceMix(): Promise<CategoryData[]> {
    return request<CategoryData[]>(API_ENDPOINTS.energySourceMix);
  }
  
  async getAlerts(): Promise<Alert[]> {
    return request<Alert[]>(API_ENDPOINTS.alerts);
  }
  
  async getCenterStats(): Promise<CenterStat[]> {
    return request<CenterStat[]>(API_ENDPOINTS.centerStats);
  }
  
  async getMonthlyCarbonTrend(): Promise<EnergyData[]> {
    return request<EnergyData[]>(API_ENDPOINTS.monthlyCarbonTrend);
  }
  
  async getBottomStats(): Promise<BottomStats> {
    return request<BottomStats>(API_ENDPOINTS.bottomStats);
  }
  
  async getKpiData(): Promise<KPIData[]> {
    return request<KPIData[]>(API_ENDPOINTS.kpiData);
  }
}
