import { useState, type ChangeEvent } from 'react';
import { ApiError } from '@/api/client';
import { uploadAdminVideo } from '@/api/uploads';
import { normalizeMediaUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface VideoUploadFieldProps {
  label: string;
  value?: string | null;
  onUploaded: (url: string) => void | Promise<void>;
}

// Admin video upload copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    uploading: 'מעלה…',
    uploadingPct: (pct: number) => `מעלה… ${pct}%`,
    success: 'הסרטון הועלה בהצלחה.',
    failed: 'העלאת הסרטון נכשלה. נסו שוב.',
    hint: 'קבצי MP4 או WEBM בלבד · עד 80MB',
  },
  en: {
    uploading: 'Uploading…',
    uploadingPct: (pct: number) => `Uploading… ${pct}%`,
    success: 'Video uploaded successfully.',
    failed: 'Video upload failed. Please try again.',
    hint: 'MP4 or WEBM only · up to 80MB',
  },
};

export function VideoUploadField({ label, value, onUploaded }: VideoUploadFieldProps) {
  const { language } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(null);
    setError(null);
    setSuccess(false);
    try {
      const result = await uploadAdminVideo(file, setProgress);
      await onUploaded(result.url);
      setSuccess(true);
    } catch (uploadError) {
      setError(uploadError instanceof ApiError ? uploadError.message : copy.failed);
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  return (
    <div className="space-y-3 rounded border border-white/10 bg-brand-navy/50 p-4">
      <label className="block text-sm font-bold text-gray-200">{label}</label>
      <input
        type="file"
        accept=".mp4,.webm,video/mp4,video/webm"
        disabled={uploading}
        onChange={(event) => void upload(event)}
        className="block w-full text-sm text-brand-silver file:mr-4 file:rounded file:border-0 file:bg-brand-gold file:px-4 file:py-2 file:font-bold file:text-white disabled:opacity-60"
      />
      <p className="text-xs text-brand-silver/70">{copy.hint}</p>
      <div aria-live="polite" className="min-h-5 text-sm">
        {uploading && (
          <span className="text-brand-gold">
            {progress === null ? copy.uploading : copy.uploadingPct(progress)}
          </span>
        )}
        {!uploading && success && <span className="text-emerald-400">{copy.success}</span>}
        {!uploading && error && <span className="text-red-300">{error}</span>}
      </div>
      {value && (
        <video
          src={normalizeMediaUrl(value)}
          controls
          muted
          playsInline
          preload="metadata"
          className="h-48 w-full rounded bg-black object-contain"
        />
      )}
    </div>
  );
}
