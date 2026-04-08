'use client';

import Link from 'next/link';
import { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Konva from 'konva';
import { toast } from 'sonner';
import { useEditorStore } from '@/store/editorStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { projectsAPI } from '@/lib/api';
import type { PosterProject } from '@/types/canvas';
import { PageLoader } from '@/components/shared/LoadingSpinner';
import { exportToPNG, exportToPDF, getCanvasThumbnail } from '@/lib/exportUtils';
import Toolbar from './Toolbar';
import TopBar from './TopBar';

// Chargement dynamique (Konva ne supporte pas le SSR)
const PosterCanvas = dynamic(() => import('./Canvas'), { ssr: false });

// Panels chargés dynamiquement (implémentés dans les étapes suivantes)
const PropertiesPanel = dynamic(() => import('./PropertiesPanel').catch(() => ({ default: () => <div className="p-4 text-zinc-400 text-sm">Propriétés</div> })), { ssr: false });
const LayerPanel = dynamic(() => import('./LayerPanel').catch(() => ({ default: () => <div className="p-3 text-zinc-400 text-sm">Calques</div> })), { ssr: false });
const BackgroundPicker = dynamic(() => import('./BackgroundPicker').catch(() => ({ default: () => null })), { ssr: false });
const ImageUploader = dynamic(() => import('./ImageUploader').catch(() => ({ default: () => null })), { ssr: false });
const TextEditor = dynamic(() => import('./TextEditor').catch(() => ({ default: () => null })), { ssr: false });
const ExportOptions = dynamic(() => import('./ExportOptions').catch(() => ({ default: () => null })), { ssr: false });

interface EditorLayoutProps {
  projectId?: string;
}

export default function EditorLayout({ projectId }: EditorLayoutProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const [loading, setLoading] = useState(!!projectId);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf'>('png');
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadCanvasData = useEditorStore((s) => s.loadCanvasData);
  const resetEditor = useEditorStore((s) => s.resetEditor);
  const getCanvasDataForSave = useEditorStore((s) => s.getCanvasDataForSave);
  const projectName = useEditorStore((s) => s.projectName);
  const storeProjectId = useEditorStore((s) => s.projectId);
  const markClean = useEditorStore((s) => s.markClean);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const deleteSelectedObject = useEditorStore((s) => s.deleteSelectedObject);
  const copySelectedObject = useEditorStore((s) => s.copySelectedObject);
  const pasteObject = useEditorStore((s) => s.pasteObject);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);

  // Récupère l'état isDirty du store
  const isDirty = useEditorStore((s) => s.isDirty);

  // Met à jour le titre du document avec indicateur de modification
  useEffect(() => {
    const indicator = isDirty ? '● ' : '';
    document.title = `${indicator}${projectName} - Poster Editor`;
  }, [isDirty, projectName]);

  // Auto-save : après inactivité de 5 secondes
  useEffect(() => {
    if (!isDirty || saving) return;

    // Annule l'auto-save précédent s'il existe
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Lance un nouvel auto-save après 5 secondes
    autoSaveTimeoutRef.current = setTimeout(() => {
      setAutoSaving(true);
      handleSave().then(() => {
        setAutoSaving(false);
        // Toast optionnel (commenté pour ne pas être trop obtrusif)
        // toast.success('Auto-saved');
      }).catch(() => {
        setAutoSaving(false);
        // Erreur déjà gérée par handleSave
      });
    }, 5000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, saving]);

  // Récupère les dépendances pour les raccourcis clavier
  useEffect(() => {
    if (!projectId) { resetEditor(); return; }
    setLoading(true);
    projectsAPI.get(Number(projectId))
      .then((res) => {
        const project = res.data as PosterProject;
        const data = project.canvas_data && Object.keys(project.canvas_data).length > 0
          ? project.canvas_data
          : {
              version: '1.0',
              stage: { width: project.width, height: project.height },
              background: { type: 'color' as const, value: '#1a1a2e' },
              layers: [],
            };
        loadCanvasData(data, project.id, project.name);
      })
      .catch(() => setError('Impossible de charger le projet.'))
      .finally(() => setLoading(false));
  }, [projectId, loadCanvasData, resetEditor]);

  // Sauvegarde
  const handleSave = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const canvasData = getCanvasDataForSave();
      const payload = { name: projectName, canvas_data: canvasData, width: canvasData.stage.width, height: canvasData.stage.height };

      let savedId = storeProjectId;
      if (storeProjectId) {
        await projectsAPI.update(storeProjectId, payload);
      } else {
        const res = await projectsAPI.create(payload);
        savedId = (res.data as PosterProject).id;
      }

      // Thumbnail auto — génération après sauvegarde du projet
      if (savedId && stageRef.current) {
        try {
          const thumb = getCanvasThumbnail(stageRef.current);
          if (thumb) {
            await projectsAPI.saveThumbnail(savedId, thumb);
          }
        } catch (thumbError) {
          // Erreur non-bloquante pour les thumbnails
          console.warn('Erreur lors de la génération du thumbnail:', thumbError);
        }
      }

      markClean();
      toast.success('Projet sauvegardé');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }, [saving, getCanvasDataForSave, projectName, storeProjectId, markClean]);

  // Export PNG
  const handleExportPNG = useCallback(() => {
    if (!stageRef.current) return;
    setExportFormat('png');
    setShowExportOptions(true);
  }, []);

  // Export PDF
  const handleExportPDF = useCallback(() => {
    if (!stageRef.current) return;
    setExportFormat('pdf');
    setShowExportOptions(true);
  }, []);

  // Gestionnaire pour fermer les modales
  const closeAllModals = useCallback(() => {
    setShowBackgroundPicker(false);
    setShowImageUploader(false);
    setShowTextEditor(false);
    setShowExportOptions(false);
  }, []);

  // Raccourcis clavier
  useKeyboard([
    { key: 'z', ctrl: true, handler: undo },
    { key: 'y', ctrl: true, handler: redo },
    { key: 'z', ctrl: true, shift: true, handler: redo },
    { key: 'Delete', handler: deleteSelectedObject },
    { key: 'Backspace', handler: deleteSelectedObject },
    { key: 'c', ctrl: true, handler: copySelectedObject },
    { key: 'v', ctrl: true, handler: pasteObject },
    { key: '=', ctrl: true, handler: zoomIn },
    { key: '-', ctrl: true, handler: zoomOut },
    { key: 's', ctrl: true, handler: () => { handleSave(); } },
    { key: 'Escape', handler: closeAllModals },
  ], [undo, redo, deleteSelectedObject, copySelectedObject, pasteObject, zoomIn, zoomOut, handleSave, closeAllModals]);

  if (loading) return <PageLoader />;
  if (error) return (
    <div className="flex h-screen items-center justify-center bg-[#0f0f0f]">
      <div className="bg-zinc-900 border border-red-500/20 rounded-lg p-8 max-w-md">
        <h2 className="text-lg font-semibold text-red-400 mb-2">Erreur</h2>
        <p className="text-zinc-300 mb-6">{error}</p>
        <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md transition-colors">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f] overflow-hidden">
      {/* TopBar */}
      <div className="flex-shrink-0 border-b border-zinc-800 bg-[#1a1a1a]" style={{ height: '52px' }}>
        <TopBar
          onSave={handleSave}
          onExportPNG={handleExportPNG}
          onExportPDF={handleExportPDF}
          onOpenTemplates={() => toast.info('Templates — disponible à l\'étape 18')}
          isSaving={saving}
          autoSaveActive={autoSaving}
        />
      </div>

      {/* Corps */}
      <div className="flex flex-1 overflow-hidden">
        {/* Toolbar gauche */}
        <div className="flex-shrink-0 border-r border-zinc-800 bg-[#1a1a1a]" style={{ width: '56px' }}>
          <Toolbar
            onOpenImageUploader={() => setShowImageUploader(true)}
            onOpenBackgroundPicker={() => setShowBackgroundPicker(true)}
          />
        </div>

        {/* Zone centrale */}
        <div className="flex-1 overflow-auto bg-[#111111] flex items-start justify-center p-8">
          <PosterCanvas stageRef={stageRef} onTextDoubleClick={(objId) => {
            const selectObject = useEditorStore.getState().selectObject;
            selectObject(objId);
            setShowTextEditor(true);
          }} />
        </div>

        {/* PropertiesPanel droite */}
        <div
          className="flex-shrink-0 border-l border-zinc-800 bg-[#1a1a1a] overflow-y-auto"
          style={{ width: '280px' }}
        >
          <PropertiesPanel />
        </div>
      </div>

      {/* LayerPanel bas */}
      <div
        className="flex-shrink-0 border-t border-zinc-800 bg-[#1a1a1a] overflow-hidden"
        style={{ height: '180px' }}
      >
        <LayerPanel />
      </div>

      {/* Panels flottants (ouverts via Toolbar) */}
      {showBackgroundPicker && (
        <BackgroundPicker onClose={() => setShowBackgroundPicker(false)} />
      )}
      {showImageUploader && (
        <ImageUploader onClose={() => setShowImageUploader(false)} />
      )}
      {showTextEditor && (
        <TextEditor onClose={() => setShowTextEditor(false)} />
      )}
      {showExportOptions && stageRef.current && (
        <ExportOptions
          stageRef={stageRef.current}
          filename={projectName}
          onClose={() => setShowExportOptions(false)}
        />
      )}
    </div>
  );
}
