/**
 * 设备监控数据展示组件
 * 展示访问模式为 R 的只读数据
 */

import React, { useMemo } from 'react';
import type { DeviceProperty } from '@/types/hummingbird';
import { HEAT_PUMP_STATUS_MASK } from '@/utils/constants';

interface DeviceMonitorPanelProps {
  deviceData: DeviceProperty[];
}

/** 数据分类配置 */
const DATA_CATEGORIES = [
  {
    key: 'heatPumpStatus',
    title: '🔥 热泵状态',
    icon: '🔥',
    filter: (code: string) => code.includes('heatPumpStatus'),
  },
  {
    key: 'heatPumpTemp',
    title: '🌡️ 热泵温度',
    icon: '🌡️',
    filter: (code: string) => 
      (code.includes('heatPump') && code.includes('Temp')) ||
      code.includes('Condensation') || 
      code.includes('Evaporation'),
  },
  {
    key: 'supplyTemp',
    title: '💧 供回水温度',
    icon: '💧',
    filter: (code: string) => 
      (code.includes('SupplyTemp') || code.includes('ReturnTemp')) &&
      !code.includes('heatPump'),
  },
  {
    key: 'pressure',
    title: '📊 压力监测',
    icon: '📊',
    filter: (code: string) => code.includes('Pressure'),
  },
  {
    key: 'frequency',
    title: '⚡ 泵频率',
    icon: '⚡',
    filter: (code: string) => code.includes('Frequency') || code.includes('frequency'),
  },
  {
    key: 'power',
    title: '🔌 电能监测',
    icon: '🔌',
    filter: (code: string) => code.includes('ElectricityMeter'),
  },
  {
    key: 'heatMeter',
    title: '📈 热量表',
    icon: '📈',
    filter: (code: string) => code.includes('heatMeter'),
  },
  {
    key: 'environment',
    title: '🌍 环境参数',
    icon: '🌍',
    filter: (code: string) => 
      code === 'outsideTemp' || 
      code === 'waterTankVolume' ||
      code === 'systemICOP',
  },
];

/** 格式化数值显示 */
function formatValue(value: number | string, unit: string, code: string): string {
  // 热泵状态特殊处理
  if (code.includes('heatPumpStatus') && typeof value === 'number') {
    return HEAT_PUMP_STATUS_MASK[value] || `状态码: ${value}`;
  }
  
  // 数值格式化
  if (typeof value === 'number') {
    // 保留合适的小数位数
    const formatted = Number.isInteger(value) ? value : value.toFixed(2);
    return unit && unit !== '-' ? `${formatted} ${unit}` : String(formatted);
  }
  
  return String(value);
}

/** 获取数值的状态颜色 */
function getValueColor(value: number | string, code: string): string {
  if (typeof value !== 'number') return '#e2e8f0';
  
  // 温度颜色
  if (code.includes('Temp')) {
    if (value > 45) return '#f87171'; // 红色 - 高温
    if (value > 35) return '#fbbf24'; // 黄色 - 中温
    if (value < 10) return '#60a5fa'; // 蓝色 - 低温
    return '#4ade80'; // 绿色 - 正常
  }
  
  // 频率颜色
  if (code.includes('Frequency')) {
    if (value === 0) return '#94a3b8'; // 灰色 - 停止
    if (value >= 50) return '#4ade80'; // 绿色 - 满载
    return '#fbbf24'; // 黄色 - 运行中
  }
  
  // 压力颜色
  if (code.includes('Pressure')) {
    if (value > 1000) return '#f87171'; // 红色 - 高压
    return '#4ade80'; // 绿色 - 正常
  }
  
  return '#22d3ee'; // 默认青色
}

/** 数据卡片组件 */
const DataCard: React.FC<{ item: DeviceProperty }> = ({ item }) => {
  const valueColor = getValueColor(item.value as number, item.code);
  const displayValue = formatValue(item.value, item.unit, item.code);
  
  return (
    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
      <div className="text-xs text-slate-400 mb-1 truncate" title={item.name}>
        {item.name}
      </div>
      <div 
        className="text-lg font-bold truncate"
        style={{ color: valueColor }}
        title={displayValue}
      >
        {displayValue}
      </div>
    </div>
  );
};

/** 分类面板组件 */
const CategoryPanel: React.FC<{ 
  title: string; 
  items: DeviceProperty[];
}> = ({ title, items }) => {
  if (items.length === 0) return null;
  
  return (
    <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50">
      <h3 className="text-cyan-400 font-semibold mb-3 text-sm">
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <DataCard key={item.code} item={item} />
        ))}
      </div>
    </div>
  );
};

/** 主组件 */
export const DeviceMonitorPanel: React.FC<DeviceMonitorPanelProps> = ({ deviceData }) => {
  // 过滤只读数据
  const readOnlyData = useMemo(() => 
    deviceData.filter(item => item.access_mode === 'R'),
    [deviceData]
  );
  
  // 按类别分组
  const categorizedData = useMemo(() => {
    const result: Record<string, DeviceProperty[]> = {};
    const used = new Set<string>();
    
    // 按配置的类别分组
    DATA_CATEGORIES.forEach(category => {
      result[category.key] = readOnlyData.filter(item => {
        if (used.has(item.code)) return false;
        if (category.filter(item.code)) {
          used.add(item.code);
          return true;
        }
        return false;
      });
    });
    
    // 其他未分类的数据
    result['other'] = readOnlyData.filter(item => !used.has(item.code));
    
    return result;
  }, [readOnlyData]);
  
  if (readOnlyData.length === 0) {
    return (
      <div className="text-slate-400 text-center py-8">
        暂无监控数据
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {DATA_CATEGORIES.map(category => (
        <CategoryPanel
          key={category.key}
          title={category.title}
          items={categorizedData[category.key] || []}
        />
      ))}
      
      {/* 其他未分类数据 */}
      {categorizedData['other']?.length > 0 && (
        <CategoryPanel
          title="📋 其他数据"
          items={categorizedData['other']}
        />
      )}
    </div>
  );
};

export default DeviceMonitorPanel;
