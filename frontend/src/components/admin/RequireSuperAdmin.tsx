import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAdminAuth } from './AdminAuthProvider';
import { LoadingState } from '@/components/common/LoadingState';

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <LoadingState />;
  return admin?.role === 'super_admin' ? children : <Navigate to="/admin" replace />;
}
