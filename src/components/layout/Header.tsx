import React from "react";
import { ShieldCheck, Database, BellDot, Cpu, Network } from "lucide-react";
import { useDashboard } from "../../contexts/DashboardContext";

interface HeaderProps {
  currentTime: Date;
}

const Header: React.FC<HeaderProps> = ({ currentTime }) => {
  const { dashboardMeta } = useDashboard();
  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    const w = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
    return `${y}/${m}/${d} 星期${w}`;
  };

  const formatTime = (date: Date) => date.toTimeString().split(" ")[0];

  return (
    <div className="relative w-full h-24 flex items-center justify-between px-10 z-30 shrink-0">
      {/* 左侧 HUD 面板 */}
      <div className="flex items-center space-x-6">
        <div className="flex flex-col border-l-2 border-cyan-500 pl-4 py-1">
          <span className="text-cyan-400 font-tech text-3xl tracking-widest font-bold drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]">
            {formatTime(currentTime)}
          </span>
          <span className="text-slate-200 text-xs font-bold tracking-tight uppercase">
            {formatDate(currentTime)}
          </span>
        </div>

        <div className="flex items-center space-x-5 ml-6">
          <div className="flex flex-col items-center">
            <Cpu size={16} className="text-cyan-400 mb-1" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <div className="flex flex-col items-center">
            <Network size={16} className="text-cyan-400 mb-1" />
            <div
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
          </div>
        </div>
      </div>

      {/* 中心标题区域 */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[900px] h-full pointer-events-none">
        <div className="cyber-header-shape h-full flex flex-col items-center justify-center relative overflow-hidden">
          <h1 className="text-4xl font-cyber tracking-[0.25em] text-white font-black italic drop-shadow-[0_0_20px_rgba(0,242,255,0.8)]">
            {dashboardMeta.title}
          </h1>
          <div className="flex items-center space-x-3 mt-1">
            <span className="w-10 h-[1px] bg-cyan-500/50"></span>
            <span className="text-[11px] text-cyan-300 font-tech uppercase tracking-[0.6em] font-bold">
              Energy Intelligence Monitoring HUD v4.5
            </span>
            <span className="w-10 h-[1px] bg-cyan-500/50"></span>
          </div>

          {/* 动态流光底边 */}
          <div className="absolute bottom-4 left-0 w-full h-[2px] overflow-hidden">
            <div className="w-full h-full bg-cyan-500/20"></div>
            <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[dash_3s_linear_infinite]"></div>
          </div>
        </div>
      </div>

      {/* 右侧控制面板 */}
      <div className="flex items-center space-x-6">
        <div className="flex space-x-8">
          <div className="flex flex-col items-center group cursor-pointer">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 group-hover:bg-cyan-500/30 transition-all">
              <Database size={20} className="text-cyan-300" />
            </div>
            <span className="text-[11px] mt-1 text-slate-200 font-black uppercase tracking-tighter">
              Database
            </span>
          </div>
          <div className="relative flex flex-col items-center group cursor-pointer">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500/30 transition-all">
              <BellDot size={20} className="text-amber-400 animate-pulse" />
            </div>
            <span className="text-[11px] mt-1 text-slate-200 font-black uppercase tracking-tighter">
              Alerts
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-[#010612] animate-bounce"></span>
          </div>
        </div>

        <div className="h-12 w-[1px] bg-white/20 mx-4"></div>

        <div className="flex items-center space-x-3 bg-white/10 border border-white/20 pl-1 pr-5 py-1.5 rounded-full backdrop-blur-md">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-[#010612] font-black shadow-lg">
            AD
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white leading-none">
              ADMIN.ROOT
            </span>
            <span className="text-[10px] text-emerald-400 font-black tracking-widest mt-0.5">
              ONLINE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
