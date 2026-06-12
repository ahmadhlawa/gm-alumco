import { useNavigate, useParams } from 'react-router-dom';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { Project } from '@/types';
import { createProject, updateProject, getProjects } from '@/lib/api';
import { useState, useEffect } from 'react';
import { LoadingState } from '@/components/common/LoadingState';

export function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Project | undefined>();
  const [loading, setLoading] = useState(id ? true : false);

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      // In a real app we'd fetch by ID here. Mocking by slug isn't perfect, we'll just fetch all and find
      getProjects().then(data => {
        const found = data.find(p => p.id === id);
        if (found) setInitialData(found);
        setLoading(false);
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (data: Partial<Project>) => {
    if (isEdit && id) {
      await updateProject(id, data);
    } else {
      await createProject(data);
    }
    // Simulate slight delay before redirect
    setTimeout(() => {
      navigate('/admin/projects');
    }, 1500);
  };

  if (loading) return <LoadingState />;

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
