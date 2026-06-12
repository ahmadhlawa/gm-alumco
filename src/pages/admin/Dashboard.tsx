import { useState, useEffect } from 'react';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { LoadingState } from '@/components/common/LoadingState';
import { Briefcase, MessageSquare, Package, ImageIcon } from 'lucide-react';
import { getProjects, getProducts } from '@/lib/api';

export function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading basic dashboard data
    Promise.all([getProjects(), getProducts()]).then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingState message="جاري تحميل لوحة التحكم..." />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="إجمالي المشاريع" value="24" icon={Briefcase} trend="+3 هذا الشهر" trendUp={true} />
        <AdminStatCard title="الرسائل الجديدة" value="12" icon={MessageSquare} trend="متزايد" trendUp={true} />
        <AdminStatCard title="المنتجات" value="18" icon={Package} />
        <AdminStatCard title="صور المعرض" value="142" icon={ImageIcon} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
         <div className="bg-brand-navy p-6 rounded-lg border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">أحدث المشاريع المضافة</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="text-white font-medium">مشروع فيلا سكنية - الرياض</div>
                  <span className="text-xs text-brand-silver">قبل يومين</span>
                </div>
              ))}
            </div>
         </div>

         <div className="bg-brand-navy p-6 rounded-lg border border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">أحدث الرسائل وطلبات التسعير</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div>
                    <div className="text-white font-medium mb-1">أحمد محمد</div>
                    <div className="text-xs text-brand-silver">طلب عرض سعر لتركيب واجهات...</div>
                  </div>
                  <span className="px-2 py-1 bg-brand-gold/10 text-brand-gold text-xs rounded">جديد</span>
                </div>
              ))}
            </div>
         </div>
      </div>
    </div>
  );
}
