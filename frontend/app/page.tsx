'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { projectsAPI, templatesAPI } from '@/lib/api';
import ProjectCard from '@/components/shared/ProjectCard';
import TemplateCard from '@/components/shared/TemplateCard';

interface Project {
  id: number;
  name: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

interface Template {
  id: number;
  name: string;
  category: string;
  preview_url: string | null;
  canvas_data: Record<string, any>;
}

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingNew, setCreatingNew] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTemplates();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.list();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await templatesAPI.list();
      setTemplates(response.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleNewProject = async () => {
    setCreatingNew(true);
    try {
      const response = await projectsAPI.create({
        name: 'Nouveau projet',
        canvas_data: {},
        width: 794,
        height: 1123,
      });
      router.push(`/editor/${response.data.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Erreur lors de la création du projet');
      setCreatingNew(false);
    }
  };

  const handleDeleteProject = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDuplicateProject = (id: number) => {
    fetchProjects();
  };

  const handleUseTemplate = (projectId: number) => {
    router.push(`/editor/${projectId}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 animate-slideInDown">
          <div>
            <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Poster Editor
            </h1>
            <p className="text-zinc-400 mt-2">Créez et gérez vos affiches avec style</p>
          </div>
          <button
            onClick={handleNewProject}
            disabled={creatingNew}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:opacity-75 transition-all duration-300 px-6 py-3 rounded-lg font-medium shadow-lg hover:shadow-blue-500/50"
          >
            {creatingNew ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Plus size={18} />
                Nouveau projet
              </>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <>
            {/* Projects Section */}
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="inline-block w-1 h-6 bg-blue-500 rounded-full"></span>
                Vos projets
              </h2>
              {projects.length === 0 ? (
                <div className="text-zinc-500 text-center py-12">
                  <p className="text-lg font-medium">Aucun projet pour l&apos;instant.</p>
                  <p className="text-sm mt-2">Créez votre premier projet ou utilisez un template.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-16">
                  {projects.map((project, idx) => (
                    <div key={project.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-slideInUp">
                      <ProjectCard
                        id={project.id}
                        name={project.name}
                        thumbnail={project.thumbnail}
                        updated_at={project.updated_at}
                        onDelete={handleDeleteProject}
                        onDuplicate={handleDuplicateProject}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Templates Section */}
            {templates.length > 0 && (
              <div className="animate-fadeIn" style={{ animationDelay: '100ms' }}>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <span className="inline-block w-1 h-6 bg-green-500 rounded-full"></span>
                  Templates disponibles
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {templates.map((template, idx) => (
                    <div key={template.id} style={{ animationDelay: `${idx * 50 + 150}ms` }} className="animate-slideInUp">
                      <TemplateCard
                        id={template.id}
                        name={template.name}
                        category={template.category}
                        preview_url={template.preview_url}
                        canvas_data={template.canvas_data}
                        onUseTemplate={handleUseTemplate}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
