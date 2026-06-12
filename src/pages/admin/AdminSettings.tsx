import React, { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

export function AdminSettings() {
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      alert('تم تنفيذ العملية بنجاح');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <AdminPageHeader 
        title="إعدادات الموقع"
        description="تحديث أرقام التواصل والروابط النصائح العامة"
      />
      
      <div className="bg-[#112240] p-6 sm:p-8 border border-white/5 rounded-xl shadow-lg">
        
        {success && (
          <div className="p-4 mb-6 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md">
             تم حفظ الإعدادات بنجاح (محاكاة).
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
           {/* General Settings */}
           <div>
             <h3 className="text-lg font-bold text-brand-gold mb-4 border-b border-white/5 pb-2">معلومات الشركة</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm text-brand-silver">اسم الشركة (عربي)</label>
                   <input type="text" defaultValue="أفق الألمنيوم" className="w-full h-12 px-4 bg-[#0A192F] border border-white/10 rounded focus:border-brand-gold text-white outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm text-brand-silver">اسم الشركة (انجليزي)</label>
                   <input type="text" defaultValue="Alu Horizon" className="w-full h-12 px-4 bg-[#0A192F] border border-white/10 rounded focus:border-brand-gold text-left text-white outline-none" dir="ltr" />
                </div>
             </div>
           </div>

           {/* Contact Items */}
           <div>
             <h3 className="text-lg font-bold text-brand-gold mb-4 border-b border-white/5 pb-2">معلومات التواصل الافتراضية</h3>
             <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm text-brand-silver">رقم الهاتف الأساسي</label>
                   <input type="text" defaultValue="+966 50 123 4567" className="w-full h-12 px-4 bg-[#0A192F] border border-white/10 rounded focus:border-brand-gold text-left text-white outline-none" dir="ltr" />
                </div>
                <div className="space-y-2">
                   <label className="text-sm text-brand-silver">البريد الإلكتروني الأساسي</label>
                   <input type="text" defaultValue="info@alu-horizon.com" className="w-full h-12 px-4 bg-[#0A192F] border border-white/10 rounded focus:border-brand-gold text-left text-white outline-none" dir="ltr" />
                </div>
                <div className="space-y-2 md:col-span-2">
                   <label className="text-sm text-brand-silver">العنوان</label>
                   <input type="text" defaultValue="الرياض، المملكة العربية السعودية" className="w-full h-12 px-4 bg-[#0A192F] border border-white/10 rounded focus:border-brand-gold text-white outline-none" />
                </div>
             </div>
           </div>

           {/* SEO Items */}
           <div>
             <h3 className="text-lg font-bold text-brand-gold mb-4 border-b border-white/5 pb-2">إعدادات المحركات SEO</h3>
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-sm text-brand-silver">وصف الموقع الافتراضي</label>
                   <textarea rows={3} defaultValue="شركة أفق الألمنيوم الرائدة في مجال الألمنيوم والزجاج..." className="w-full p-4 bg-[#0A192F] border border-white/10 rounded focus:border-brand-gold text-white outline-none resize-none" />
                </div>
             </div>
           </div>

           <div className="pt-4 border-t border-white/5">
             <button type="submit" className="px-8 py-3 bg-brand-gold text-[#0A192F] font-bold rounded hover:bg-[#b8962e] transition-colors w-full sm:w-auto">
               حفظ الإعدادات
             </button>
           </div>
        </form>
      </div>
    </div>
  );
}
