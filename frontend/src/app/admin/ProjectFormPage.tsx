import { useNavigate, useParams } from 'react-router-dom';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Project } from '@/types';
import { createProject, getAdminProject, updateProject } from '@/api/projects';
import { toProjectDto, toProjectView } from '@/api/adapters';
import { useState, useEffect } from 'react';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';

export function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Project | undefined>();
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(false);

  const isEdit = Boolean(id);

  useEffect(() => {
    if (!isEdit || !id) return;
    setLoading(true);
    setError(false);
    getAdminProject(id)
      .then((dto) => setInitialData(toProjectView(dto, 'ar')))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleSubmit = async (data: Partial<Project>) => {
    const payload = toProjectDto(data);
    if (isEdit && id) {
      await updateProject(id, payload);
    } else {
      await createProject(payload);
    }
    navigate('/admin/projects');
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
       <h2 className="text-2xl font-bold text-white mb-8">
          {isEdit ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
       </h2>

       <ProjectForm
         initialData={initialData}
         onSubmit={handleSubmit}
       />
    </div>
  );
}
