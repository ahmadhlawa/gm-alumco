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
import { useLanguage, type Language } from '@/i18n';

// Admin management copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    superOnly: 'הדף זמין למנהל העל בלבד.',
    title: 'ניהול מנהלים',
    description: 'הוספת מנהלים ועדכון התפקידים והסטטוס שלהם (למנהל העל בלבד).',
    roleAdmin: 'מנהל',
    roleSuper: 'מנהל על',
    addHeading: 'הוספת מנהל חדש',
    fullName: 'שם מלא',
    email: 'דוא״ל',
    passwordPlaceholder: 'סיסמה (8+)',
    add: 'הוספת מנהל',
    adding: 'מוסיף…',
    loading: 'טוען מנהלים…',
    cols: { name: 'שם', email: 'דוא״ל', role: 'תפקיד', status: 'סטטוס', lastLogin: 'כניסה אחרונה', actions: 'פעולות' },
    you: '(אתה)',
    resetPasswordTitle: 'שינוי סיסמה',
    deactivate: 'השבתה',
    activate: 'הפעלה',
    actionFailed: 'ביצוע הפעולה נכשל.',
    createFailed: 'יצירת המנהל נכשלה.',
    promptPassword: (name: string) => `סיסמה חדשה למנהל ${name} (לפחות 8 תווים):`,
  },
  en: {
    superOnly: 'This page is available to the super admin only.',
    title: 'Manage admins',
    description: 'Add admins and update their roles and status (super admin only).',
    roleAdmin: 'Admin',
    roleSuper: 'Super admin',
    addHeading: 'Add new admin',
    fullName: 'Full name',
    email: 'Email',
    passwordPlaceholder: 'Password (8+)',
    add: 'Add admin',
    adding: 'Adding…',
    loading: 'Loading admins…',
    cols: { name: 'Name', email: 'Email', role: 'Role', status: 'Status', lastLogin: 'Last login', actions: 'Actions' },
    you: '(you)',
    resetPasswordTitle: 'Change password',
    deactivate: 'Deactivate',
    activate: 'Activate',
    actionFailed: 'Could not complete the operation.',
    createFailed: 'Could not create the admin.',
    promptPassword: (name: string) => `New password for admin ${name} (at least 8 characters):`,
  },
};

const EMPTY_FORM: AdminWriteDto = { full_name: '', email: '', password: '', role: 'admin' };

function fmtDate(value: string | null, language: Language): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(language === 'en' ? 'en-US' : 'he-IL', { dateStyle: 'medium', timeStyle: 'short' });
}

export function AdminAdmins() {
  const { admin: currentAdmin } = useAdminAuth();
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
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
      setError(e instanceof ApiError ? e.message : copy.actionFailed);
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
      setError(err instanceof ApiError ? err.message : copy.createFailed);
    } finally {
      setCreating(false);
    }
  };

  const resetPassword = (target: AdminDto) => {
    const password = window.prompt(copy.promptPassword(target.full_name));
    if (!password) return;
    void run(() => updateAdmin(target.id, { password }));
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-xl border border-white/5 bg-brand-navy py-20 text-center text-brand-silver">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-brand-gold" />
        {copy.superOnly}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={copy.title} description={copy.description} />

      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 rounded text-sm">{error}</div>}

      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-xl border border-white/5 bg-brand-navy p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-white">
          <UserPlus className="h-5 w-5 text-brand-gold" /> {copy.addHeading}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            required
            placeholder={copy.fullName}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold"
          />
          <input
            type="email"
            required
            dir="ltr"
            placeholder={copy.email}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white text-left focus:outline-none focus:border-brand-gold"
          />
          <input
            type="password"
            required
            minLength={8}
            dir="ltr"
            placeholder={copy.passwordPlaceholder}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white text-left focus:outline-none focus:border-brand-gold"
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value as AdminWriteDto['role'] })}
            className="h-11 px-3 bg-brand-surface border border-white/10 rounded text-white focus:outline-none focus:border-brand-gold"
          >
            <option value="admin">{copy.roleAdmin}</option>
            <option value="super_admin">{copy.roleSuper}</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded bg-brand-gold px-6 py-2.5 font-bold text-white hover:bg-[#b8962e] disabled:opacity-60"
        >
          {creating ? copy.adding : copy.add}
        </button>
      </form>

      {/* List */}
      {loading ? (
        <LoadingState variant="table" />
      ) : loadError ? (
        <ErrorState />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-brand-navy">
          <table className="w-full text-start text-sm">
            <thead className="border-b border-white/10 text-brand-silver">
              <tr>
                <th className="p-4 font-medium">{copy.cols.name}</th>
                <th className="p-4 font-medium">{copy.cols.email}</th>
                <th className="p-4 font-medium">{copy.cols.role}</th>
                <th className="p-4 font-medium">{copy.cols.status}</th>
                <th className="p-4 font-medium">{copy.cols.lastLogin}</th>
                <th className="p-4 font-medium">{copy.cols.actions}</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isSelf = a.id === currentAdmin?.id;
                return (
                  <tr key={a.id} className="border-b border-white/5 text-white last:border-0">
                    <td className="p-4 font-bold">
                      {a.full_name}
                      {isSelf && <span className="mx-2 text-xs text-brand-gold">{copy.you}</span>}
                    </td>
                    <td className="p-4 text-brand-silver" dir="ltr">{a.email}</td>
                    <td className="p-4">
                      <select
                        value={a.role}
                        disabled={isSelf}
                        onChange={(e) => run(() => updateAdmin(a.id, { role: e.target.value as AdminDto['role'] }))}
                        className="bg-brand-surface border border-white/10 rounded px-2 py-1 text-white disabled:opacity-50"
                      >
                        <option value="admin">{copy.roleAdmin}</option>
                        <option value="super_admin">{copy.roleSuper}</option>
                      </select>
                    </td>
                    <td className="p-4"><AdminStatusBadge status={a.is_active} /></td>
                    <td className="p-4 text-brand-silver text-xs">{fmtDate(a.last_login_at, language)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => resetPassword(a)}
                          className="p-2 bg-brand-surface border border-white/5 rounded text-blue-400 hover:bg-blue-500/10"
                          title={copy.resetPasswordTitle}
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
                            {copy.deactivate}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => run(() => updateAdmin(a.id, { is_active: true }))}
                            className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs font-medium hover:bg-green-500/20"
                          >
                            {copy.activate}
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
