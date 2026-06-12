import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { EditContentModal, EditFieldType } from './EditContentModal';

interface EditableBlockProps {
  title: string;
  type: EditFieldType;
  value: any;
  onSave: (val: any) => void;
  children: React.ReactNode;
  className?: string;
}

export function EditableBlock({
  title,
  type,
  value,
  onSave,
  children,
  className = ''
}: EditableBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={`relative group/edit block ${className}`}>
      
      {/* Visual Overlay Indicators in Admin Mode */}
      <div className="absolute inset-0 border border-transparent group-hover/edit:border-brand-gold/70 group-hover/edit:bg-brand-gold/5 pointer-events-none rounded transition-all duration-300 z-10" />
      
      {/* Floating Edit Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="absolute top-2 right-2 opacity-0 group-hover/edit:opacity-100 bg-brand-gold text-white text-xs px-2.5 py-1.5 shadow-lg shadow-brand-gold/20 flex items-center gap-1.5 font-bold tracking-wider z-20 hover:scale-105 active:scale-95 transition-all rounded"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>تعديل</span>
      </button>

      {/* Render children normally */}
      {children}

      {/* Edit Modal popup */}
      <EditContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        type={type}
        initialValue={value}
        onSave={onSave}
      />
    </div>
  );
}
