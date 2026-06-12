import { Plus } from 'lucide-react';

interface AdminAddNewCardProps {
  title?: string;
  description?: string;
  onClick: () => void;
  className?: string;
}

export function AdminAddNewCard({ title = "إضافة عنصر جديد", description, onClick, className = "aspect-[4/3]" }: AdminAddNewCardProps) {
  return (
    <button 
      onClick={onClick}
      className={`group flex flex-col items-center justify-center p-6 bg-[#0A192F] border-2 border-dashed border-white/10 rounded-xl hover:border-brand-gold hover:bg-[#112240] transition-all duration-300 w-full ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-[#172A45] border border-white/5 flex items-center justify-center text-brand-silver group-hover:text-brand-gold group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.2)] transition-all duration-300 mb-4">
        <Plus className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-gold transition-colors">{title}</h3>
      {description && <p className="text-sm text-brand-silver text-center">{description}</p>}
    </button>
  );
}
