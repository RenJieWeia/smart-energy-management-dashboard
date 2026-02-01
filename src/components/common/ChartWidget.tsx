import React from "react";
import { Target } from "lucide-react";

interface ChartWidgetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  children,
  className = "",
  headerAction,
  noPadding = false,
}) => {
  return (
    <div
      className={`glass-panel rounded-xl flex flex-col relative group transition-all duration-300 hover:border-cyan-400/50 overflow-hidden ${className}`}
    >
      {/* 装饰性角标 */}
      <div className="absolute top-0 right-0 w-8 h-8 opacity-40 pointer-events-none">
        <div className="absolute top-0 right-0 w-full h-[1px] bg-cyan-400"></div>
        <div className="absolute top-0 right-0 w-[1px] h-full bg-cyan-400"></div>
      </div>

      {/* 标题 */}
      <div className="flex items-center justify-between px-5 pt-4 pb-1 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-cyan-500/10 rounded border border-cyan-500/30">
            <Target size={14} className="text-cyan-400" />
          </div>
          <h3 className="text-slate-100 font-bold text-sm tracking-widest">
            {title}
          </h3>
        </div>
        {headerAction}
      </div>

      {/* 主体 - 增加 min-h-0 确保 flex 容器可以根据内容压缩 */}
      <div
        className={`flex-1 min-h-0 relative ${
          noPadding ? "p-0" : "px-5 pb-4 pt-1"
        }`}
      >
        {children}
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default ChartWidget;
