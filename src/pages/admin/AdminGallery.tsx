import { useState, useEffect } from 'react';
import { getGalleryImages } from '@/lib/api';
import { GalleryImage } from '@/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminAddNewCard } from '@/components/admin/AdminAddNewCard';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

export function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    getGalleryImages().then(setImages);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
      setImages(images.filter(p => p.id !== id));
      alert('تم تنفيذ العملية بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="إدارة المعرض"
        description="إدارة الصور ومقاطع الفيديو في معرض الأعمال"
      />

      <AdminVisualGrid>
        <AdminAddNewCard 
          title="رفع صورة جديدة" 
          description="أضف صورة أو فيديو للمحفظة"
          onClick={() => alert('إضافة صورة')}
        />
        
        {images.map((img) => (
          <div key={img.id} className="relative group bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="relative aspect-square">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A192F] to-transparent opacity-80" />
            </div>
            
            <div className="absolute top-4 right-4 z-20">
              <AdminStatusBadge status={true} activeLabel="منشور" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20">
              <h3 className="text-white font-bold mb-1 truncate">{img.alt}</h3>
              <p className="text-xs text-brand-silver">{img.category}</p>
            </div>
            
            <div className="p-4 bg-[#0A192F]">
              <div className="flex items-center justify-between">
                <AdminActionButtons 
                  onEdit={() => alert('تعديل التفاصيل')}
                  onDelete={() => handleDelete(img.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </AdminVisualGrid>
    </div>
  );
}
