import { useState, useEffect } from 'react';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminAddNewCard } from '@/components/admin/AdminAddNewCard';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';
import { ProductCard } from '@/components/cards/ProductCard';

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter(p => p.id !== id));
      alert('تم تنفيذ العملية بنجاح');
    }
  };

  const handleToggleStatus = (id: string) => {
    alert('تم تغيير حالة المنتج بنجاح');
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="إدارة المنتجات"
        description="إدارة المنتجات والأنظمة المتوفرة"
      />

      <AdminVisualGrid>
        <AdminAddNewCard 
          title="إضافة منتج جديد" 
          description="إضافة منتج أو نظام ألمنيوم جديد"
          onClick={() => alert('إضافة منتج')}
        />
        
        {products.map((product, idx) => (
          <div key={product.id} className="relative group bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="pointer-events-none p-4">
               <ProductCard product={product} index={idx} disableLink />
            </div>
            
            {/* Admin Overlay layer */}
            <div className="absolute top-4 right-4 z-20">
              <AdminStatusBadge status={true} activeLabel="متوفر" />
            </div>

            <div className="p-4 border-t border-white/5 bg-[#0A192F] mt-auto">
              <div className="flex items-center justify-between">
                <AdminActionButtons 
                  onEdit={() => alert('تعديل')}
                  onDelete={() => handleDelete(product.id)}
                />
                <button 
                  onClick={() => handleToggleStatus(product.id)}
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
