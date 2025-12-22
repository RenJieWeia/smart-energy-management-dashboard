import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import ChartWidget from "./ChartWidget";
import { COLORS } from "../constants";
import { useDashboard } from "../DashboardContext";
import AnimatedNumber from "./AnimatedNumber";

const LeftColumn: React.FC = () => {
  const { todayEnergyTrend, energyRanking, peakValleyDistribution } =
    useDashboard();

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* 实时负荷预测对比 - 去除 AI 元素 */}
      <ChartWidget title="负荷实测与计划对比" className="flex-[1.2]" noPadding>
        <div className="h-full w-full py-4 pr-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={todayEnergyTrend}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={COLORS.primary}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#e2e8f0", fontSize: 11, fontWeight: "bold" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#e2e8f0", fontSize: 11, fontWeight: "bold" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(1, 10, 25, 0.98)",
                  border: "1px solid #00f2ff",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  fontSize: "11px",
                  paddingTop: "10px",
                  fontWeight: "bold",
                  color: "#fff",
                }}
              />
              <Area
                type="monotone"
                name="实时用电负荷"
                dataKey="value"
                stroke={COLORS.primary}
                strokeWidth={3}
                fill="url(#colorValue)"
                animationDuration={2000}
              />
              <Area
                type="monotone"
                name="计划下达负载"
                dataKey="predictValue"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeDasharray="5 5"
                strokeWidth={2}
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartWidget>

      {/* 峰平谷用电结构分析 */}
      <ChartWidget title="经济性：峰平谷分析" className="flex-[1]">
        <div className="h-full flex items-center">
          <div className="w-1/2 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={peakValleyDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                >
                  {peakValleyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(1, 10, 25, 0.95)",
                    border: "1px solid #00f2ff",
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#fff" }}
                  formatter={(value: number, name: string) => [
                    `${value}%`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-1/2 space-y-3">
            {peakValleyDistribution.map((item, idx) => (
              <div key={idx} className="flex flex-col">
                <div className="flex justify-between items-center text-[12px] mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-white font-black">{item.name}</span>
                  </div>
                  <span className="text-cyan-400 font-tech font-bold">
                    <AnimatedNumber value={item.value} />%
                  </span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.color,
                      opacity: 0.8,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartWidget>

      {/* 分区负荷排行 */}
      <ChartWidget title="高能耗区域排行" className="flex-[1.8]">
        <div className="flex flex-col space-y-6 mt-4">
          {energyRanking.map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="flex justify-between items-end mb-2.5">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded flex items-center justify-center font-black text-xs ${
                      idx < 3
                        ? "bg-cyan-400 text-black"
                        : "bg-slate-700 text-slate-100"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-white font-black text-sm tracking-wide group-hover:text-cyan-300 transition-colors">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="value-highlight text-xl font-bold">
                    <AnimatedNumber value={item.value.toFixed(1)} />
                  </span>
                  <span className="text-[10px] text-slate-300 font-black uppercase">
                    KW·H
                  </span>
                </div>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
                <div
                  className={`h-full transition-all duration-1500 rounded-full ${
                    idx < 3
                      ? "bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400"
                      : "bg-slate-500"
                  }`}
                  style={{
                    width: `${(item.value / energyRanking[0].value) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </ChartWidget>
    </div>
  );
};

export default LeftColumn;
