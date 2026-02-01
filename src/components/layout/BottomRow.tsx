import React from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  Legend,
} from "recharts";
import ChartWidget from "../common/ChartWidget";
import { COLORS } from "../../data/colors";
import { useDashboard } from "../../contexts/DashboardContext";
import AnimatedNumber from "../common/AnimatedNumber";

const BottomRow: React.FC = () => {
  const { monthlyCarbonTrend, renewableSubstitutionData, bottomStats } = useDashboard();
  return (
    <div className="flex h-full space-x-8">
      {/* 月度碳中和足迹 */}
      <div className="flex-1 min-w-0">
        <ChartWidget
          title="园区月度碳足迹追踪 (tCO2e)"
          className="h-full"
          noPadding
        >
          <div className="h-full w-full py-4 pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyCarbonTrend}
                margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.renewable}
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.renewable}
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
                  tick={{ fill: "#f1f5f9", fontSize: 11, fontWeight: "black" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#f1f5f9", fontSize: 11, fontWeight: "black" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(1, 10, 25, 0.98)",
                    border: `1px solid ${COLORS.renewable}`,
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="累计排放"
                  stroke={COLORS.renewable}
                  fill="url(#colorCarbon)"
                  strokeWidth={3}
                />
                <Area
                  type="monotone"
                  dataKey="predictValue"
                  name="排放配额"
                  stroke="rgba(239, 68, 68, 0.5)"
                  fill="transparent"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartWidget>
      </div>

      {/* 可再生能源替代率分析 - 替换电能质量 */}
      <div className="flex-1 min-w-0">
        <ChartWidget
          title="绿能供应：可再生能源替代率分析"
          className="h-full"
          noPadding
        >
          <div className="h-full w-full py-2 pr-4 flex flex-col">
            {/* 实时替代率核心指标 */}
            <div className="flex items-center justify-between px-6 py-2 shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/50 font-black uppercase tracking-widest">
                  当前绿能替代率
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-tech font-bold text-emerald-400">
                    <AnimatedNumber value={bottomStats.renewableRate} />%
                  </span>
                  <span className="text-[10px] text-emerald-400/60 font-black">
                    ↑ 4.2%
                  </span>
                </div>
              </div>
              <div className="flex space-x-6">
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-white/40 font-black uppercase">
                    清洁能源出力
                  </span>
                  <span className="text-sm font-tech font-bold text-cyan-400">
                    <AnimatedNumber value={bottomStats.cleanEnergyOutput} /> kW
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[9px] text-white/40 font-black uppercase">
                    外部市电拉口
                  </span>
                  <span className="text-sm font-tech font-bold text-blue-400">
                    <AnimatedNumber value={bottomStats.gridPower} /> kW
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={renewableSubstitutionData}
                  margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                  stackOffset="expand"
                >
                  <defs>
                    <linearGradient
                      id="colorRenewableStack"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.renewable}
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.renewable}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorGridStack"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS.grid}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.grid}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(1, 10, 25, 0.95)",
                      border: "1px solid rgba(0,242,255,0.3)",
                      fontSize: "11px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)} kW`]}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "10px",
                      bottom: 5,
                      fontWeight: "bold",
                    }}
                  />
                  <Area
                    type="monotone"
                    name="清洁绿能出力"
                    dataKey="renewable"
                    stackId="1"
                    stroke={COLORS.renewable}
                    fill="url(#colorRenewableStack)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    name="外部市电负载"
                    dataKey="grid"
                    stackId="1"
                    stroke={COLORS.grid}
                    fill="url(#colorGridStack)"
                    strokeWidth={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartWidget>
      </div>
    </div>
  );
};

export default BottomRow;
