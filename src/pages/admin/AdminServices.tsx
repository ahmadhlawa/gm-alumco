import { useState, useEffect } from 'react';
import { getServices } from '@/lib/api';
import { Service } from '@/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminAddNewCard } from '@/components/admin/AdminAddNewCard';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ServiceCard } from '@/components/cards/ServiceCard';

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    getServices().then(setServices);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
      setServices(services.filter(p => p.id !== id));
      alert('تم تنفيذ العملية بنجاح');
    }
  };

  const handleToggleStatus = (id: string) => {
    alert('تم تغيير حالة الخدمة بنجاح');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="إدارة الخدمات"
        description="تحديث قائمة الخدمات التي تقدمها الشركة"
      />

      <AdminVisualGrid>
        <AdminAddNewCard 
          title="إضافة خدمة جديدة" 
          description="إضافة خدمة جديدة إلى القائمة"
          onClick={() => alert('إضافة خدمة')}
        />
        
        {services.map((service, idx) => (
          <div key={service.id} className="relative group bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="pointer-events-none p-4">
               <ServiceCard service={service} index={idx} disableLink />
            </div>
            
            {/* Admin Overlay layer */}
            <div className="absolute top-4 right-4 z-20">
              <AdminStatusBadge status={true} activeLabel="نشط" />
            </div>

            <div className="p-4 border-t border-white/5 bg-[#0A192F] mt-auto">
              <div className="flex items-center justify-between">
                <AdminActionButtons 
                  onEdit={() => alert('تعديل')}
                  onDelete={() => handleDelete(service.id)}
                />
                <button 
                  onClick={() => handleToggleStatus(service.id)}
                  className="text-xs text-brand-silver hover:text-white transition-colors"
                >
                  تغيير الحالة
                </button>
              </div>
            </div>
          </div>
        ))}
      </AdminVisualGrid>
    </div>
  );
}
