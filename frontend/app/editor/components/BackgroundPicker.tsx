'use client';

import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { assetsAPI } from '@/lib/api';
import type { UploadedAsset } from '@/types/canvas';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

// ─── Presets ──────────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  '#0f0f0f', '#1a1a2e', '#16213e', '#0f3460', '#1a1a1a',
  '#2d1b69', '#11998e', '#ee0979', '#f7971e', '#ffd200',
  '#ffffff', '#e8e8e8', '#232526', '#414345', '#373b44',
];

const PRESET_GRADIENTS = [
  { label: 'Nuit', value: 'linear,#0f0f0f,#1a1a2e' },
  { label: 'Océan', value: 'linear,#1a1a2e,#16213e' },
  { label: 'Purpura', value: 'linear,#2d1b69,#11998e' },
  { label: 'Coucher', value: 'linear,#ee0979,#f7971e' },
  { label: 'Or', value: 'linear,#f7971e,#ffd200' },
  { label: 'Forêt', value: 'linear,#134e5e,#71b280' },
  { label: 'Cosmos', value: 'linear,#0f0c29,#302b63' },
  { label: 'Flamme', value: 'linear,#c94b4b,#4b134f' },
];

// ─── Onglets ──────────────────────────────────────────────────────────────────

type Tab = 'color' | 'gradient' | 'image';

function TabButton({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
        active ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-zinc-200',
      )}
    >
      {children}
    </button>
  );
}

// ─── Onglet Couleur ───────────────────────────────────────────────────────────

function ColorTab() {
  const background = useEditorStore((s) => s.background);
  const setBackground = useEditorStore((s) => s.setBackground);
  const color = background.type === 'color' ? background.value : '#1a1a2e';
  const [hex, setHex] = useState(color);

  useEffect(() => { if (background.type === 'color') setHex(background.value); }, [background]);

  function apply(c: string) {
    setHex(c);
    setBackground({ type: 'color', value: c });
  }

  return (
    <div className="space-y-3">
      <HexColorPicker color={hex} onChange={apply} style={{ width: '100%', height: '160px' }} />
      <input
        value={hex}
        onChange={(e) => { setHex(e.target.value); if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) apply(e.target.value); }}
        className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 h-8 text-sm text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
        placeholder="#000000"
        maxLength={7}
      />
      <div>
        <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Presets</p>
        <div className="grid grid-cols-5 gap-1.5">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => apply(c)}
              className="aspect-square rounded-md border border-zinc-700 hover:scale-110 transition-transform relative"
              style={{ background: c }}
              title={c}
            >
              {hex === c && (
                <Check size={10} className="absolute inset-0 m-auto text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Dégradé ───────────────────────────────────────────────────────────

function GradientTab() {
  const background = useEditorStore((s) => s.background);
  const setBackground = useEditorStore((s) => s.setBackground);

  const currentGrad = background.type === 'gradient' ? background.value : 'linear,#1a1a2e,#0f0f0f';
  const parts = currentGrad.split(',');
  const [color1, setColor1] = useState(parts[1] ?? '#1a1a2e');
  const [color2, setColor2] = useState(parts[2] ?? '#0f0f0f');
  const [editing, setEditing] = useState<1 | 2>(1);

  function applyGradient(c1 = color1, c2 = color2) {
    setBackground({ type: 'gradient', value: `linear,${c1},${c2}` });
  }

  return (
    <div className="space-y-3">
      {/* Préview du dégradé */}
      <div
        className="w-full h-16 rounded-lg border border-zinc-700"
        style={{ background: `linear-gradient(180deg, ${color1}, ${color2})` }}
      />

      {/* Sélecteurs des 2 couleurs */}
      <div className="flex gap-2">
        {([1, 2] as const).map((n) => {
          const c = n === 1 ? color1 : color2;
          const isActive = editing === n;
          return (
            <button
              key={n}
              onClick={() => setEditing(n)}
              className={cn(
                'flex-1 flex items-center gap-2 h-8 px-2 rounded border transition-colors',
                isActive ? 'border-blue-500 bg-zinc-700' : 'border-zinc-700 bg-zinc-800 hover:border-zinc-500',
              )}
            >
              <div className="h-4 w-4 rounded flex-shrink-0 border border-zinc-600" style={{ background: c }} />
              <span className="text-xs font-mono text-zinc-300">{c}</span>
            </button>
          );
        })}
      </div>

      <HexColorPicker
        color={editing === 1 ? color1 : color2}
        onChange={(c) => {
          if (editing === 1) { setColor1(c); applyGradient(c, color2); }
          else { setColor2(c); applyGradient(color1, c); }
        }}
        style={{ width: '100%', height: '140px' }}
      />

      {/* Presets dégradés */}
      <div>
        <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">Presets</p>
        <div className="grid grid-cols-4 gap-1.5">
          {PRESET_GRADIENTS.map((g) => {
            const [, c1, c2] = g.value.split(',');
            const isActive = background.type === 'gradient' && background.value === g.value;
            return (
              <button
                key={g.value}
                onClick={() => {
                  setColor1(c1); setColor2(c2);
                  setBackground({ type: 'gradient', value: g.value });
                }}
                className={cn(
                  'relative h-10 rounded-md border transition-all',
                  isActive ? 'border-blue-500 scale-105' : 'border-zinc-700 hover:scale-105',
                )}
                style={{ background: `linear-gradient(180deg, ${c1}, ${c2})` }}
                title={g.label}
              >
                <span className="absolute inset-x-0 bottom-0.5 text-[9px] text-white/70 text-center drop-shadow">
                  {g.label}
                </span>
                {isActive && <Check size={10} className="absolute top-1 right-1 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Onglet Image ─────────────────────────────────────────────────────────────

function ImageTab() {
  const background = useEditorStore((s) => s.background);
  const setBackground = useEditorStore((s) => s.setBackground);
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    assetsAPI.list('background')
      .then((r) => setAssets(r.data as UploadedAsset[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: async (files) => {
      if (!files[0]) return;
      setUploading(true);
      try {
        const res = await assetsAPI.upload(files[0], 'background');
        const newAsset = res.data as UploadedAsset;
        setAssets((prev) => [newAsset, ...prev]);
        setBackground({ type: 'image', value: newAsset.file_url });
        toast.success('Image de fond importée');
      } catch {
        toast.error('Erreur lors de l\'import');
      } finally {
        setUploading(false);
      }
    },
  });

  return (
    <div className="space-y-3">
      {/* Zone de drop */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-zinc-700 hover:border-zinc-500',
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="sm" />
            <span className="text-xs text-zinc-400">Import en cours…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Upload size={16} className="text-zinc-500" />
            <p className="text-xs text-zinc-400">
              {isDragActive ? 'Déposez ici' : 'Déposer ou cliquer pour importer'}
            </p>
            <p className="text-[10px] text-zinc-600">JPG, PNG, WEBP</p>
          </div>
        )}
      </div>

      {/* Galerie des fonds */}
      {loading ? (
        <div className="flex justify-center py-4"><LoadingSpinner size="sm" /></div>
      ) : assets.length === 0 ? (
        <div className="text-center py-4">
          <ImageIcon size={24} className="text-zinc-600 mx-auto mb-1" />
          <p className="text-xs text-zinc-500">Aucun fond importé</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {assets.map((asset) => {
            const isActive = background.type === 'image' && background.value === asset.file_url;
            return (
              <button
                key={asset.id}
                onClick={() => setBackground({ type: 'image', value: asset.file_url })}
                className={cn(
                  'relative aspect-[3/4] rounded-md overflow-hidden border transition-all',
                  isActive ? 'border-blue-500 scale-95' : 'border-zinc-700 hover:border-zinc-400',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset.file_url}
                  alt={asset.original_name}
                  className="w-full h-full object-cover"
                />
                {isActive && (
                  <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Supprimer l'image de fond */}
      {background.type === 'image' && (
        <button
          onClick={() => setBackground({ type: 'color', value: '#1a1a2e' })}
          className="w-full h-7 flex items-center justify-center gap-1.5 text-xs text-red-400 hover:bg-red-900/20 rounded transition-colors"
        >
          <X size={12} /> Supprimer le fond image
        </button>
      )}
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────

interface BackgroundPickerProps {
  onClose: () => void;
}

export default function BackgroundPicker({ onClose }: BackgroundPickerProps) {
  const background = useEditorStore((s) => s.background);
  const [tab, setTab] = useState<Tab>(
    background.type === 'gradient' ? 'gradient'
    : background.type === 'image'  ? 'image'
    : 'color',
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Ferme si clic en dehors
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div
        ref={containerRef}
        className="absolute left-[60px] top-[52px] w-72 bg-[#1a1a1a] border border-zinc-700 rounded-xl shadow-2xl pointer-events-auto flex flex-col max-h-[calc(100vh-80px)]"
      >
        {/* En-tête */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-700 flex-shrink-0">
          <span className="text-sm font-semibold text-white">Fond du canvas</span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors h-6 w-6 flex items-center justify-center rounded hover:bg-zinc-700"
          >
            <X size={14} />
          </button>
        </div>

        {/* Onglets */}
        <div className="flex gap-1 p-2 border-b border-zinc-800 bg-zinc-800/40 flex-shrink-0">
          <TabButton active={tab === 'color'} onClick={() => setTab('color')}>Couleur</TabButton>
          <TabButton active={tab === 'gradient'} onClick={() => setTab('gradient')}>Dégradé</TabButton>
          <TabButton active={tab === 'image'} onClick={() => setTab('image')}>Image</TabButton>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'color'    && <ColorTab />}
          {tab === 'gradient' && <GradientTab />}
          {tab === 'image'    && <ImageTab />}
        </div>
      </div>
    </div>
  );
}
