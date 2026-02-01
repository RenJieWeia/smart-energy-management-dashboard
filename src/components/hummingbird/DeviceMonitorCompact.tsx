/**
 * 紧凑版设备监控组件
 * 用于在仪表盘侧边栏展示实时监控数据
 */

import React, { useMemo } from 'react';
import { useHummingBirdApi } from '@/hooks';
import { HEAT_PUMP_STATUS_MASK } from '@/utils/constants';
import type { DeviceProperty } from '@/types/hummingbird';

/** 格式化数值 */
function formatValue(value: number | string, code: string): string {
  if (code.includes('heatPumpStatus') && typeof value === 'number') {
    return HEAT_PUMP_STATUS_MASK[value] || `状态码: ${value}`;
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  return String(value);
}

/** 获取状态颜色 */
function getStatusColor(value: number, code: string): string {
  if (code.includes('Temp')) {
    if (value > 45) return '#f87171';
    if (value > 35) return '#fbbf24';
    if (value < 10) return '#60a5fa';
    return '#4ade80';
  }
  if (code.includes('Frequency')) {
    if (value === 0) return '#64748b';
    if (value >= 50) return '#4ade80';
    return '#fbbf24';
  }
  return '#22d3ee';
}

/** 数据项组件 */
const DataItem: React.FC<{ item: DeviceProperty }> = ({ item }) => {
  const color = typeof item.value === 'number' 
    ? getStatusColor(item.value, item.code) 
    : '#22d3ee';
  
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[11px] text-slate-400 truncate flex-1 mr-2">
        {item.name}
      </span>
      <span 
        className="text-xs font-bold font-tech whitespace-nowrap"
        style={{ color }}
      >
        {formatValue(item.value, item.code)}
        {item.unit && item.unit !== '-' && (
          <span className="text-[10px] text-slate-500 ml-0.5">{item.unit}</span>
        )}
      </span>
    </div>
  );
};

/** 分组面板组件 */
const GroupPanel: React.FC<{ 
  title: string; 
  icon: string;
  items: DeviceProperty[];
  defaultExpanded?: boolean;
}> = ({ title, icon, items, defaultExpanded = true }) => {
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  
  if (items.length === 0) return null;
  
  return (
    <div className="mb-2">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-1.5 px-2 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors"
      >
        <span className="text-[11px] font-bold text-cyan-400">
          {icon} {title}
        </span>
        <span className="text-[10px] text-slate-500">
          {expanded ? '▼' : '▶'} {items.length}
        </span>
      </button>
      {expanded && (
        <div className="px-2 mt-1">
          {items.map(item => (
            <DataItem key={item.code} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

/** 主组件 */
export const DeviceMonitorCompact: React.FC = () => {
  const { loading, error, deviceData } = useHummingBirdApi();
  
  // 过滤并分组只读数据
  const groupedData = useMemo(() => {
    const readOnly = deviceData.filter(item => item.access_mode === 'R');
    
    return {
      heatPump: readOnly.filter(item => 
        item.code.includes('heatPumpStatus')
      ),
      temp: readOnly.filter(item => 
        (item.code.includes('Temp') || item.code.includes('temp')) &&
        !item.code.includes('heatPumpStatus')
      ),
      pressure: readOnly.filter(item => 
        item.code.includes('Pressure') || item.code.includes('pressure')
      ),
      frequency: readOnly.filter(item => 
        item.code.includes('Frequency') || item.code.includes('frequency')
      ),
      power: readOnly.filter(item => 
        item.code.includes('ElectricityMeter') || item.code.includes('heatMeter')
      ),
      other: readOnly.filter(item => 
        item.code === 'outsideTemp' || 
        item.code === 'waterTankVolume' ||
        item.code === 'systemICOP'
      ),
    };
  }, [deviceData]);
  
  if (loading && deviceData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2"></div>
          <span className="text-[10px] text-slate-400">加载中...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-red-400 text-xs">
          <span>连接失败</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-1">
      {/* 状态指示 */}
      <div className="flex items-center justify-between mb-2 px-2 py-1 bg-slate-800/30 rounded">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
          <span className="text-[10px] text-slate-400">
            {loading ? '同步中' : '已连接'}
          </span>
        </div>
        <span className="text-[10px] text-slate-500">
          {deviceData.filter(d => d.access_mode === 'R').length} 项
        </span>
      </div>
      
      {/* 数据分组 */}
      <GroupPanel title="热泵状态" icon="🔥" items={groupedData.heatPump} />
      <GroupPanel title="温度监测" icon="🌡️" items={groupedData.temp} defaultExpanded={false} />
      <GroupPanel title="压力监测" icon="📊" items={groupedData.pressure} defaultExpanded={false} />
      <GroupPanel title="泵频率" icon="⚡" items={groupedData.frequency} defaultExpanded={false} />
      <GroupPanel title="能耗计量" icon="🔌" items={groupedData.power} defaultExpanded={false} />
      <GroupPanel title="环境参数" icon="🌍" items={groupedData.other} />
    </div>
  );
};

export default DeviceMonitorCompact;
