import { useState, type ReactNode } from 'react';
import { Edit3 } from 'lucide-react';
import { EditContentModal, type CmsFieldDefinition, type EditFieldType } from './EditContentModal';

interface EditableBlockProps {
  title: string;
  type: EditFieldType;
  value: any;
  onSave: (value: any) => void;
  children: ReactNode;
  fields?: CmsFieldDefinition[];
  className?: string;
}

export function EditableBlock({
  title,
  type,
  value,
  onSave,
  children,
  fields,
  className = ''
}: EditableBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={`group/edit relative block ${className}`}>
      <div className="pointer-events-none absolute inset-0 z-30 rounded border-2 border-transparent transition-all duration-200 group-hover/edit:border-brand-gold group-hover/edit:bg-brand-gold/5" />
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="absolute right-2 top-2 z-40 flex items-center gap-1.5 rounded bg-brand-gold px-3 py-2 text-xs font-bold text-white opacity-0 shadow-lg transition-all hover:bg-[#b8962e] group-hover/edit:opacity-100"
      >
        <Edit3 className="h-3.5 w-3.5" />
        تعديل
      </button>
      {children}
      <EditContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        type={type}
        initialValue={value}
        fields={fields}
        onSave={onSave}
      />
    </div>
  );
}
