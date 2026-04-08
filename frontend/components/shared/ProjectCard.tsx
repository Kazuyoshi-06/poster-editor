'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Copy, MoreVertical } from 'lucide-react';
import { projectsAPI } from '@/lib/api';

interface ProjectCardProps {
  id: number;
  name: string;
  thumbnail: string | null;
  updated_at: string;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
}

export default function ProjectCard({
  id,
  name,
  thumbnail,
  updated_at,
  onDelete,
  onDuplicate,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de supprimer "${name}"?`)) return;
    setDeleting(true);
    try {
      await projectsAPI.delete(id);
      onDelete(id);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
      setShowMenu(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await projectsAPI.get(id);
      const original = response.data;
      const newProject = {
        name: `${original.name} (copie)`,
        canvas_data: original.canvas_data,
        width: original.width,
        height: original.height,
      };
      const created = await projectsAPI.create(newProject);
      onDuplicate(created.data.id);
      setShowMenu(false);
    } catch (error) {
      console.error('Duplicate error:', error);
      alert('Erreur lors de la duplication');
    }
  };

  const formattedDate = new Date(updated_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="group relative bg-zinc-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-300 animate-fadeIn hover:shadow-lg hover:shadow-blue-500/10">
      {/* Thumbnail */}
      <Link href={`/editor/${id}`} className="block">
        <div className="relative w-full aspect-[9/12] bg-zinc-800 overflow-hidden">
          {thumbnail ? (
            <Image
              src={thumbnail}
              alt={name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-700 to-zinc-800">
              <span className="text-zinc-500 text-sm">Pas d&apos;aperçu</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info & Actions */}
      <div className="p-4">
        <Link href={`/editor/${id}`} className="block group/title">
          <h3 className="font-semibold text-white truncate group-hover/title:text-blue-400 transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-xs text-zinc-400 mt-1">{formattedDate}</p>

        {/* Actions Menu */}
        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/editor/${id}`}
            className="flex-1 px-2 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            Éditer
          </Link>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
            >
              <MoreVertical size={16} className="text-zinc-400" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-zinc-800 rounded-lg shadow-lg z-50 border border-zinc-700">
                <button
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors first:rounded-t-lg"
                >
                  <Copy size={14} />
                  Dupliquer
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 transition-colors last:rounded-b-lg disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  {deleting ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay on hover (click outside to close menu) */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
