import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface AdminSectionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  count: number;
  countLabel: string;
  link: string;
}

export function AdminSectionCard({ title, description, icon, count, countLabel, link }: AdminSectionCardProps) {
  return (
    <div className="bg-[#112240] border border-white/5 rounded-xl p-6 hover:border-brand-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.05)] transition-all group flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-[#172A45] flex items-center justify-center text-brand-gold group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="bg-[#0A192F] px-3 py-1 rounded-full border border-white/5 text-sm font-medium text-brand-silver">
          {count} {countLabel}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-brand-gold transition-colors">{title}</h3>
      <p className="text-sm text-brand-silver mb-6 flex-grow">{description}</p>
      
      <Link 
        to={link}
        className="flex items-center justify-between w-full py-3 px-4 bg-[#172A45] hover:bg-brand-gold hover:text-[#0A192F] text-white rounded-lg transition-colors font-medium border border-white/5 group/btn"
      >
        <span>إدارة القسم</span>
        <ChevronLeft className="w-5 h-5 group-hover/btn:-translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
