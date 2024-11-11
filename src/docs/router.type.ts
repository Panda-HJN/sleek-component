import { ReactNode } from 'react';

// 路由元信息类型
export interface RouteMeta {
  title: string;
  requiresAuth: boolean;
}

// 路由配置类型
export interface RouteConfig {
  path: string;
  name: string;
  element: ReactNode;
  meta: RouteMeta;
  children?: RouteConfig[]; // 为可能的子路由预留
}

// 导航菜单项类型
// for 侧边栏和面包屑
export interface NavMenuItem {
  path: string;
  name: string;
}