import { useLanguage } from '@/i18n';

export function AdminStatusBadge({ status, activeLabel, inactiveLabel }: { status: boolean, activeLabel?: string, inactiveLabel?: string }) {
  const { language } = useLanguage();
  const active = activeLabel ?? (language === 'en' ? 'Active' : 'פעיל');
  const inactive = inactiveLabel ?? (language === 'en' ? 'Inactive' : 'לא פעיל');
  if (status) {
    return (
      <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium">
        {active}
      </span>
    );
  }
  return (
    <span className="px-2 py-1 bg-gray-500/10 text-gray-400 border border-gray-500/20 rounded text-xs font-medium">
      {inactive}
    </span>
  );
}
