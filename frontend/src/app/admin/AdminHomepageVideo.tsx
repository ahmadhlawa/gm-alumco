import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { ApiError } from '@/api/client';
import {
  getAdminHomepageVideoSection,
  updateHomepageVideoSection,
} from '@/api/homepageVideoSection';
import type { HomepageVideoSectionDto } from '@/api/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { VideoUploadField } from '@/components/forms/VideoUploadField';
import { useLanguage } from '@/i18n';

const EMPTY: HomepageVideoSectionDto = {
  is_enabled: false,
  video_url: null,
  display_order: 0,
};

type Feedback = { kind: 'success' | 'error'; message: string } | null;

// Admin UI copy — Hebrew + English only (Hebrew is the default). The section is
// video-only: enable it, upload a video, save.
const COPY = {
  he: {
    title: 'סרטון דף הבית',
    enabledHint: 'הפעל אפשרות זו כדי להציג את הסרטון בדף הבית.',
    enabled: 'הצגת מקטע הסרטון באתר',
    enabledOn: 'פעיל', enabledOff: 'כבוי',
    videoLabel: 'קובץ סרטון',
    save: 'שמירה', saving: 'שומר…', saved: 'הנתונים נשמרו בהצלחה.',
    error: 'שמירת הנתונים נכשלה. נסו שוב.', loadError: 'טעינת הנתונים נכשלה.',
  },
  en: {
    title: 'Homepage Video',
    enabledHint: 'Enable this section to show the video on the homepage.',
    enabled: 'Show the video section on the site',
    enabledOn: 'Enabled', enabledOff: 'Disabled',
    videoLabel: 'Video file',
    save: 'Save', saving: 'Saving…', saved: 'Saved successfully.',
    error: 'Could not save. Please try again.', loadError: 'Could not load. Please try again.',
  },
};

export function AdminHomepageVideo() {
  const { language, dir } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;

  const [form, setForm] = useState<HomepageVideoSectionDto>(EMPTY);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminHomepageVideoSection()
      .then((saved) => setForm({ ...EMPTY, ...saved }))
      .catch(() => setFeedback({ kind: 'error', message: copy.loadError }));
    // Run once on mount; copy is stable per language.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof HomepageVideoSectionDto>(key: K, value: HomepageVideoSectionDto[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    // The section is video-only: send exactly what this page manages.
    const payload: HomepageVideoSectionDto = {
      is_enabled: form.is_enabled,
      video_url: form.video_url,
      display_order: form.display_order,
    };
    try {
      const saved = await updateHomepageVideoSection(payload);
      // Persist the server's canonical response so a later reload matches.
      setForm({ ...EMPTY, ...saved });
      setFeedback({ kind: 'success', message: copy.saved });
    } catch (err) {
      setFeedback({
        kind: 'error',
        message: err instanceof ApiError ? err.message : copy.error,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" dir={dir}>
      <AdminPageHeader
        title={copy.title}
        action={
          <button
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded bg-brand-gold px-4 py-2 text-sm font-bold text-brand-navy hover:bg-[#e3c454] disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? copy.saving : copy.save}
          </button>
        }
      />

      {feedback && (
        <div
          role="alert"
          aria-live="polite"
          className={`rounded-lg border px-4 py-3 text-sm font-bold ${
            feedback.kind === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Enable / disable */}
      <section className="space-y-3 rounded-xl border border-white/5 bg-brand-surface-alt p-5">
        <p className="text-sm text-brand-silver/80">{copy.enabledHint}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-bold text-white">{copy.enabled}</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_enabled}
            onClick={() => set('is_enabled', !form.is_enabled)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              form.is_enabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-brand-silver'
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${form.is_enabled ? 'bg-emerald-400' : 'bg-brand-silver/60'}`} />
            {form.is_enabled ? copy.enabledOn : copy.enabledOff}
          </button>
        </div>
      </section>

      {/* Video upload + current preview */}
      <VideoUploadField
        label={copy.videoLabel}
        value={form.video_url}
        onUploaded={(url) => set('video_url', url)}
      />
    </div>
  );
}
