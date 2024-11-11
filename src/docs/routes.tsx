import { lazy } from 'react';
import { RouteConfig } from './router.type';

// 使用 lazy 实现路由懒加载
const Flow = lazy(() => import('./pages/flow'));
const Algorithm = lazy(() => import('./pages/algorithm'));

// 路由配置
export const routes: RouteConfig[] = [
  {
    path: '/',
    name: '首页',
    element: <Algorithm />,
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/flow',
    name: '任务流',
    element: <Flow />,
    meta: {
      title: '任务流',
      requiresAuth: true
    }
  },
  {
    path: '/algorithm',
    name: '算法',
    element: <Algorithm />,
    meta: {
      title: '算法',
      requiresAuth: true
    }
  }
];