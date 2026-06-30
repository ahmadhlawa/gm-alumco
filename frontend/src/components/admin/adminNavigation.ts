import { BarChart3, Briefcase, ClipboardList, Handshake, Layers, LayoutDashboard, MessageSquare, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import type { AdminDto } from '@/api/types';
import type { Language } from '@/i18n';

export interface AdminNavigationItem { path: string; label: string; icon: LucideIcon }

// Admin navigation labels — Hebrew + English only (Hebrew is the default).
interface AdminNavigationDef { path: string; label: { he: string; en: string }; icon: LucideIcon }

const contentItems: AdminNavigationDef[] = [
  { path: '/admin', label: { he: 'לוח בקרה', en: 'Dashboard' }, icon: LayoutDashboard },
  { path: '/admin/projects', label: { he: 'פרויקטים', en: 'Projects' }, icon: Briefcase },
  { path: '/admin/services', label: { he: 'שירותים', en: 'Services' }, icon: Layers },
  { path: '/admin/partners', label: { he: 'שותפים', en: 'Partners' }, icon: Handshake },
  { path: '/admin/public-stats', label: { he: 'נתוני החברה', en: 'Company numbers' }, icon: BarChart3 },
  { path: '/admin/contact-messages', label: { he: 'הודעות צור קשר', en: 'Contact messages' }, icon: MessageSquare },
  { path: '/admin/quote-requests', label: { he: 'בקשות להצעת מחיר', en: 'Quote requests' }, icon: ClipboardList },
];

const privilegedItems: AdminNavigationDef[] = [
  { path: '/admin/admins', label: { he: 'ניהול מנהלים', en: 'Admins' }, icon: Users },
  { path: '/admin/audit-logs', label: { he: 'יומן פעילות', en: 'Audit log' }, icon: ShieldCheck },
];

export function getAdminNavigation(role: AdminDto['role'], language: Language = 'he'): AdminNavigationItem[] {
  const defs = role === 'super_admin' ? [...contentItems, ...privilegedItems] : contentItems;
  return defs.map((def) => ({ path: def.path, label: language === 'en' ? def.label.en : def.label.he, icon: def.icon }));
}
