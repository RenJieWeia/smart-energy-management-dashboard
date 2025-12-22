
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
