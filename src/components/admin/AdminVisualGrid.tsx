import { ReactNode } from 'react';

interface AdminVisualGridProps {
  children: ReactNode;
}

export function AdminVisualGrid({ children }: AdminVisualGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
