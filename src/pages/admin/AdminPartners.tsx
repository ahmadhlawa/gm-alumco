import { useState } from 'react';
import { partners as initialPartners } from '@/data/partners';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminAddNewCard } from '@/components/admin/AdminAddNewCard';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

export function AdminPartners() {
  const [partners, setPartners] = useState(initialPartners);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الشريك؟')) {
      setPartners(partners.filter(p => p.id !== id));
      alert('تم تنفيذ العملية بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="إدارة شركاء النجاح"
        description="إضافة وتحديث شعارات الموردين وشركاء النجاح المعروضة في الصفحة الرئيسية"
      />

      <AdminVisualGrid>
        <AdminAddNewCard 
          title="إضافة شريك جديد" 
          description="إضافة مورد أو شريك جديد"
          onClick={() => alert('إضافة شريك')}
        />
        
        {partners.map((partner) => (
          <div key={partner.id} className="relative group bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="absolute top-4 right-4 z-20">
              <AdminStatusBadge status={true} activeLabel="نشط" />
            </div>

            <div className="p-8 flex flex-col items-center justify-center flex-grow">
               <div className="w-24 h-24 rounded-full bg-[#0A192F] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                 {partner.logo ? (
                   <img 
                      src={partner.logo} 
                      alt={partner.name} 
                      className="max-h-full max-w-full object-contain p-2"
                   />
                 ) : (
                   <span className="text-2xl font-bold text-gray-400">
                     {partner.name.substring(0, 2)}
                   </span>
                 )}
               </div>
               <h3 className="text-lg font-bold text-brand-silver text-center">{partner.name}</h3>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-[#0A192F]">
              <div className="flex items-center justify-between">
                <AdminActionButtons 
                  onEdit={() => alert('تعديل التفاصيل')}
                  onDelete={() => handleDelete(partner.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </AdminVisualGrid>
    </div>
  );
}
