import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { 
  DashboardData,
  DashboardMeta,
  EnergyData, 
  Alert, 
  RankingItem, 
  CategoryData, 
  CenterStat, 
  PeakValleyData, 
  KPIData,
  RenewableSubstitutionData,
  PhaseQualityData,
  BottomStats,
} from '../types';
import { dashboardApi } from '../services/dashboardService';

// ============ Context 类型定义 ============

interface DashboardContextType extends DashboardData {
  /** 数据是否正在加载 */
  isLoading: boolean;
  /** 加载错误信息 */
  error: string | null;
  /** 手动刷新数据 */
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ============ Hook ============

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// ============ 默认初始数据 ============

const initialData: DashboardData = {
  dashboardMeta: {
    title: "",
    mainValue: "0",
    mainUnit: "",
    mainLabel: "",
  },
  todayEnergyTrend: [],
  renewableSubstitutionData: [],
  phaseQualityData: [],
  peakValleyDistribution: [],
  energyRanking: [],
  energySourceMix: [],
  alerts: [],
  centerStats: [],
  monthlyCarbonTrend: [],
  bottomStats: {
    renewableRate: 0,
    cleanEnergyOutput: 0,
    gridPower: 0,
  },
  kpiData: [],
};

// ============ Provider 组件 ============

/** 数据刷新间隔（毫秒） */
const REFRESH_INTERVAL = 10000;

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DashboardData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取数据的函数
  const fetchData = useCallback(async () => {
    try {
      const newData = await dashboardApi.getDashboardData();
      setData(newData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取数据失败';
      setError(errorMessage);
      console.error('[DashboardContext] Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 手动刷新函数
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchData();
  }, [fetchData]);

  // 初始加载和定时刷新
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const contextValue: DashboardContextType = {
    ...data,
    isLoading,
    error,
    refresh,
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};
