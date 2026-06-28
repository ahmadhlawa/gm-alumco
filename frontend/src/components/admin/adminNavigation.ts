import { BarChart3, Briefcase, ClipboardList, Handshake, Layers, LayoutDashboard, MessageSquare, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import type { AdminDto } from '@/api/types';

export interface AdminNavigationItem { path: string; label: string; icon: LucideIcon }

const contentItems: AdminNavigationItem[] = [
  { path: '/admin', label: 'لوحة التحكم', icon: LayoutDashboard },
  { path: '/admin/projects', label: 'المشاريع', icon: Briefcase },
  { path: '/admin/services', label: 'الخدمات', icon: Layers },
  { path: '/admin/partners', label: 'الشركاء', icon: Handshake },
  { path: '/admin/public-stats', label: 'أرقام الموقع', icon: BarChart3 },
  { path: '/admin/contact-messages', label: 'رسائل التواصل', icon: MessageSquare },
  { path: '/admin/quote-requests', label: 'طلبات عروض الأسعار', icon: ClipboardList },
];

const privilegedItems: AdminNavigationItem[] = [
  { path: '/admin/admins', label: 'إدارة المدراء', icon: Users },
  { path: '/admin/audit-logs', label: 'سجل النشاط', icon: ShieldCheck },
];

export function getAdminNavigation(role: AdminDto['role']): AdminNavigationItem[] {
  return role === 'super_admin' ? [...contentItems, ...privilegedItems] : contentItems;
}
