import React, { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { LocalizedText } from '@/data/siteContent';

export type EditFieldType = 'text' | 'textarea' | 'image' | 'stat' | 'button';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: EditFieldType;
  initialValue: any;
  onSave: (updatedValue: any) => void;
}

export function EditContentModal({ 
  isOpen, 
  onClose, 
  title, 
  type, 
  initialValue, 
  onSave 
}: EditContentModalProps) {
  
  // State variables depending on type
  const [textArr, setTextArr] = useState<LocalizedText>(() => {
    if (type === 'text' || type === 'textarea') {
      return {
        ar: initialValue?.ar || '',
        en: initialValue?.en || '',
        he: initialValue?.he || ''
      };
    }
    return { ar: '', en: '', he: '' };
  });

  const [statData, setStatData] = useState({
    value: initialValue?.value || '',
    label: {
      ar: initialValue?.label?.ar || '',
      en: initialValue?.label?.en || '',
      he: initialValue?.label?.he || ''
    }
  });

  const [imageData, setImageData] = useState({
    url: initialValue?.url || typeof initialValue === 'string' ? initialValue : '',
    alt: {
      ar: initialValue?.alt?.ar || '',
      en: initialValue?.alt?.en || '',
      he: initialValue?.alt?.he || ''
    }
  });

  const [buttonData, setButtonData] = useState({
    label: {
      ar: initialValue?.label?.ar || '',
      en: initialValue?.label?.en || '',
      he: initialValue?.label?.he || ''
    },
    href: initialValue?.href || ''
  });

  const [success, setSuccess] = useState(false);
  const [fakeUploading, setFakeUploading] = useState(false);

  if (!isOpen) return null;

  const handleFakeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFakeUploading(true);
      setTimeout(() => {
        setFakeUploading(false);
        const fileName = e.target.files?.[0]?.name || 'uploaded_image.jpg';
        const dummyUrl = `https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop`;
        if (type === 'image') {
          setImageData(prev => ({ ...prev, url: dummyUrl }));
        } else {
          // If we are editing hero bg or something that represents image directly
          setImageData(prev => ({ ...prev, url: dummyUrl }));
        }
        alert(`تمت المحاكاة لرفع الملف: ${fileName}. تم استبداله برابط صورة معمارية متناسقة.`);
      }, 1000);
    }
  };

  const handleSaveClick = () => {
    let payload: any;
    if (type === 'text' || type === 'textarea') {
      payload = textArr;
    } else if (type === 'stat') {
      payload = statData;
    } else if (type === 'image') {
      // Could be direct string url or object with alt
      payload = typeof initialValue === 'string' ? imageData.url : imageData;
    } else if (type === 'button') {
      payload = buttonData;
    }

    onSave(payload);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" dir="rtl">
      <div className="bg-[#112240] border border-brand-gold/30 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl text-right">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-gold"></span>
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="text-brand-silver hover:text-white bg-white/5 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-brand-gold animate-bounce" />
              <h3 className="text-2xl font-bold text-white">تم حفظ التعديل بنجاح</h3>
              <p className="text-brand-silver text-sm">تم تحديث البيانات محلياً في ذاكرة التصفّح المؤقتة.</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Type: Text or Textarea */}
              {(type === 'text' || type === 'textarea') && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">العربية (Arabic *للإخراج فقط*)</label>
                    {type === 'text' ? (
                      <input 
                        type="text" 
                        value={textArr.ar} 
                        onChange={(e) => setTextArr({...textArr, ar: e.target.value})}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-right"
                      />
                    ) : (
                      <textarea 
                        rows={3}
                        value={textArr.ar} 
                        onChange={(e) => setTextArr({...textArr, ar: e.target.value})}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-right leading-relaxed"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">English (أنجليزي - إلزامي)</label>
                    {type === 'text' ? (
                      <input 
                        type="text" 
                        value={textArr.en} 
                        onChange={(e) => setTextArr({...textArr, en: e.target.value})}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-left font-sans"
                        dir="ltr"
                      />
                    ) : (
                      <textarea 
                        rows={3}
                        value={textArr.en} 
                        onChange={(e) => setTextArr({...textArr, en: e.target.value})}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-left font-sans leading-relaxed"
                        dir="ltr"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">עברית (عبري - إلزامي)</label>
                    {type === 'text' ? (
                      <input 
                        type="text" 
                        value={textArr.he} 
                        onChange={(e) => setTextArr({...textArr, he: e.target.value})}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-right font-sans"
                        dir="rtl"
                      />
                    ) : (
                      <textarea 
                        rows={3}
                        value={textArr.he} 
                        onChange={(e) => setTextArr({...textArr, he: e.target.value})}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-right font-sans leading-relaxed"
                        dir="rtl"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Type: Stat */}
              {type === 'stat' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">القيمة (مثال: +250 أو 100%)</label>
                    <input 
                      type="text" 
                      value={statData.value} 
                      onChange={(e) => setStatData({...statData, value: e.target.value})}
                      className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <h4 className="text-sm font-semibold text-white mb-3">تسميات لغات الإحصائية:</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-brand-silver mb-1">الاسم بالعربية</label>
                        <input 
                          type="text" 
                          value={statData.label.ar} 
                          onChange={(e) => setStatData({
                            ...statData, 
                            label: { ...statData.label, ar: e.target.value }
                          })}
                          className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-brand-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-brand-silver mb-1">English Label</label>
                        <input 
                          type="text" 
                          value={statData.label.en} 
                          onChange={(e) => setStatData({
                            ...statData, 
                            label: { ...statData.label, en: e.target.value }
                          })}
                          className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-brand-gold text-left font-sans"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-brand-silver mb-1">שם בעברית</label>
                        <input 
                          type="text" 
                          value={statData.label.he} 
                          onChange={(e) => setStatData({
                            ...statData, 
                            label: { ...statData.label, he: e.target.value }
                          })}
                          className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-brand-gold text-right font-sans"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type: Image */}
              {type === 'image' && (
                <div className="space-y-4">
                  {imageData.url && (
                    <div className="relative aspect-video w-full rounded overflow-hidden bg-black/40 border border-white/10">
                      <img src={imageData.url} alt="معاينة" className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-xs rounded text-white backdrop-blur">
                        صورة المعاينة الحالية
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">رابط مسار الصورة (URL / Path)</label>
                    <input 
                      type="text" 
                      value={imageData.url} 
                      onChange={(e) => setImageData({...imageData, url: e.target.value})}
                      className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-left font-mono"
                      dir="ltr"
                    />
                  </div>

                  {/* Upload Simulator */}
                  <div>
                    <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">رفع صورة تجريبية</label>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-lg p-6 hover:bg-white/5 cursor-pointer transition-colors group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFakeUpload} 
                        className="hidden" 
                      />
                      <Upload className="w-8 h-8 text-brand-silver group-hover:text-brand-gold transition-colors mb-2" />
                      <span className="text-sm font-bold text-white mb-1">
                        {fakeUploading ? 'جاري رفع الملف ديمو...' : 'اضغط واجهة لرفع ملف تجريبي'}
                      </span>
                      <span className="text-xs text-brand-silver">سيتم استبدال الرابط برابط تجريبي وبقاءه في الذاكرة المحلية</span>
                    </label>
                  </div>

                  {/* Alt texts for non-primitive image objects */}
                  {typeof initialValue !== 'string' && (
                    <div className="border-t border-white/5 pt-4 space-y-3">
                      <h4 className="text-sm font-semibold text-white mb-3">نص بديل للصورة (Alt Text):</h4>
                      <div>
                        <label className="block text-xs text-brand-silver mb-1">العربية (Alt)</label>
                        <input 
                          type="text" 
                          value={imageData.alt.ar} 
                          onChange={(e) => setImageData({
                            ...imageData, 
                            alt: { ...imageData.alt, ar: e.target.value }
                          })}
                          className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-brand-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-brand-silver mb-1">English Alt</label>
                        <input 
                          type="text" 
                          value={imageData.alt.en} 
                          onChange={(e) => setImageData({
                            ...imageData, 
                            alt: { ...imageData.alt, en: e.target.value }
                          })}
                          className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-brand-gold text-left font-sans"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-brand-silver mb-1">עברית Alt</label>
                        <input 
                          type="text" 
                          value={imageData.alt.he} 
                          onChange={(e) => setImageData({
                            ...imageData, 
                            alt: { ...imageData.alt, he: e.target.value }
                          })}
                          className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-brand-gold text-right font-sans"
                          dir="rtl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Type: Button */}
              {type === 'button' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-gold uppercase tracking-wider mb-2">رابط التوجيه (Link / href)</label>
                    <input 
                      type="text" 
                      value={buttonData.href} 
                      onChange={(e) => setButtonData({...buttonData, href: e.target.value})}
                      className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-3 focus:outline-none focus:border-brand-gold text-left font-mono"
                      dir="ltr"
                    />
                  </div>
                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <h4 className="text-sm font-semibold text-white mb-2">نص الزر في كل لغة:</h4>
                    <div>
                      <label className="block text-xs text-brand-silver mb-1">العربية</label>
                      <input 
                        type="text" 
                        value={buttonData.label.ar} 
                        onChange={(e) => setButtonData({
                          ...buttonData, 
                          label: { ...buttonData.label, ar: e.target.value }
                        })}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-silver mb-1">English Label</label>
                      <input 
                        type="text" 
                        value={buttonData.label.en} 
                        onChange={(e) => setButtonData({
                          ...buttonData, 
                          label: { ...buttonData.label, en: e.target.value }
                        })}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 text-left font-sans"
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-brand-silver mb-1">שם כפתור בעברית</label>
                      <input 
                        type="text" 
                        value={buttonData.label.he} 
                        onChange={(e) => setButtonData({
                          ...buttonData, 
                          label: { ...buttonData.label, he: e.target.value }
                        })}
                        className="w-full bg-[#172A45] text-white border border-white/10 rounded px-4 py-2 text-right font-sans"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer actions */}
        {!success && (
          <div className="flex justify-end gap-3 p-6 border-t border-white/5 bg-[#172A45]/40 rounded-b-xl">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm bg-white/5 text-brand-silver hover:bg-white/10 hover:text-white rounded font-bold transition-all"
            >
              إلغاء
            </button>
            <button 
              type="button"
              onClick={handleSaveClick}
              className="px-6 py-2.5 text-sm bg-brand-gold text-white hover:bg-brand-gold/90 shadow-lg shadow-brand-gold/15 rounded font-bold transition-all"
            >
              حفظ التعديلات
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
