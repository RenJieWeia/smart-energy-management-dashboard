import React from "react";
import { ShieldCheck, Cpu, Network, Box } from "lucide-react";
import { Link } from "react-router-dom";
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
          <a 
            href="http://demo.jingneng.site:81" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 group-hover:bg-indigo-500/30 transition-all">
              <Box size={20} className="text-indigo-300" />
            </div>
            <span className="text-[11px] mt-1 text-slate-200 font-black uppercase tracking-tighter">
              3D
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
