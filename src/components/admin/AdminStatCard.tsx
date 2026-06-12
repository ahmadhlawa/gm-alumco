import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

export function AdminStatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-brand-navy p-6 rounded-lg border border-white/5">
       <div className="flex justify-between items-start mb-4">
         <div className="p-3 bg-brand-surface rounded-md">
            <Icon className="w-6 h-6 text-brand-gold" />
         </div>
         {trend && (
            <span className={`text-sm font-bold ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
              {trend}
            </span>
         )}
       </div>
       <h3 className="text-brand-silver text-sm mb-1">{title}</h3>
       <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
