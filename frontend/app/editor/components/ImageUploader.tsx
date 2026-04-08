'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useEditorStore } from '@/store/editorStore';
import { assetsAPI } from '@/lib/api';
import type { UploadedAsset } from '@/types/canvas';
import { toast } from 'sonner';

interface ImageUploaderProps {
  onClose: () => void;
}

type TabType = 'upload' | 'gallery';

export default function ImageUploader({ onClose }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const addObject = useEditorStore((s) => s.addObject);
  const selectObject = useEditorStore((s) => s.selectObject);
  const layers = useEditorStore((s) => s.layers);

  // ─── Charger la galerie d'assets ──────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'gallery') {
      loadAssets();
    }
  }, [activeTab]);

  const loadAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await assetsAPI.list('image');
      setAssets(res.data);
    } catch (error) {
      toast.error('Impossible de charger les assets');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Drag & Drop ────────────────────────────────────────────────────────
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        toast.error('Veuillez sélectionner une image');
        return;
      }
      setPreviewFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  // ─── Upload de l'image ───────────────────────────────────────────────────
  const handleUpload = useCallback(async () => {
    if (!previewFile) {
      toast.error('Sélectionnez une image');
      return;
    }

    setUploading(true);
    try {
      const res = await assetsAPI.upload(previewFile, 'image');
      const newAsset = res.data as UploadedAsset;
      setAssets((prev) => [newAsset, ...prev]);
      toast.success('Image uploadée avec succès');

      // Ajouter automatiquement sur le canvas
      addImageToCanvas(newAsset);
      setPreviewFile(null);
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
      console.error(error);
    } finally {
      setUploading(false);
    }
  }, [previewFile, addObject, layers]);

  // ─── Ajouter une image au canvas ────────────────────────────────────────
  const addImageToCanvas = useCallback((asset: UploadedAsset) => {
    if (layers.length === 0) {
      toast.error('Aucun calque disponible');
      return;
    }

    const contentLayer = layers.find((l) => l.name === 'Contenu') || layers[layers.length - 1];
    
    // Dimensions par défaut (adapter à l'image)
    const imgWidth = asset.width || 200;
    const imgHeight = asset.height || 150;
    const scaleFactor = Math.min(300 / imgWidth, 300 / imgHeight);

    const newImage = {
      id: `img-${Date.now()}`,
      type: 'image' as const,
      src: asset.file_url,
      x: Math.max(50, Math.random() * 200),
      y: Math.max(50, Math.random() * 200),
      width: imgWidth * scaleFactor,
      height: imgHeight * scaleFactor,
      rotation: 0,
      opacity: 1,
      draggable: true,
      data: {
        assetId: asset.id,
        originalName: asset.original_name,
      },
    };

    addObject(contentLayer.id, newImage);
    selectObject(newImage.id);
    onClose();
  }, [layers, addObject, selectObject, onClose]);

  // ─── Ajouter une image de la galerie ────────────────────────────────────
  const handleAddAsset = useCallback((asset: UploadedAsset) => {
    addImageToCanvas(asset);
  }, [addImageToCanvas]);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute left-14 top-14 w-96 max-h-[70vh] bg-[#1a1a1a] border border-zinc-700 rounded-xl shadow-2xl pointer-events-auto flex flex-col overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 flex-shrink-0">
          <span className="text-sm font-medium text-white">Importer une image</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl leading-none">
            &times;
          </button>
        </div>

        {/* Onglets */}
        <div className="flex gap-2 px-4 pt-3 border-b border-zinc-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-2 text-xs font-medium rounded transition ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Uploader
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3 py-2 text-xs font-medium rounded transition ${
              activeTab === 'gallery'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Galerie
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'upload' && (
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-zinc-600 bg-zinc-900 hover:border-zinc-500'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-zinc-400 text-sm">
                  <div className="text-xl mb-2">📁</div>
                  <p>
                    {isDragActive
                      ? 'Déposez l\'image ici'
                      : 'Glissez une image ou cliquez pour sélectionner'}
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">JPG, PNG, GIF, WebP</p>
                </div>
              </div>

              {/* Préview du fichier sélectionné */}
              {previewFile && (
                <div className="space-y-3">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
                    <p className="text-xs text-zinc-400 mb-2 truncate">{previewFile.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(previewFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-xs font-medium py-2 rounded transition"
                    >
                      {uploading ? 'Upload...' : 'Upload'}
                    </button>
                    <button
                      onClick={() => setPreviewFile(null)}
                      disabled={uploading}
                      className="flex-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 text-zinc-300 text-xs font-medium py-2 rounded transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-2">
              {loading && (
                <div className="flex justify-center py-6">
                  <div className="text-zinc-500 text-sm">Chargement...</div>
                </div>
              )}

              {!loading && assets.length === 0 && (
                <div className="flex justify-center py-6">
                  <div className="text-zinc-500 text-sm">Aucune image uploadée</div>
                </div>
              )}

              {!loading && assets.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="group bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden cursor-pointer hover:border-blue-500 transition"
                    >
                      {/* Image thumbnail */}
                      <div
                        className="relative bg-black aspect-square overflow-hidden"
                        onClick={() => handleAddAsset(asset)}
                      >
                        <img
                          src={asset.file_url}
                          alt={asset.original_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-medium">
                          Ajouter
                        </div>
                      </div>

                      {/* Infos */}
                      <div className="p-2">
                        <p className="text-xs text-zinc-300 truncate">{asset.original_name}</p>
                        <p className="text-xs text-zinc-500">
                          {asset.width}×{asset.height}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
