import { Globe } from 'lucide-react';
import type { CmsLocale } from '@/types';

interface VisualCmsToolbarProps {
  locale: CmsLocale;
  onLocaleChange: (locale: CmsLocale) => void;
  title?: string;
}

// Admin manages Hebrew + English only. Arabic (*_ar) values are preserved in
// the data but are no longer presented as a customer-facing language here.
const locales: Array<{ value: CmsLocale; label: string }> = [
  { value: 'he', label: 'עברית' },
  { value: 'en', label: 'English' }
];

export function VisualCmsToolbar({
  locale,
  onLocaleChange,
  title = 'معاينة المحتوى كما سيظهر في الموقع'
}: VisualCmsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-brand-gold/20 bg-brand-navy p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="flex items-center gap-2 font-bold text-white">
          <span className="h-2 w-2 rounded-full bg-brand-gold" />
          {title}
        </h3>
        <p className="mt-1 text-xs text-brand-silver">مرر فوق أي عنصر بإطار ذهبي ثم اضغط تعديل.</p>
      </div>
      <div className="flex flex-wrap gap-1 rounded-md border border-white/5 bg-brand-surface-alt p-1">
        {locales.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onLocaleChange(item.value)}
            className={`flex items-center gap-1.5 rounded px-3 py-2 text-xs font-bold transition-colors ${
              locale === item.value ? 'bg-brand-gold text-white' : 'text-brand-silver hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
