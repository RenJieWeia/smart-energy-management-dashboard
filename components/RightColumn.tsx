import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  MapPin,
  Activity,
  ShieldAlert,
} from "lucide-react";
import ChartWidget from "./ChartWidget";
import { ALERTS, ENERGY_SOURCE_MIX, COLORS } from "../constants";

const RightColumn: React.FC = () => {
  const kpiData = [
    { subject: "成本", A: 95, fullMark: 100 },
    { subject: "碳中和", A: 82, fullMark: 100 },
    { subject: "安全", A: 99, fullMark: 100 },
    { subject: "绿能", A: 75, fullMark: 100 },
    { subject: "在线", A: 88, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col space-y-4 pr-1 overflow-hidden">
      {/* 实时异常监测 - 深度重构 */}
      <ChartWidget
        title="网格安全实时监测"
        className="flex-[1.8] min-h-0"
        noPadding
        headerAction={
          <div className="flex items-center space-x-2 mr-2">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-[10px] text-red-500 font-tech font-bold">
              2 ACTIVE CRITICAL
            </span>
          </div>
        }
      >
        <div className="h-full flex flex-col px-3 pb-3">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3 pt-3">
            {ALERTS.map((alert, index) => {
              const isSerious = alert.level === "serious";
              const isWarning = alert.level === "warning";

              const baseColor = isSerious
                ? "rgba(239, 68, 68, 1)"
                : isWarning
                ? "rgba(245, 158, 11, 1)"
                : "rgba(34, 211, 238, 1)";
              const glowColor = isSerious
                ? "rgba(239, 68, 68, 0.4)"
                : isWarning
                ? "rgba(245, 158, 11, 0.3)"
                : "rgba(34, 211, 238, 0.2)";

              return (
                <div
                  key={alert.id}
                  className={`group relative overflow-hidden transition-all duration-300 border border-white/5 hover:border-white/20 hover:scale-[1.01] ${
                    isSerious
                      ? "bg-red-500/5 ring-1 ring-red-500/20"
                      : "bg-slate-900/40"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* 左侧状态光条 */}
                  <div
                    className="absolute left-0 top-0 w-1 h-full"
                    style={{
                      backgroundColor: baseColor,
                      boxShadow: `0 0 10px ${glowColor}`,
                    }}
                  ></div>

                  {/* 背景装饰斜纹 (仅限严重) */}
                  {isSerious && (
                    <div className="absolute inset-0 bg-hazard opacity-30 pointer-events-none"></div>
                  )}

                  <div className="relative p-3 pl-4">
                    {/* 顶部元数据行 */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`p-1 rounded-sm flex items-center justify-center`}
                          style={{
                            backgroundColor: `${baseColor}15`,
                            border: `1px solid ${baseColor}30`,
                          }}
                        >
                          {isSerious ? (
                            <ShieldAlert
                              size={12}
                              style={{ color: baseColor }}
                            />
                          ) : (
                            <Activity size={12} style={{ color: baseColor }} />
                          )}
                        </div>
                        <span
                          className="font-tech text-[10px] font-black uppercase tracking-[0.2em]"
                          style={{ color: baseColor }}
                        >
                          {isSerious
                            ? "Critical System Failure"
                            : isWarning
                            ? "Abnormal Deviation"
                            : "System Information"}
                        </span>
                      </div>
                      <span className="font-tech text-[10px] text-white/40 group-hover:text-white/80 transition-colors bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {alert.time}
                      </span>
                    </div>

                    {/* 报警标题 */}
                    <h4
                      className={`text-sm font-black mb-2 tracking-wide transition-colors ${
                        isSerious
                          ? "text-red-100"
                          : "text-slate-100 group-hover:text-cyan-300"
                      }`}
                    >
                      {alert.title}
                    </h4>

                    {/* 底部位置标签 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-[10px] text-slate-400 font-bold bg-black/30 rounded-md px-2 py-1 border border-white/5">
                        <MapPin size={10} className="mr-1.5 text-cyan-500" />
                        <span className="uppercase tracking-tight truncate max-w-[120px]">
                          {alert.location}
                        </span>
                      </div>

                      {/* 交互反馈区 */}
                      <button className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 hover:text-white">
                        <span>Check Details</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      </button>
                    </div>
                  </div>

                  {/* 扫描线动画 */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[dash_4s_linear_infinite]"></div>
                </div>
              );
            })}
          </div>
        </div>
      </ChartWidget>

      {/* 能源来源构成 */}
      <ChartWidget title="混合能源供给结构" className="flex-[1.2] min-h-0">
        <div className="h-full flex flex-col min-h-0">
          <div className="flex-[1.2] min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ENERGY_SOURCE_MIX}
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="85%"
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {ENERGY_SOURCE_MIX.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(1, 10, 25, 0.98)",
                    border: "1px solid #00f2ff",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mt-2 shrink-0">
            {ENERGY_SOURCE_MIX.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col border-b border-white/5 pb-1 group cursor-help"
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <div
                    className="w-2 h-2 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-slate-100 text-[11px] font-black truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-cyan-300 font-tech font-bold text-xs">
                    {item.value}%
                  </span>
                  <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                    {item.subLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartWidget>

      {/* 综合效能评估 */}
      <ChartWidget title="综合能效管理 KPI" className="flex-[1.1] min-h-0">
        <div className="h-full w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={kpiData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#e2e8f0", fontSize: 10, fontWeight: "bold" }}
              />
              <Radar
                name="目标达成"
                dataKey="A"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.4}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(1, 10, 25, 0.95)",
                  border: "1px solid #00f2ff",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </ChartWidget>
    </div>
  );
};

export default RightColumn;
