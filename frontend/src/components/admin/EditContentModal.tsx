import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import type { LocalizedText } from '@/types';
import { handleImageError, normalizeImageUrl } from '@/lib/utils';

export type EditFieldType = 'text' | 'textarea' | 'image' | 'stat' | 'button' | 'fields';
export type CmsInputType = 'text' | 'textarea' | 'number' | 'url';

export interface CmsFieldDefinition {
  key: string;
  label: string;
  type?: CmsInputType;
  localized?: boolean;
}

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: EditFieldType;
  initialValue: any;
  fields?: CmsFieldDefinition[];
  onSave: (updatedValue: any) => void;
}

const emptyLocalizedText = (): LocalizedText => ({ ar: '', en: '', he: '' });

function normalizeValue(type: EditFieldType, initialValue: any) {
  if (type === 'text' || type === 'textarea') {
    return { ...emptyLocalizedText(), ...initialValue };
  }
  if (type === 'stat') {
    return {
      ...initialValue,
      value: initialValue?.value ?? '',
      label: { ...emptyLocalizedText(), ...initialValue?.label }
    };
  }
  if (type === 'button') {
    return {
      ...initialValue,
      href: initialValue?.href ?? '',
      label: { ...emptyLocalizedText(), ...initialValue?.label }
    };
  }
  if (type === 'image') {
    return typeof initialValue === 'string' ? initialValue : initialValue?.url ?? '';
  }
  return structuredClone(initialValue ?? {});
}

function LocalizedInputs({
  value,
  onChange,
  textarea = false
}: {
  value: LocalizedText;
  onChange: (value: LocalizedText) => void;
  textarea?: boolean;
}) {
  const rows: Array<{ key: keyof LocalizedText; label: string; dir: 'rtl' | 'ltr'; note?: string }> = [
    { key: 'ar', label: 'العربية', dir: 'rtl', note: 'للتطوير والمعاينة فقط' },
    { key: 'en', label: 'English', dir: 'ltr', note: 'Production' },
    { key: 'he', label: 'עברית', dir: 'rtl', note: 'Production' }
  ];

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <label key={row.key} className="block">
          <span className="mb-2 flex items-center justify-between text-xs font-bold text-brand-gold">
            {row.label}
            {row.note && <span className="font-normal text-brand-silver">{row.note}</span>}
          </span>
          {textarea ? (
            <textarea
              rows={3}
              dir={row.dir}
              value={value[row.key]}
              onChange={(event) => onChange({ ...value, [row.key]: event.target.value })}
              className="w-full rounded border border-white/10 bg-brand-surface-alt px-4 py-3 text-white outline-none focus:border-brand-gold"
            />
          ) : (
            <input
              type="text"
              dir={row.dir}
              value={value[row.key]}
              onChange={(event) => onChange({ ...value, [row.key]: event.target.value })}
              className="w-full rounded border border-white/10 bg-brand-surface-alt px-4 py-3 text-white outline-none focus:border-brand-gold"
            />
          )}
        </label>
      ))}
    </div>
  );
}

export function EditContentModal({
  isOpen,
  onClose,
  title,
  type,
  initialValue,
  fields = [],
  onSave
}: EditContentModalProps) {
  const [draft, setDraft] = useState<any>(() => normalizeValue(type, initialValue));
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft(normalizeValue(type, initialValue));
      setSuccess(false);
    }
  }, [initialValue, isOpen, type]);

  if (!isOpen) return null;

  const save = () => {
    onSave(draft);
    setSuccess(true);
    window.setTimeout(onClose, 900);
  };

  const renderField = (field: CmsFieldDefinition) => {
    const inputType = field.type ?? 'text';
    const value = draft[field.key];

    if (field.localized) {
      return (
        <LocalizedInputs
          value={{ ...emptyLocalizedText(), ...value }}
          textarea={inputType === 'textarea'}
          onChange={(nextValue) => setDraft({ ...draft, [field.key]: nextValue })}
        />
      );
    }

    const commonProps = {
      value: value ?? '',
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setDraft({ ...draft, [field.key]: inputType === 'number' ? Number(event.target.value) : event.target.value }),
      className: 'w-full rounded border border-white/10 bg-brand-surface-alt px-4 py-3 text-white outline-none focus:border-brand-gold'
    };

    return inputType === 'textarea' ? <textarea rows={3} {...commonProps} /> : <input type={inputType} {...commonProps} />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" dir="rtl">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-brand-gold/30 bg-brand-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/5 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-gold" />
            {title}
          </h2>
          <button type="button" onClick={onClose} className="rounded-full bg-white/5 p-2 text-brand-silver hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          {success ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-brand-gold" />
              <h3 className="text-2xl font-bold text-white">تم حفظ التعديل بنجاح</h3>
              <p className="mt-2 text-sm text-brand-silver">تم تحديث المعاينة محلياً فقط.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {(type === 'text' || type === 'textarea') && (
                <LocalizedInputs value={draft} textarea={type === 'textarea'} onChange={setDraft} />
              )}

              {type === 'image' && (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-brand-gold">رابط الصورة فقط</span>
                  <input
                    type="url"
                    dir="ltr"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="w-full rounded border border-white/10 bg-brand-surface-alt px-4 py-3 text-left text-white outline-none focus:border-brand-gold"
                  />
                  {draft && <img src={normalizeImageUrl(draft)} onError={handleImageError} alt="Preview" className="mt-4 aspect-video w-full rounded object-cover" />}
                </label>
              )}

              {type === 'stat' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-brand-gold">القيمة</span>
                    <input
                      value={draft.value}
                      onChange={(event) => setDraft({ ...draft, value: event.target.value })}
                      className="w-full rounded border border-white/10 bg-brand-surface-alt px-4 py-3 text-white outline-none focus:border-brand-gold"
                    />
                  </label>
                  <LocalizedInputs value={draft.label} onChange={(label) => setDraft({ ...draft, label })} />
                </>
              )}

              {type === 'button' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-brand-gold">الرابط</span>
                    <input
                      value={draft.href}
                      onChange={(event) => setDraft({ ...draft, href: event.target.value })}
                      className="w-full rounded border border-white/10 bg-brand-surface-alt px-4 py-3 text-white outline-none focus:border-brand-gold"
                    />
                  </label>
                  <LocalizedInputs value={draft.label} onChange={(label) => setDraft({ ...draft, label })} />
                </>
              )}

              {type === 'fields' && fields.map((field) => (
                <div key={field.key} className="border-b border-white/5 pb-6 last:border-0">
                  <h3 className="mb-3 text-sm font-bold text-white">{field.label}</h3>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}
        </div>

        {!success && (
          <div className="flex justify-end gap-3 border-t border-white/5 bg-brand-surface-alt/40 p-6">
            <button type="button" onClick={onClose} className="rounded bg-white/5 px-5 py-2.5 text-sm font-bold text-brand-silver hover:text-white">إلغاء</button>
            <button type="button" onClick={save} className="rounded bg-brand-gold px-6 py-2.5 text-sm font-bold text-white hover:bg-[#b8962e]">حفظ التعديلات</button>
          </div>
        )}
      </div>
    </div>
  );
}
