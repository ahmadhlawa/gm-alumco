import { useState, useEffect } from 'react';
import { Project } from '@/types';
import { getProjects, deleteProject } from '@/lib/api';
import { LoadingState } from '@/components/common/LoadingState';
import { EmptyState } from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المشروع؟ (محاكاة)")) {
      await deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">إدارة المشاريع</h2>
        <Link to="/admin/projects/new" className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white font-bold rounded-md hover:bg-[#b8962e] transition-colors">
           <Plus className="w-5 h-5" />
           <span>إضافة مشروع</span>
        </Link>
      </div>

      <div className="bg-brand-navy rounded-lg border border-white/5 overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState message="لا توجد مشاريع مضافة حالياً." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-brand-text">
              <thead className="bg-white/5 text-brand-silver">
                <tr>
                  <th className="px-6 py-4 font-bold">المشروع</th>
                  <th className="px-6 py-4 font-bold">التصنيف</th>
                  <th className="px-6 py-4 font-bold">الموقع</th>
                  <th className="px-6 py-4 font-bold">الحالة</th>
                  <th className="px-6 py-4 font-bold">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium">{project.title}</td>
                    <td className="px-6 py-4 text-brand-silver">{project.category}</td>
                    <td className="px-6 py-4 text-brand-silver">{project.location}</td>
                    <td className="px-6 py-4">
                      {project.featured ? (
                         <span className="px-2 py-1 bg-brand-gold/10 text-brand-gold text-xs rounded">مميز</span>
                      ) : (
                         <span className="px-2 py-1 bg-white/10 text-brand-silver text-xs rounded">عادي</span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                       <Link to={`/admin/projects/${project.id}/edit`} className="text-blue-400 hover:text-blue-300">
                         <Edit className="w-5 h-5" />
                       </Link>
                       <button onClick={() => handleDelete(project.id)} className="text-red-400 hover:text-red-300">
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
