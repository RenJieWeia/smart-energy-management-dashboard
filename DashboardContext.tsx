import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  DASHBOARD_META, 
  TODAY_ENERGY_TREND, 
  RENEWABLE_SUBSTITUTION_DATA, 
  PHASE_QUALITY_DATA, 
  PEAK_VALLEY_DISTRIBUTION, 
  ENERGY_RANKING, 
  ENERGY_SOURCE_MIX, 
  ALERTS, 
  CENTER_STATS, 
  MONTHLY_CARBON_TREND,
  BOTTOM_STATS,
  KPI_DATA,
  RenewableSubstitutionData
} from './constants';
import { EnergyData, Alert, RankingItem, CategoryData, CenterStat, PeakValleyData, KPIData } from './types';

interface PhaseQualityData {
  time: string;
  a: number;
  b: number;
  c: number;
}

interface DashboardContextType {
  dashboardMeta: typeof DASHBOARD_META;
  todayEnergyTrend: EnergyData[];
  renewableSubstitutionData: RenewableSubstitutionData[];
  phaseQualityData: PhaseQualityData[];
  peakValleyDistribution: PeakValleyData[];
  energyRanking: RankingItem[];
  energySourceMix: CategoryData[];
  alerts: Alert[];
  centerStats: CenterStat[];
  monthlyCarbonTrend: EnergyData[];
  bottomStats: typeof BOTTOM_STATS;
  kpiData: KPIData[];
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Helper to fluctuate a number by a percentage
const fluctuate = (value: number, percent: number = 0.05) => {
  const change = value * percent * (Math.random() - 0.5) * 2;
  return Number((value + change).toFixed(2));
};

// Helper to fluctuate string number (e.g. "123.45")
const fluctuateString = (valueStr: string, percent: number = 0.05) => {
    const num = parseFloat(valueStr);
    if (isNaN(num)) return valueStr;
    return fluctuate(num, percent).toFixed(1);
};

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DashboardContextType>({
    dashboardMeta: DASHBOARD_META,
    todayEnergyTrend: TODAY_ENERGY_TREND,
    renewableSubstitutionData: RENEWABLE_SUBSTITUTION_DATA,
    phaseQualityData: PHASE_QUALITY_DATA,
    peakValleyDistribution: PEAK_VALLEY_DISTRIBUTION,
    energyRanking: ENERGY_RANKING,
    energySourceMix: ENERGY_SOURCE_MIX,
    alerts: ALERTS,
    centerStats: CENTER_STATS,
    monthlyCarbonTrend: MONTHLY_CARBON_TREND,
    bottomStats: BOTTOM_STATS,
    kpiData: KPI_DATA,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        // 1. Update Dashboard Meta (Main Value)
        const newMainValue = fluctuateString(prev.dashboardMeta.mainValue);
        
        // 2. Update Today Energy Trend (Last few points)
        const newTodayTrend = prev.todayEnergyTrend.map(item => ({
            ...item,
            value: fluctuate(item.value, 0.02)
        }));

        // 3. Update Renewable Substitution
        const newRenewable = prev.renewableSubstitutionData.map(item => {
            const newR = fluctuate(item.renewable, 0.03);
            const newG = fluctuate(item.grid, 0.03);
            return {
                ...item,
                renewable: newR,
                grid: newG,
                rate: Math.round((newR / (newR + newG)) * 100)
            };
        });

        // 4. Phase Quality
        const newPhaseQuality = prev.phaseQualityData.map(item => ({
            ...item,
            a: fluctuate(item.a, 0.01),
            b: fluctuate(item.b, 0.01),
            c: fluctuate(item.c, 0.01),
        }));

        // 5. Energy Ranking
        const newRanking = prev.energyRanking.map(item => ({
            ...item,
            value: fluctuate(item.value, 0.02)
        })).sort((a, b) => b.value - a.value); // Keep sorted

        // 6. Center Stats
        const newCenterStats = prev.centerStats.map(stat => {
            // Extract number from string like "185.2 kW" or "2.4 kg/m²"
            const match = stat.value.match(/([\d.]+)\s*(.*)/);
            if (match) {
                const val = parseFloat(match[1]);
                const unit = match[2];
                if (!isNaN(val)) {
                    return {
                        ...stat,
                        value: `${fluctuate(val, 0.05).toFixed(1)} ${unit}`
                    };
                }
            }
            return stat;
        });

        // 7. Bottom Stats
        const newBottomStats = {
            renewableRate: fluctuate(prev.bottomStats.renewableRate, 0.02),
            cleanEnergyOutput: fluctuate(prev.bottomStats.cleanEnergyOutput, 0.03),
            gridPower: fluctuate(prev.bottomStats.gridPower, 0.03)
        };

        // 8. KPI Data
        const newKpiData = prev.kpiData.map(item => ({
            ...item,
            A: Math.min(100, Math.max(0, Math.round(fluctuate(item.A, 0.05))))
        }));

        // 9. Energy Source Mix
        const newEnergySourceMix = prev.energySourceMix.map(item => ({
            ...item,
            value: Math.max(0, Math.round(fluctuate(item.value, 0.05)))
        }));
        const totalMix = newEnergySourceMix.reduce((acc, item) => acc + item.value, 0);
        const normalizedMix = newEnergySourceMix.map(item => ({
            ...item,
            value: Math.round((item.value / totalMix) * 100)
        }));

        return {
            ...prev,
            dashboardMeta: { ...prev.dashboardMeta, mainValue: newMainValue },
            todayEnergyTrend: newTodayTrend,
            renewableSubstitutionData: newRenewable,
            phaseQualityData: newPhaseQuality,
            energyRanking: newRanking,
            centerStats: newCenterStats,
            bottomStats: newBottomStats,
            kpiData: newKpiData,
            energySourceMix: normalizedMix
        };
      });
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardContext.Provider value={data}>
      {children}
    </DashboardContext.Provider>
  );
};
