import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { bootstrapSession, loadMe } from '../features/auth/authSlice';

export function ProtectedRoute({ roles }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, accessToken, status, bootstrapped } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!bootstrapped && !user && !accessToken) dispatch(bootstrapSession());
    if (!user && accessToken) dispatch(loadMe());
  }, [accessToken, bootstrapped, dispatch, user]);

  if (!user && !accessToken && bootstrapped) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === 'loading' || (!user && accessToken)) {
    return <div className="flex min-h-screen items-center justify-center bg-panel text-sm text-slate-600">Loading session...</div>;
  }

  if (roles?.length && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
