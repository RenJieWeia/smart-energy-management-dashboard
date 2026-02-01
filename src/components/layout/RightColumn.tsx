import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { MapPin, Activity, ShieldAlert } from "lucide-react";
import ChartWidget from "../common/ChartWidget";
import { COLORS } from "../../data/colors";
import { useDashboard } from "../../contexts/DashboardContext";
import AnimatedNumber from "../common/AnimatedNumber";
import { DeviceStatusList, EnergyMeterChart } from "../hummingbird";

const RightColumn: React.FC = () => {
  const { alerts, energySourceMix } = useDashboard();

  return (
    <div className="h-full flex flex-col space-y-4 pr-1 overflow-hidden">
      {/* 实时异常监测 - 深度重构 */}
      <ChartWidget
        title="网格安全实时监测"
        className="flex-[1.2] min-h-0"
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
            {alerts.map((alert, index) => {
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

      {/* 设备实时监控 - 蜂鸟物联数据 */}
      <ChartWidget title="设备运行状态" className="flex-[2] min-h-0" noPadding>
        <div className="h-full p-2 overflow-hidden">
          <DeviceStatusList />
        </div>
      </ChartWidget>
    </div>
  );
};

export default RightColumn;
