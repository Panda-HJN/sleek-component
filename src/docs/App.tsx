import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { routes } from './routes'
import { RouteTitle } from './routeTitle';

export function App() {
  return (
    <BrowserRouter>
      <RouteTitle /> {/* 添加这个组件 */}
      <div className="app">
        <nav>
          {/* 导航菜单 */}
        </nav>
        
        <Suspense fallback={<div>加载中...</div>}>
          <Routes>
            {routes.map(route => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}