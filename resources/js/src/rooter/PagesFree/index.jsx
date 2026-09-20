import React, { useContext } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AppContext from '@/src/AppContext/Context';

const Index = () => {
  const location = useLocation();
  const Login = React.lazy(() => import('@/src/pages/Login/novo.js'));
  const NotFound = React.lazy(() => import('@/src/pages/NotFound'));
  const ResetPassword = React.lazy(() => import('@/src/pages/ResetPassword'));
  const { theme, user } = useContext(AppContext);
  const isLoginRoute = location.pathname === '/root/login';
  const isResetPasswordRoute = location.pathname === '/reset-password';
  
  if (!theme?.entity?.id && !isLoginRoute && !isResetPasswordRoute) {
    return (
      <React.Suspense>
        <NotFound />
      </React.Suspense>
    );
  }

  if (theme?.entity?.id && !user) {
    return (
      <React.Suspense>
          <Login />
      </React.Suspense>
    );
  }

  return (
     <React.Suspense>
        <Routes>
            <Route path={`/reset-password`} element={<ResetPassword />} />
            <Route path={`/root/login`} element={<Login />} />
        </Routes>
    </React.Suspense>
  );
};

export default Index;