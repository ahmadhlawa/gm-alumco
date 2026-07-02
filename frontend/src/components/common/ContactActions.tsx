import { Mail, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

export const WHATSAPP_URL = 'https://wa.me/972525808988';
// Human-readable formatting of the same dialable number used in WHATSAPP_URL.
export const WHATSAPP_DISPLAY_NUMBER = '+972 52-580-8988';
export const CONTACT_EMAIL = 'Mina@techno-alum.com';

interface ContactActionsProps {
  title?: string;
  compact?: boolean;
  className?: string;
}

export function ContactActions({ title, compact = false, className }: ContactActionsProps) {
  const { t } = useLanguage();
  const whatsappLabel = t('וואטסאפ', 'WhatsApp');
  const emailLabel = t('אימייל', 'Email');
  return (
    <aside
      className={cn(
        'border border-brand-gold/25 bg-brand-surface-alt/60 shadow-lg shadow-black/10',
        compact ? 'p-5' : 'p-6 md:p-8',
        className,
      )}
    >
      {title && (
        <h3 className={cn('font-bold text-white', compact ? 'mb-4 text-lg' : 'mb-6 text-2xl')}>
          {title}
        </h3>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${whatsappLabel}: ${WHATSAPP_DISPLAY_NUMBER}`}
          className="flex min-h-12 items-center justify-center gap-3 bg-brand-gold px-5 py-3 font-bold text-brand-navy transition-colors hover:bg-[#e3c458] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          <span>{whatsappLabel}</span>
          {!compact && <span dir="ltr" className="text-sm">{WHATSAPP_DISPLAY_NUMBER}</span>}
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          aria-label={`${emailLabel}: ${CONTACT_EMAIL}`}
          className="flex min-h-12 items-center justify-center gap-3 border border-brand-gold/50 px-5 py-3 font-bold text-white transition-colors hover:border-brand-gold hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold"
        >
          <Mail className="h-5 w-5" aria-hidden="true" />
          <span>{emailLabel}</span>
          {!compact && <span dir="ltr" className="text-sm">{CONTACT_EMAIL}</span>}
        </a>
      </div>
    </aside>
  );
}
