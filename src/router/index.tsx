/**
 * 路由配置
 */

import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { HomePage, ApiTestPage, DashboardAnalysisPage } from '@/pages';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/api-test',
    element: <ApiTestPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardAnalysisPage />,
  },
];

export const router = createBrowserRouter(routes);

export default router;
