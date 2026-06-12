import React from "react";
import { Project } from "@/types";
import { useState } from "react";
import { FileUploadPlaceholder } from "../common/FileUploadPlaceholder";

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: Partial<Project>) => void;
}

export function ProjectForm({ initialData, onSubmit }: ProjectFormProps) {
  const [formData, setFormData] = useState<Partial<Project>>(initialData || {
    title: '',
    slug: '',
    category: '',
    location: '',
    year: new Date().getFullYear().toString(),
    shortDescription: '',
    description: '',
    featured: false,
    tags: []
  });

  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-md">
           تم الحفظ بنجاح (محاكاة فقط).
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">عنوان المشروع</label>
          <input 
            type="text" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white" 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">الرابط الدائم (Slug)</label>
          <input 
            type="text" 
            dir="ltr"
            value={formData.slug} 
            onChange={(e) => setFormData({...formData, slug: e.target.value})}
            className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white text-right" 
            required 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">التصنيف</label>
          <input 
            type="text" 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white" 
            required 
          />
        </div>
         <div className="space-y-2">
          <label className="text-sm font-bold text-gray-200">السنة</label>
          <input 
            type="text" 
            value={formData.year} 
            onChange={(e) => setFormData({...formData, year: e.target.value})}
            className="w-full h-12 px-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white" 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">وصف قصير</label>
        <textarea 
          value={formData.shortDescription} 
          onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
          className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white resize-none" 
          rows={2} 
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-200">الوصف الكامل</label>
        <textarea 
          value={formData.description} 
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-4 bg-brand-navy border border-white/10 rounded focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold text-white resize-none" 
          rows={6} 
        />
      </div>

      <div className="space-y-6">
         <div>
            <label className="text-sm font-bold text-gray-200 mb-2 block">الصورة الرئيسية</label>
            <FileUploadPlaceholder label="تغيير الصورة الرئيسية" />
         </div>
         <div>
            <label className="text-sm font-bold text-gray-200 mb-2 block">معرض الصور</label>
            <FileUploadPlaceholder label="أضف صور للمعرض" />
         </div>
      </div>

      <div className="flex items-center gap-3 py-4">
         <input 
            type="checkbox" 
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({...formData, featured: e.target.checked})}
            className="w-5 h-5 accent-brand-gold"
         />
         <label htmlFor="featured" className="text-white font-bold cursor-pointer">تعيين كمشروع مميز</label>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button type="submit" className="px-8 py-3 bg-brand-gold text-white font-bold rounded-md hover:bg-[#b8962e] transition-colors">
          حفظ المشروع
        </button>
      </div>
    </form>
  );
}
