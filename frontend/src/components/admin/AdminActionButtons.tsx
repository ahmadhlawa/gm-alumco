import { Eye, Edit, Trash2 } from 'lucide-react';

interface AdminActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function AdminActionButtons({ onView, onEdit, onDelete }: AdminActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {onView && (
        <button 
          onClick={onView}
          className="p-2 bg-[#172A45] border border-white/5 rounded text-blue-400 hover:bg-blue-500/10 transition-colors"
          title="عرض"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button 
          onClick={onEdit}
          className="p-2 bg-[#172A45] border border-white/5 rounded text-brand-gold hover:bg-brand-gold/10 transition-colors"
          title="تعديل"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button 
          onClick={onDelete}
          className="p-2 bg-[#172A45] border border-white/5 rounded text-red-400 hover:bg-red-500/10 transition-colors"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
