import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminActionButtons } from '@/components/admin/AdminActionButtons';
import { AdminAddNewCard } from '@/components/admin/AdminAddNewCard';
import { AdminVisualGrid } from '@/components/admin/AdminVisualGrid';
import { AdminStatusBadge } from '@/components/admin/AdminStatusBadge';

const mockClients = [
  { id: '1', name: 'جامعة الملك سعود' },
  { id: '2', name: 'وزارة الإسكان' },
  { id: '3', name: 'شركة أرامكو السعودية' },
  { id: '4', name: 'مجموعة بن لادن' }
];

export function AdminClients() {
  const [clients, setClients] = useState(mockClients);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      setClients(clients.filter(p => p.id !== id));
      alert('تم تنفيذ العملية بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="إدارة العملاء"
        description="إدارة شعارات وأسماء العملاء البارزين المعروضة في قسم عملائنا"
      />

      <AdminVisualGrid>
        <AdminAddNewCard 
          title="إضافة عميل جديد" 
          description="إضافة عميل جديد لمحفظة العمل"
          onClick={() => alert('إضافة عميل')}
        />
        
        {clients.map((client) => (
          <div key={client.id} className="relative group bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg flex flex-col justify-between">
            <div className="absolute top-4 right-4 z-20">
              <AdminStatusBadge status={true} activeLabel="نشط" />
            </div>

            <div className="p-8 flex flex-col items-center justify-center flex-grow">
               <div className="w-24 h-24 rounded-full bg-[#0A192F] border border-white/10 flex items-center justify-center mb-6 shadow-inner">
                 <span className="text-2xl font-bold text-gray-400">
                   {client.name.substring(0, 2)}
                 </span>
               </div>
               <h3 className="text-lg font-bold text-brand-silver text-center">{client.name}</h3>
            </div>
            
            <div className="p-4 border-t border-white/5 bg-[#0A192F]">
              <div className="flex items-center justify-between">
                <AdminActionButtons 
                  onEdit={() => alert('تعديل')}
                  onDelete={() => handleDelete(client.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </AdminVisualGrid>
    </div>
  );
}
