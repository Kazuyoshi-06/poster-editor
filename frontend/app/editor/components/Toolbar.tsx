'use client';

import {
  MousePointer2,
  Type,
  Image as ImageIcon,
  Square,
  PaintBucket,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useEditorStore, type ToolType } from '@/store/editorStore';
import { createTextObject, createRectObject } from '@/lib/canvasUtils';
import { cn } from '@/lib/utils';
import { useRef } from 'react';

// ─── Bouton d'outil ────────────────────────────────────────────────────────────

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  shortcut?: string;
}

function ToolButton({ icon, label, active, onClick, shortcut }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 active:scale-95',
          'text-zinc-400 hover:text-white hover:bg-zinc-700 hover:shadow-md',
          active && 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 shadow-lg shadow-blue-500/20',
        )}
        aria-label={label}
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-zinc-800 text-zinc-100 border-zinc-700 animate-slideInDown">
        <span>{label}</span>
        {shortcut && <span className="ml-2 text-zinc-400 text-xs">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

// ─── Toolbar principale ───────────────────────────────────────────────────────

interface ToolbarProps {
  onOpenImageUploader: () => void;
  onOpenBackgroundPicker: () => void;
}

export default function Toolbar({ onOpenImageUploader, onOpenBackgroundPicker }: ToolbarProps) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const addObject = useEditorStore((s) => s.addObject);
  const layers = useEditorStore((s) => s.layers);
  const canvasWidth = useEditorStore((s) => s.canvasWidth);
  const canvasHeight = useEditorStore((s) => s.canvasHeight);
  const zoom = useEditorStore((s) => s.zoom);
  const zoomIn = useEditorStore((s) => s.zoomIn);
  const zoomOut = useEditorStore((s) => s.zoomOut);
  const zoomReset = useEditorStore((s) => s.zoomReset);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Trouve le calque cible non verrouillé
  function getTargetLayer() {
    const layer = layers.find((l) => !l.locked) ?? layers[layers.length - 1];
    if (!layer) {
      console.warn('Aucun calque disponible');
      return null;
    }
    return layer;
  }

  function handleAddText() {
    setActiveTool('select');
    const layer = getTargetLayer();
    if (!layer) {
      console.warn('Impossible d\'ajouter du texte : aucun calque disponible');
      return;
    }
    const obj = createTextObject({
      x: Math.round(canvasWidth / 2 - 200),
      y: Math.round(canvasHeight / 2 - 20),
      text: 'Double-cliquez pour éditer',
      fontSize: 40,
      fontFamily: 'Bebas Neue',
      fill: '#ffffff',
      width: 400,
    });
    addObject(layer.id, obj);
  }

  function handleAddRect() {
    setActiveTool('select');
    const layer = getTargetLayer();
    if (!layer) {
      console.warn('Impossible d\'ajouter une forme : aucun calque disponible');
      return;
    }
    const obj = createRectObject({
      x: Math.round(canvasWidth / 2 - 100),
      y: Math.round(canvasHeight / 2 - 75),
      width: 200,
      height: 150,
      fill: '#3b82f6',
    });
    addObject(layer.id, obj);
  }

  function handleImageTool() {
    setActiveTool('image');
    onOpenImageUploader();
  }

  function handleBackgroundTool() {
    setActiveTool('background');
    onOpenBackgroundPicker();
  }

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="flex flex-col items-center h-full py-3 gap-1 overflow-y-auto">
      {/* Outils principaux */}
      <ToolButton
        icon={<MousePointer2 size={18} />}
        label="Sélection"
        shortcut="V"
        active={activeTool === 'select'}
        onClick={() => setActiveTool('select')}
      />

      <Separator className="w-8 bg-zinc-700 my-1" />

      <ToolButton
        icon={<Type size={18} />}
        label="Ajouter du texte"
        shortcut="T"
        active={activeTool === 'text'}
        onClick={handleAddText}
      />

      <ToolButton
        icon={<ImageIcon size={18} />}
        label="Ajouter une image"
        shortcut="I"
        active={activeTool === 'image'}
        onClick={handleImageTool}
      />

      <ToolButton
        icon={<Square size={18} />}
        label="Ajouter une forme"
        shortcut="R"
        active={activeTool === 'rect'}
        onClick={handleAddRect}
      />

      <ToolButton
        icon={<PaintBucket size={18} />}
        label="Fond du canvas"
        shortcut="B"
        active={activeTool === 'background'}
        onClick={handleBackgroundTool}
      />

      {/* Spacer */}
      <div className="flex-1" />

      <Separator className="w-8 bg-zinc-700 my-1" />

      {/* Contrôles de zoom */}
      <ToolButton
        icon={<ZoomIn size={16} />}
        label="Zoom avant"
        shortcut="Ctrl+="
        onClick={zoomIn}
      />

      <Tooltip>
        <TooltipTrigger
          onClick={zoomReset}
          className="text-xs text-zinc-500 hover:text-zinc-300 tabular-nums w-10 text-center py-1 rounded transition-colors hover:bg-zinc-700"
        >
          {zoomPercent}%
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-zinc-800 text-zinc-100 border-zinc-700">
          Réinitialiser zoom (75%)
        </TooltipContent>
      </Tooltip>

      <ToolButton
        icon={<ZoomOut size={16} />}
        label="Zoom arrière"
        shortcut="Ctrl+-"
        onClick={zoomOut}
      />
    </div>
  );
}
