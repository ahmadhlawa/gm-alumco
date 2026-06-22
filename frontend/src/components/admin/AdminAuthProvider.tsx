import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getCurrentAdmin } from '@/api/auth';
import type { AdminDto } from '@/api/types';

interface AdminAuthState {
  admin: AdminDto | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthState>({
  admin: null,
  loading: true,
  refresh: async () => {},
});

/**
 * Loads the authenticated admin (`GET /auth/me`) once and exposes it to the
 * admin shell so the layout, dashboard, and Admins page can show the real
 * identity and gate features by role. Mounted inside RequireAuth, so a token
 * is guaranteed to be present.
 */
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setAdmin(await getCurrentAdmin());
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, loading, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function useIsSuperAdmin() {
  return useAdminAuth().admin?.role === 'super_admin';
}
