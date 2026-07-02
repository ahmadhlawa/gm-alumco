import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CheckCheck, ClipboardList, MessageSquare } from 'lucide-react';
import type { Language } from '@/i18n';

export interface AdminNotificationItem {
  id: number;
  kind: 'contact' | 'quote';
  title: string;
  primary: string;
  preview: string;
  created_at: string;
  is_read: boolean;
}

interface AdminNotificationBellProps {
  language: Language;
  notifications: AdminNotificationItem[];
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onNotificationOpen: (notification: AdminNotificationItem) => void;
  onMarkAllRead: () => void;
}

const COPY = {
  he: {
    notifications: '×”×ª×¨××•×ª',
    empty: '××™×Ÿ ×”×ª×¨××•×ª ×—×“×©×•×ª',
    viewMessages: '×¦×¤×™×™×” ×‘×›×œ ×”×”×•×“×¢×•×ª',
    viewQuotes: '×¦×¤×™×™×” ×‘×›×œ ×”×‘×§×©×•×ª',
    markAll: '×¡×™×ž×•×Ÿ ×”×›×œ ×›× ×§×¨×',
  },
  en: {
    notifications: 'Notifications',
    empty: 'No new notifications',
    viewMessages: 'View all messages',
    viewQuotes: 'View all quote requests',
    markAll: 'Mark all as read',
  },
};

function relativeTime(value: string, language: Language): string {
  const diffMs = new Date(value).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
  ];
  const [unit, size] = units.find(([, unitMs]) => abs >= unitMs) ?? ['minute', 60000];
  const amount = Math.round(diffMs / size) || 0;
  return new Intl.RelativeTimeFormat(language === 'en' ? 'en-US' : 'he-IL', { numeric: 'auto' }).format(amount, unit);
}

export function AdminNotificationBell({
  language,
  notifications,
  unreadCount,
  isOpen,
  onToggle,
  onClose,
  onNotificationOpen,
  onMarkAllRead,
}: AdminNotificationBellProps) {
  const copy = language === 'en' ? COPY.en : COPY.he;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        aria-label={copy.notifications}
        aria-expanded={isOpen}
        onClick={onToggle}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-brand-silver shadow-lg shadow-black/20 transition-colors hover:border-brand-gold/40 hover:bg-brand-gold/10 hover:text-brand-gold"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border border-brand-navy bg-brand-gold px-1 text-[0.68rem] font-black leading-none text-brand-navy shadow-[0_0_18px_rgba(212,175,55,0.45)]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-12 z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-brand-navy/90 shadow-2xl shadow-black/40 backdrop-blur-xl ring-1 ring-brand-gold/10"
          >
            <div className="border-b border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-sm font-black text-white">{copy.notifications}</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {notifications.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-brand-silver">{copy.empty}</p>
              ) : (
                notifications.map((notification) => {
                  const Icon = notification.kind === 'contact' ? MessageSquare : ClipboardList;
                  return (
                    <button
                      key={`${notification.kind}-${notification.id}`}
                      type="button"
                      onClick={() => onNotificationOpen(notification)}
                      className="group flex w-full gap-3 rounded-xl px-3 py-3 text-start transition-colors hover:bg-white/[0.06]"
                    >
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-gold/25 bg-brand-gold/10 text-brand-gold shadow-[0_0_22px_rgba(212,175,55,0.12)]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black text-white">{notification.title}</span>
                        <span className="block truncate text-sm font-semibold text-brand-text">{notification.primary}</span>
                        <span className="block truncate text-xs text-brand-silver">{notification.preview}</span>
                      </span>
                      <time className="shrink-0 text-xs text-brand-silver">{relativeTime(notification.created_at, language)}</time>
                    </button>
                  );
                })
              )}
            </div>
            <div className="grid gap-2 border-t border-white/10 bg-white/[0.03] p-3 text-sm sm:grid-cols-3">
              <Link to="/admin/contact-messages" onClick={onClose} className="rounded-lg px-3 py-2 text-center font-bold text-brand-silver transition hover:bg-white/5 hover:text-white">
                {copy.viewMessages}
              </Link>
              <Link to="/admin/quote-requests" onClick={onClose} className="rounded-lg px-3 py-2 text-center font-bold text-brand-silver transition hover:bg-white/5 hover:text-white">
                {copy.viewQuotes}
              </Link>
              <button type="button" onClick={onMarkAllRead} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-3 py-2 font-black text-brand-navy transition hover:bg-[#e3c458]">
                <CheckCheck className="h-4 w-4" />
                {copy.markAll}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
