import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LeftColumn from './components/LeftColumn';
import RightColumn from './components/RightColumn';
import CenterVisual from './components/CenterVisual';
import BottomRow from './components/BottomRow';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#010612] relative select-none">
      {/* 科技背景装饰层 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
      </div>

      {/* 主视图区域 */}
      <div className="flex-1 flex flex-col p-6 space-y-4 relative z-10">
        {/* 页头 */}
        <Header currentTime={currentTime} />

        {/* 核心数据看板布局 */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* 左侧功能面板 (3/12) */}
          <div className="col-span-3 h-full min-h-0">
            <LeftColumn />
          </div>

          {/* 中间核心视觉区 (6/12) - 增加内间距确保卫星卡片有活动空间 */}
          <div className="col-span-6 h-full flex flex-col space-y-4 min-h-0 px-4">
            <div className="flex-1 min-h-0 relative">
              <CenterVisual />
            </div>
            {/* 底部次级看板 */}
            <div className="h-[220px] shrink-0">
               <BottomRow />
            </div>
          </div>

          {/* 右侧监测面板 (3/12) */}
          <div className="col-span-3 h-full min-h-0">
            <RightColumn />
          </div>
        </div>
      </div>

      {/* 底部装饰边缘 */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
    </div>
  );
};

export default App;