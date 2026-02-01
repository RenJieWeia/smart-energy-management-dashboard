/**
 * 应用根组件
 * 提供路由和全局上下文
 */

import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { DashboardProvider } from './contexts/DashboardContext';
import router from './router';

// 开发环境下加载 API 测试工具（可在控制台使用 window.hbTest）
if (import.meta.env.DEV) {
  import('./utils/apiTest');
}

const App: React.FC = () => {
  return (
    <DashboardProvider>
      <RouterProvider router={router} />
    </DashboardProvider>
  );
};

export default App;
