import { useEffect, useState, type FormEvent } from 'react';
import { KeyRound, ShieldAlert, UserPlus } from 'lucide-react';
import { ApiError } from '@/api/client';
import { createAdmin, deleteAdmin, listAdmins, updateAdmin, type AdminWriteDto } from '@/api/admins';
import type { AdminDto } from '@/api/types';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

const ROLE_LABELS: Record<AdminDto['role'], string> = {
  admin: 'مدير',
  super_admin: 'مدير عام',
};

const EMPTY_FORM: AdminWriteDto = { full_name: '', email: '', password: '', role: 'admin' };

function fmtDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
}

export function AdminAdmins() {
  const { admin: currentAdmin } = useAdminAuth();
  const isSuperAdmin = currentAdmin?.role === 'super_admin';

  const [admins, setAdmins] = useState<AdminDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<AdminWriteDto>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  const load = () => {
    setLoading(true);
    setLoadError(false);
    listAdmins()
      .then(setAdmins)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isSuperAdmin) load();
    else setLoading(false);
  }, [isSuperAdmin]);

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'تعذر تنفيذ العملية.');
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      await createAdmin(form);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'تعذر إنشاء المدير.');
    } finally {
      setCreating(false);
    }
  };

  const resetPassword = (target: AdminDto) => {
    const password = window.prompt(`كلمة مرور جديدة للمدير ${target.full_name} (8 أحرف على الأقل):`);
    if (!password) return;
    void run(() => updateAdmin(target.id, { password }));
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-white/5 bg-brand-navy py-20 text-center text-brand-silver">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-brand-gold" />
        هذه الصفحة متاحة للمدير العام فقط.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="إدارة المدراء" description="إضافة المدراء وتعديل أدوارهم وحالتهم (للمدير العام فقط)." />

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-sm">{error}</div>}

      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-xl border border-white/5 bg-brand-navy p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
          <UserPlus className="h-5 w-5 text-brand-gold" /> إضافة مدير جديد
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            required
            placeholder="الاسم الكامل"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold"
          />
          <input
            type="email"
            required
            dir="ltr"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white text-left focus:outline-none focus:border-brand-gold"
          />
          <input
            type="password"
            required
            minLength={8}
            dir="ltr"
            placeholder="كلمة المرور (8+)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white text-left focus:outline-none focus:border-brand-gold"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as AdminWriteDto['role'] })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold"
          >
            <option value="admin">مدير</option>
            <option value="super_admin">مدير عام</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded bg-brand-gold px-6 py-2.5 font-bold text-white hover:bg-[#b8962e] disabled:opacity-60"
        >
          {creating ? 'جارٍ الإضافة...' : 'إضافة المدير'}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <LoadingState message="جاري تحميل المدراء..." />
      ) : loadError ? (
        <ErrorState />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-navy">
          <table className="w-full text-right text-sm">
            <thead className="border-b border-white/10 text-brand-silver">
              <tr>
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">البريد</th>
                <th className="p-4 font-medium">الدور</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">آخر دخول</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.id === currentAdmin?.id;
                return (
                  <tr key={a.id} className="border-b border-white/5 text-white last:border-0">
                    <td className="p-4 font-bold">
                      {a.full_name}
                      {isSelf && <span className="mr-2 text-xs text-brand-gold">(أنت)</span>}
                    </td>
                    <td className="p-4 text-brand-silver" dir="ltr">{a.email}</td>
                    <td className="p-4">
                      <select
                        value={a.role}
                        disabled={isSelf}
                        onChange={(e) => run(() => updateAdmin(a.id, { role: e.target.value as AdminDto['role'] }))}
                        className="bg-brand-surface border border-white/10 rounded px-2 py-1 text-white disabled:opacity-50"
                      >
                        <option value="admin">{ROLE_LABELS.admin}</option>
                        <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                      </select>
                    </td>
                    <td className="p-4"><AdminStatusBadge status={a.is_active} /></td>
                    <td className="p-4 text-brand-silver text-xs">{fmtDate(a.last_login_at)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => resetPassword(a)}
                          className="p-2 bg-brand-surface border border-white/5 rounded text-blue-400 hover:bg-blue-500/10"
                          title="تغيير كلمة المرور"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        {a.is_active ? (
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => run(() => deleteAdmin(a.id))}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-xs font-medium hover:bg-red-500/20 disabled:opacity-40"
                          >
                            تعطيل
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => run(() => updateAdmin(a.id, { is_active: true }))}
                            className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs font-medium hover:bg-green-500/20"
                          >
                            تفعيل
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
