import React, { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  Gauge,
  Server,
  Thermometer,
  TrendingUp,
  Waves,
} from "lucide-react";
import {
  DeviceStatusList,
  EnergyHistoryCompareLineChart,
  EnergyHistoryChart,
  EnergyMeterChart,
  FlowMeterChart,
  PressureChart,
  TemperatureChart,
} from "@/components/hummingbird";
import Header from "@/components/layout/Header";

interface DashboardPanelProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  title,
  subtitle,
  icon,
  className = "",
  bodyClassName = "",
  children,
}) => {
  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md shadow-[0_14px_45px_rgba(2,8,23,0.55)] transition-all duration-300 hover:border-cyan-400/35 hover:shadow-[0_18px_55px_rgba(8,47,73,0.45)] ${className}`}
    >
      <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl"></div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-400/55 to-transparent"></div>

      <div className="relative z-10 flex items-center justify-between border-b border-cyan-400/10 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold tracking-wide text-cyan-300">
            {title}
          </h3>
          <p className="truncate text-[11px] text-slate-400">{subtitle}</p>
        </div>
        <div className="ml-3 shrink-0 rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-300">
          {icon}
        </div>
      </div>

      <div className={`relative z-10 p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
};

const DashboardAnalysisPage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const formatTime = (date: Date) => date.toTimeString().split(" ")[0];

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-[#010612] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute -top-[12%] left-[8%] h-[260px] w-[260px] rounded-full bg-cyan-400/15 blur-[110px]"></div>
        <div className="absolute top-[40%] -right-[4%] h-[320px] w-[320px] rounded-full bg-emerald-400/10 blur-[130px]"></div>
        <div className="absolute bottom-0 left-[30%] h-[280px] w-[280px] rounded-full bg-blue-500/10 blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-1 flex-col space-y-5 overflow-y-auto p-6 custom-scrollbar">
        <div className="animate-slide-down">
          <Header currentTime={currentTime} />
        </div>

        <section className="animate-fade-in rounded-2xl border border-cyan-500/25 bg-slate-900/65 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-300/80">
                Energy Analytics Deck
              </p>
              <h2 className="mt-1 bg-gradient-to-r from-cyan-200 via-cyan-400 to-emerald-300 bg-clip-text font-cyber text-2xl font-black tracking-wider text-transparent md:text-3xl">
                能源数据分析 Dashboard
              </h2>
              <p className="mt-2 text-sm text-slate-300/90">
                聚焦电能趋势、环比波动与多维运行状态的联动分析视图
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2">
                <p className="text-[10px] text-cyan-200/80">数据源</p>
                <p className="mt-1 text-sm font-bold text-cyan-200">IoT API</p>
              </div>
              <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
                <p className="text-[10px] text-emerald-200/80">刷新策略</p>
                <p className="mt-1 text-sm font-bold text-emerald-200">实时轮询</p>
              </div>
              <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2">
                <p className="text-[10px] text-blue-200/80">日期</p>
                <p className="mt-1 text-sm font-bold text-blue-200">
                  {formatDate(currentTime)}
                </p>
              </div>
              <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2">
                <p className="text-[10px] text-indigo-200/80">当前时刻</p>
                <p className="mt-1 text-sm font-bold text-indigo-200 font-tech">
                  {formatTime(currentTime)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <DashboardPanel
            title="电表能耗历史趋势与同比环比分析"
            subtitle="历史曲线、总量聚合与短周期波动观测"
            icon={<BarChart3 size={16} />}
            className="animate-zoom-in xl:col-span-6"
            bodyClassName="h-[320px] md:h-[360px]"
          >
            <EnergyHistoryChart />
          </DashboardPanel>

          <DashboardPanel
            title="电表同周期曲线对比分析"
            subtitle="当期与上一周期同粒度曲线联动对照"
            icon={<TrendingUp size={16} />}
            className="animate-zoom-in delay-100 xl:col-span-6"
            bodyClassName="h-[320px] md:h-[360px]"
          >
            <EnergyHistoryCompareLineChart />
          </DashboardPanel>

          <DashboardPanel
            title="实时电能消耗监控"
            subtitle="多电表当前功率分布与负载分级"
            icon={<Activity size={16} />}
            className="animate-slide-up delay-100 xl:col-span-4"
            bodyClassName="h-[300px] md:h-[320px]"
          >
            <EnergyMeterChart />
          </DashboardPanel>

          <DashboardPanel
            title="设备状态监控"
            subtitle="设备运行状态、异常与联动告警"
            icon={<Server size={16} />}
            className="animate-slide-up delay-200 xl:col-span-4"
            bodyClassName="h-[300px] md:h-[320px]"
          >
            <div className="h-full min-h-[250px]">
              <DeviceStatusList />
            </div>
          </DashboardPanel>

          <DashboardPanel
            title="管网压力分析"
            subtitle="供回压监测与波动预警"
            icon={<Gauge size={16} />}
            className="animate-slide-up delay-300 xl:col-span-4"
            bodyClassName="h-[300px] md:h-[320px]"
          >
            <PressureChart />
          </DashboardPanel>

          <DashboardPanel
            title="供水流量分析"
            subtitle="流量变动与回路稳定性"
            icon={<Waves size={16} />}
            className="animate-slide-up delay-100 xl:col-span-6"
            bodyClassName="h-[250px] md:h-[260px]"
          >
            <FlowMeterChart />
          </DashboardPanel>

          <DashboardPanel
            title="供暖温度分析"
            subtitle="多点温度趋势与工况响应"
            icon={<Thermometer size={16} />}
            className="animate-slide-up delay-200 xl:col-span-6"
            bodyClassName="h-[250px] md:h-[260px]"
          >
            <TemperatureChart />
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalysisPage;
