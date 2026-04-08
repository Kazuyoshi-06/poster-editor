'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { projectsAPI } from '@/lib/api';

interface TemplateCardProps {
  id: number;
  name: string;
  category: string;
  preview_url: string | null;
  canvas_data: Record<string, any>;
  onUseTemplate: (templateId: number) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  event: 'Événement',
  tournament: 'Tournoi',
  announcement: 'Annonce',
  generic: 'Générique',
};

export default function TemplateCard({
  id,
  name,
  category,
  preview_url,
  canvas_data,
  onUseTemplate,
}: TemplateCardProps) {
  const [creating, setCreating] = useState(false);

  const handleUseTemplate = async () => {
    setCreating(true);
    try {
      const response = await projectsAPI.create({
        name: `${name} - Copy`,
        canvas_data,
        width: canvas_data.width || 794,
        height: canvas_data.height || 1123,
      });
      onUseTemplate(response.data.id);
    } catch (error) {
      console.error('Failed to create project from template:', error);
      alert('Erreur lors de la création du projet depuis le template');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="group relative bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-green-500 transition-all duration-300 animate-fadeIn hover:shadow-lg hover:shadow-green-500/10">
      {/* Template Preview */}
      <div className="relative w-full aspect-[9/12] bg-zinc-800 overflow-hidden">
        {preview_url ? (
          <Image
            src={preview_url}
            alt={name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
            <span className="text-zinc-400 text-sm text-center px-4">
              Aperçu du template : {name}
            </span>
          </div>
        )}
      </div>

      {/* Info & Actions */}
      <div className="p-4">
        <h3 className="font-semibold text-white truncate">{name}</h3>
        <p className="text-xs text-zinc-400 mt-1">{CATEGORY_LABELS[category] || category}</p>

        {/* Use Template Button */}
        <button
          onClick={handleUseTemplate}
          disabled={creating}
          className="w-full mt-3 px-3 py-2 text-sm font-medium bg-green-600 hover:bg-green-500 disabled:bg-green-700 text-white rounded transition-colors disabled:opacity-75"
        >
          {creating ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              Création...
            </span>
          ) : (
            'Utiliser ce template'
          )}
        </button>
      </div>
    </div>
  );
}
