'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Plus,
  GripVertical, Type, ImageIcon, Square, ChevronRight,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import type { Layer, CanvasObject } from '@/types/canvas';
import { cn } from '@/lib/utils';

// ─── Icône selon le type d'objet ──────────────────────────────────────────────

function ObjectTypeIcon({ type }: { type: string }) {
  const cls = 'w-3 h-3 flex-shrink-0';
  if (type === 'text')  return <Type  className={cn(cls, 'text-blue-400')} />;
  if (type === 'image') return <ImageIcon className={cn(cls, 'text-green-400')} />;
  return <Square className={cn(cls, 'text-orange-400')} />;
}

// ─── Ligne objet ──────────────────────────────────────────────────────────────

function ObjectRow({ obj, isSelected, onSelect }: {
  obj: CanvasObject;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const label =
    obj.type === 'text'
      ? ((obj.text as string)?.slice(0, 24) || 'Texte')
      : obj.type === 'image'
      ? ((obj.src as string)?.split('/').pop()?.slice(0, 24) || 'Image')
      : `Forme ${(obj.fill as string) ?? ''}`;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'flex items-center gap-1.5 w-full pl-8 pr-2 h-6 text-left transition-colors',
        isSelected
          ? 'bg-blue-600/20 text-blue-300'
          : 'text-zinc-400 hover:bg-zinc-700/40 hover:text-zinc-200',
      )}
    >
      <ObjectTypeIcon type={obj.type} />
      <span className="text-[11px] truncate flex-1">{label}</span>
    </button>
  );
}

// ─── Ligne calque ─────────────────────────────────────────────────────────────

interface LayerRowProps {
  layer: Layer;
  isExpanded: boolean;
  selectedObjectId: string | null;
  isDragging: boolean;
  isDragOver: boolean;
  onToggleExpand: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function LayerRow({
  layer, isExpanded, selectedObjectId, isDragging, isDragOver,
  onToggleExpand, onDragStart, onDragOver, onDrop, onDragEnd,
}: LayerRowProps) {
  const toggleVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  const toggleLock      = useEditorStore((s) => s.toggleLayerLock);
  const deleteLayer     = useEditorStore((s) => s.deleteLayer);
  const renameLayer     = useEditorStore((s) => s.renameLayer);
  const selectObject    = useEditorStore((s) => s.selectObject);
  const layers          = useEditorStore((s) => s.layers);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState(layer.name);
  const inputRef = useRef<HTMLInputElement>(null);

  function commitRename() {
    const t = draft.trim();
    if (t && t !== layer.name) renameLayer(layer.id, t);
    else setDraft(layer.name);
    setEditing(false);
  }

  // Layer contenant l'objet sélectionné → mise en évidence
  const hasSelectedObj = layer.objects.some((o) => o.id === selectedObjectId);

  return (
    <div
      className={cn(
        'border-b border-zinc-800/60 transition-colors',
        isDragOver && 'bg-blue-600/10 border-blue-500/40',
        isDragging && 'opacity-40',
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Rangée principale */}
      <div
        className={cn(
          'flex items-center gap-1 h-8 px-1 group',
          hasSelectedObj && 'bg-blue-600/5',
          !layer.visible && 'opacity-50',
        )}
      >
        {/* Drag handle */}
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 p-0.5 flex-shrink-0"
        >
          <GripVertical size={12} />
        </div>

        {/* Expand chevron */}
        <button
          onClick={onToggleExpand}
          className={cn(
            'flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-transform',
            isExpanded && 'rotate-90',
          )}
        >
          <ChevronRight size={12} />
        </button>

        {/* Nom (double-click pour renommer) */}
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') { setDraft(layer.name); setEditing(false); }
            }}
            autoFocus
            className="flex-1 bg-zinc-700 border border-blue-500 rounded px-1 h-5 text-xs text-white outline-none"
          />
        ) : (
          <span
            onDoubleClick={() => { setDraft(layer.name); setEditing(true); }}
            className="flex-1 text-xs text-zinc-200 truncate cursor-default select-none"
            title={layer.name}
          >
            {layer.name}
          </span>
        )}

        {/* Compteur d'objets */}
        {layer.objects.length > 0 && (
          <span className="text-[10px] text-zinc-500 flex-shrink-0 tabular-nums">
            {layer.objects.length}
          </span>
        )}

        {/* Boutons d'action (visibles au hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggleVisibility(layer.id)}
            className="h-5 w-5 flex items-center justify-center text-zinc-400 hover:text-white rounded transition-colors"
            title={layer.visible ? 'Masquer' : 'Afficher'}
          >
            {layer.visible ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
          <button
            onClick={() => toggleLock(layer.id)}
            className="h-5 w-5 flex items-center justify-center text-zinc-400 hover:text-white rounded transition-colors"
            title={layer.locked ? 'Déverrouiller' : 'Verrouiller'}
          >
            {layer.locked ? <Lock size={11} /> : <Unlock size={11} />}
          </button>
          {layers.length > 1 && (
            <button
              onClick={() => deleteLayer(layer.id)}
              className="h-5 w-5 flex items-center justify-center text-zinc-500 hover:text-red-400 rounded transition-colors"
              title="Supprimer le calque"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>

        {/* Indicateurs permanents */}
        <div className="flex items-center gap-0.5 group-hover:hidden flex-shrink-0">
          {!layer.visible && <EyeOff size={10} className="text-zinc-600" />}
          {layer.locked  && <Lock   size={10} className="text-zinc-600" />}
        </div>
      </div>

      {/* Objets du calque (expandable) */}
      {isExpanded && layer.objects.length > 0 && (
        <div className="pb-0.5">
          {[...layer.objects].reverse().map((obj) => (
            <ObjectRow
              key={obj.id}
              obj={obj}
              isSelected={obj.id === selectedObjectId}
              onSelect={() => selectObject(obj.id)}
            />
          ))}
        </div>
      )}

      {isExpanded && layer.objects.length === 0 && (
        <p className="text-[10px] text-zinc-600 pl-8 pb-1">Calque vide</p>
      )}
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export default function LayerPanel() {
  const layers          = useEditorStore((s) => s.layers);
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const reorderLayers   = useEditorStore((s) => s.reorderLayers);
  const addLayer        = useEditorStore((s) => s.addLayer);

  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(
    () => new Set(layers.map((l) => l.id)),
  );
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedLayers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, layerId: string) => {
    setDraggingId(layerId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, layerId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(layerId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) return;

    const fromIdx = layers.findIndex((l) => l.id === draggingId);
    const toIdx   = layers.findIndex((l) => l.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    const newLayers = [...layers];
    const [moved] = newLayers.splice(fromIdx, 1);
    newLayers.splice(toIdx, 0, moved);
    reorderLayers(newLayers);

    setDraggingId(null);
    setDragOverId(null);
  }, [draggingId, layers, reorderLayers]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  // Affiche du bas vers le haut (dernier calque = premier affiché = plus haute priorité)
  const displayLayers = [...layers].reverse();

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 flex-shrink-0">
        <span className="text-xs font-semibold text-zinc-300">Calques</span>
        <button
          onClick={() => {
            const name = `Calque ${layers.length + 1}`;
            addLayer(name);
            // Auto-expand le nouveau calque
            setExpandedLayers((prev) => {
              const next = new Set(prev);
              next.add(`layer-${Date.now()}`);
              return next;
            });
          }}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 h-6 rounded hover:bg-zinc-700"
          title="Ajouter un calque"
        >
          <Plus size={12} /> Calque
        </button>
      </div>

      {/* Liste des calques */}
      <div className="flex-1 overflow-y-auto">
        {displayLayers.map((layer) => (
          <LayerRow
            key={layer.id}
            layer={layer}
            isExpanded={expandedLayers.has(layer.id)}
            selectedObjectId={selectedObjectId}
            isDragging={draggingId === layer.id}
            isDragOver={dragOverId === layer.id}
            onToggleExpand={() => toggleExpand(layer.id)}
            onDragStart={(e) => handleDragStart(e, layer.id)}
            onDragOver={(e) => handleDragOver(e, layer.id)}
            onDrop={(e) => handleDrop(e, layer.id)}
            onDragEnd={handleDragEnd}
          />
        ))}
      </div>
    </div>
  );
}
