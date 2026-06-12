import { useState } from 'react';
import { Mail, Search, MessageSquare, Briefcase } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

// Mock messages for display
const MOCK_MESSAGES = [
  { id: 1, type: 'quote', name: 'أحمد عبدالله', email: 'ahmed@example.com', phone: '0501234567', project: 'فيلا سكنية', service: 'واجهات كيرتن وول', date: '2023-11-20', status: 'جديد' },
  { id: 2, type: 'contact', name: 'شركة الأفق للاستثمار', email: 'info@horizon-inv.com', phone: '0555555555', message: 'نود الاستفسار عن إمكانية تنفيذ واجهات تجارية...', date: '2023-11-19', status: 'مقروء' },
  { id: 3, type: 'quote', name: 'خالد اليوسف', email: 'khalid@test.com', phone: '0598765432', project: 'عمارة', service: 'نوافذ وأبواب', date: '2023-11-18', status: 'تم الرد' }
];

export function AdminMessages() {
  const [filter, setFilter] = useState('all');

  const filteredMessages = MOCK_MESSAGES.filter(msg => {
    if (filter === 'quote') return msg.type === 'quote';
    if (filter === 'contact') return msg.type === 'contact';
    return true;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        title="الرسائل والطلبات"
        description="إدارة رسائل التواصل وطلبات التسعير الواردة"
      />

      <div className="flex gap-2 mb-4">
           <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm rounded ${filter === 'all' ? 'bg-brand-gold text-[#0A192F] font-bold' : 'bg-[#112240] text-gray-400 hover:text-white border border-white/5'}`}>الطلبات الجديدة</button>
           <button onClick={() => setFilter('quote')} className={`px-4 py-2 text-sm rounded ${filter === 'quote' ? 'bg-brand-gold text-[#0A192F] font-bold' : 'bg-[#112240] text-gray-400 hover:text-white border border-white/5'}`}>طلبات تسعير</button>
           <button onClick={() => setFilter('contact')} className={`px-4 py-2 text-sm rounded ${filter === 'contact' ? 'bg-brand-gold text-[#0A192F] font-bold' : 'bg-[#112240] text-gray-400 hover:text-white border border-white/5'}`}>رسائل تواصل</button>
      </div>

      <div className="bg-[#112240] border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full text-right text-brand-silver">
          <thead className="bg-[#172A45] text-white">
            <tr>
              <th className="p-4 font-bold">المرسل / التاريخ</th>
              <th className="p-4 font-bold">النوع</th>
              <th className="p-4 font-bold">التفاصيل</th>
              <th className="p-4 font-bold text-left">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((msg) => (
              <tr key={msg.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-4">
                  <div className="font-medium text-white">{msg.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{msg.date}</div>
                </td>
                <td className="p-4">
                  {msg.type === 'quote' ? (
                     <div className="flex items-center gap-2 text-brand-gold">
                       <Briefcase className="w-4 h-4" /> طلب تسعير
                     </div>
                  ) : (
                     <div className="flex items-center gap-2 text-blue-400">
                       <MessageSquare className="w-4 h-4" /> رسالة عامة
                     </div>
                  )}
                </td>
                <td className="p-4">
                   {msg.type === 'quote' ? (
                     <div>مطلوب: {msg.service} ({msg.project})</div>
                   ) : (
                     <div className="truncate max-w-[200px]">{msg.message}</div>
                   )}
                </td>
                <td className="p-4 text-left">
                  <button className="text-white hover:text-brand-gold px-3 py-1 bg-white/5 rounded">عرض التفاصيل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
