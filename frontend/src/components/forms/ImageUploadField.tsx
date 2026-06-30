import { useState, type ChangeEvent } from 'react';
import { ApiError } from '@/api/client';
import { uploadAdminImage, type UploadFolder } from '@/api/uploads';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface ImageUploadFieldProps {
  label: string;
  folder: UploadFolder;
  value?: string | null;
  onUploaded: (url: string) => void | Promise<void>;
}

// Admin image upload copy — Hebrew + English only (Hebrew is the default).
const COPY = {
  he: {
    uploading: 'מעלה…',
    uploadingPct: (pct: number) => `מעלה… ${pct}%`,
    success: 'התמונה הועלתה בהצלחה.',
    failed: 'העלאת התמונה נכשלה. נסו שוב.',
    previewAlt: 'תצוגה מקדימה של התמונה',
  },
  en: {
    uploading: 'Uploading…',
    uploadingPct: (pct: number) => `Uploading… ${pct}%`,
    success: 'Image uploaded successfully.',
    failed: 'Image upload failed. Please try again.',
    previewAlt: 'Image preview',
  },
};

export function ImageUploadField({
  label,
  folder,
  value,
  onUploaded,
}: ImageUploadFieldProps) {
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
      const result = await uploadAdminImage(file, folder, setProgress);
      await onUploaded(result.url);
      setSuccess(true);
    } catch (uploadError) {
      setError(
        uploadError instanceof ApiError
          ? uploadError.message
          : copy.failed,
      );
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
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(event) => void upload(event)}
        className="block w-full text-sm text-brand-silver file:mr-4 file:rounded file:border-0 file:bg-brand-gold file:px-4 file:py-2 file:font-bold file:text-white disabled:opacity-60"
      />
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
        <img
          src={normalizeImageUrl(value)}
          onError={handleImageError}
          alt={copy.previewAlt}
          className="h-36 w-full rounded object-cover"
        />
      )}
    </div>
  );
}
