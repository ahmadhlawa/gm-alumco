import React from 'react';

export function AdminPageHeader({ title, description, action }: { title: string, description?: string, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#112240] p-6 border border-white/5 rounded-xl mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
        {description && <p className="text-brand-silver text-sm">{description}</p>}
      </div>
      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
