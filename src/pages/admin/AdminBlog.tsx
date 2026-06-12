import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminAddNewCard } from '@/components/admin/AdminAddNewCard';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

const mockPosts = [
  { id: '1', title: 'أهمية نظام الكيرتن وول في الأبراج', date: '2023-11-20', category: 'معلومات تقنية' },
  { id: '2', title: 'كيف تختار نوع الألمنيوم المناسب لفيلتك', date: '2023-11-15', category: 'نصائح' },
  { id: '3', title: 'أفق الألمنيوم توقع اتفاقية مع شركة قطاعات', date: '2023-11-10', category: 'أخبار الشركة' }
];

export function AdminBlog() {
  const [posts, setPosts] = useState(mockPosts);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      setPosts(posts.filter(p => p.id !== id));
      alert('تم تنفيذ العملية بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="إدارة المقالات"
        description="نشر وتعديل أخبار الشركة والمقالات في المدونة"
      />

      <AdminVisualGrid>
        <AdminAddNewCard 
          title="إضافة مقال جديد" 
          description="كتابة ونشر مقال جديد"
          onClick={() => alert('إضافة مقال')}
        />
        
        {posts.map((post) => (
          <div key={post.id} className="relative group bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="absolute top-4 right-4 z-20">
              <AdminStatusBadge status={true} activeLabel="منشور" />
            </div>

            <div className="p-6 pt-12 flex-grow flex flex-col justify-center">
               <span className="text-xs text-brand-gold bg-brand-gold/10 px-2 py-1 rounded inline-block w-fit mb-4">{post.category}</span>
               <h3 className="text-xl font-bold text-white mb-2 leading-snug">{post.title}</h3>
               <p className="text-sm text-gray-500 mt-auto">{post.date}</p>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-[#0A192F]">
              <div className="flex items-center justify-between">
                <AdminActionButtons 
                  onEdit={() => alert('تعديل المقال')}
                  onDelete={() => handleDelete(post.id)}
                  onView={() => alert('معاينة المقال')}
                />
              </div>
            </div>
          </div>
        ))}
      </AdminVisualGrid>
    </div>
  );
}
