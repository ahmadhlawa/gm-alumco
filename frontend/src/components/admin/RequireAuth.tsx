import { useEffect, type ReactNode } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getAccessToken } from '@/api/token';

/**
 * Guards admin routes. Redirects to the login screen when no JWT is present
 * in sessionStorage, and reacts to the `gm-auth-expired` event dispatched by
 * the API client when a protected request returns 401.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const hasToken = Boolean(getAccessToken());

  useEffect(() => {
    const onExpired = () => navigate('/admin/login', { replace: true });
    window.addEventListener('gm-auth-expired', onExpired);
    return () => window.removeEventListener('gm-auth-expired', onExpired);
  }, [navigate]);

  if (!hasToken) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
