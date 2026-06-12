import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminAddNewCard } from '@/components/admin/AdminAddNewCard';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

const mockTestimonials = [
  { id: '1', name: 'م. خالد أحمد', company: 'شركة التطوير العقاري', text: 'كانت تجربتنا مع أفق الألمنيوم ممتازة، التزام تام بالمواعيد وجودة التنفيذ فاقت توقعاتنا.', rating: 5 },
  { id: '2', name: 'سليمان الراجحي', company: 'مشروع فيلا الخزامى', text: 'أشكر فريق العمل على الرقي في التعامل والاحترافية في تركيب واجهات الكيرتن وول.', rating: 5 },
  { id: '3', name: 'أحمد اليوسف', company: 'مكاتب العقيق', text: 'تفاصيل تنفيذ الأبواب والنوافذ مميزة جداً، أنصح بالتعامل معهم للمشاريع الكبيرة.', rating: 4 }
];

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState(mockTestimonials);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      setTestimonials(testimonials.filter(p => p.id !== id));
      alert('تم تنفيذ العملية بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="إدارة التوصيات والآراء"
        description="إدارة آراء العملاء المعروضة في الصفحة الرئيسية"
      />

      <AdminVisualGrid>
        <AdminAddNewCard 
          title="إضافة رأي جديد" 
          description="إضافة توصية من عميل جديد"
          onClick={() => alert('إضافة تقييم')}
        />
        
        {testimonials.map((testi) => (
          <div key={testi.id} className="relative group bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="absolute top-4 right-4 z-20">
              <AdminStatusBadge status={true} activeLabel="نشط" />
            </div>

            <div className="p-6 pt-12 flex-grow">
               <div className="flex gap-1 mb-4">
                 {[...Array(5)].map((_, i) => (
                   <span key={i} className={`text-sm ${i < testi.rating ? 'text-brand-gold' : 'text-gray-600'}`}>★</span>
                 ))}
               </div>
               <p className="text-brand-silver text-sm italic mb-6">"{testi.text}"</p>
               <div>
                  <h4 className="text-white font-bold">{testi.name}</h4>
                  <p className="text-xs text-gray-500">{testi.company}</p>
               </div>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-[#0A192F]">
              <div className="flex items-center justify-between">
                <AdminActionButtons 
                  onEdit={() => alert('تعديل')}
                  onDelete={() => handleDelete(testi.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </AdminVisualGrid>
    </div>
  );
}
