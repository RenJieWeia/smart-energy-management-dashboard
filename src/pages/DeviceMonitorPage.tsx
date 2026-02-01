/**
 * 设备监控页面
 * 展示蜂鸟物联平台的实时监控数据
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { useHummingBirdApi } from '@/hooks';
import { DeviceMonitorPanel } from '@/components/hummingbird';

const DeviceMonitorPage: React.FC = () => {
  const { loading, error, deviceData, refresh } = useHummingBirdApi();

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-200">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
            >
              ← 返回主页
            </Link>
            <h1 className="text-xl font-bold text-cyan-400">
              🐦 设备实时监控
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* 状态指示 */}
            <div className="flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-400' : 'bg-green-400'}`}></span>
              <span className="text-slate-400">
                {loading ? '同步中...' : error ? '连接异常' : `${deviceData.length} 条数据`}
              </span>
            </div>
            
            {/* 刷新按钮 */}
            <button
              onClick={refresh}
              disabled={loading}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 
                         text-white text-sm rounded-lg transition-colors flex items-center gap-2"
            >
              <span className={loading ? 'animate-spin' : ''}>🔄</span>
              刷新
            </button>
            
            {/* API测试入口 */}
            <Link
              to="/api-test"
              className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 
                         text-slate-200 text-sm rounded-lg transition-colors"
            >
              API 测试
            </Link>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
            <strong>错误：</strong> {error.message}
          </div>
        )}

        {/* 加载状态 */}
        {loading && deviceData.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400">正在加载数据...</p>
            </div>
          </div>
        ) : (
          <DeviceMonitorPanel deviceData={deviceData} />
        )}
      </main>

      {/* 底部信息 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-t border-slate-700/50 py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-slate-500">
          <span>数据每 3 秒自动刷新</span>
          <span>
            最后更新: {deviceData.length > 0 && deviceData[0]?.time
              ? new Date(deviceData[0].time).toLocaleTimeString() 
              : '--'}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default DeviceMonitorPage;
