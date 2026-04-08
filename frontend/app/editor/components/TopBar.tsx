'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Save,
  Download,
  FileImage,
  LayoutTemplate,
  Undo2,
  Redo2,
  Loader2,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onSave: () => Promise<void>;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onOpenTemplates: () => void;
  isSaving?: boolean;
  autoSaveActive?: boolean;
}

function IconButton({
  icon,
  label,
  onClick,
  disabled,
  shortcut,
  variant = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: string;
  variant?: 'default' | 'primary';
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 h-8 rounded-md text-sm font-medium transition-all duration-200',
          'disabled:opacity-40 disabled:cursor-not-allowed active:scale-95',
          variant === 'primary'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md hover:shadow-lg hover:shadow-blue-500/30'
            : 'text-zinc-300 hover:text-white hover:bg-zinc-700 active:bg-zinc-600',
        )}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </TooltipTrigger>
      <TooltipContent className="bg-zinc-800 text-zinc-100 border-zinc-700 animate-slideInDown">
        {label}
        {shortcut && <span className="ml-2 text-zinc-400 text-xs">{shortcut}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

export default function TopBar({
  onSave,
  onExportPNG,
  onExportPDF,
  onOpenTemplates,
  isSaving = false,
  autoSaveActive = false,
}: TopBarProps) {
  const projectName = useEditorStore((s) => s.projectName);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const isDirty = useEditorStore((s) => s.isDirty);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(projectName); }, [projectName]);

  function commitName() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== projectName) setProjectName(trimmed);
    else setDraft(projectName);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') { setDraft(projectName); setEditing(false); }
  }

  return (
    <div className="flex items-center h-full px-3 gap-2">
      {/* Retour accueil */}
      <Tooltip>
        <TooltipTrigger className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex-shrink-0 p-0">
          <Link href="/" className="flex items-center justify-center w-full h-full">
            <ChevronLeft size={18} />
          </Link>
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-800 text-zinc-100 border-zinc-700">
          Retour à l&apos;accueil
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 bg-zinc-700" />

      {/* Undo / Redo */}
      <Tooltip>
        <TooltipTrigger
          onClick={undo}
          disabled={!canUndo()}
          className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 size={16} />
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-800 text-zinc-100 border-zinc-700">
          Annuler <span className="text-zinc-400 text-xs ml-1">Ctrl+Z</span>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          onClick={redo}
          disabled={!canRedo()}
          className="flex items-center justify-center h-8 w-8 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 size={16} />
        </TooltipTrigger>
        <TooltipContent className="bg-zinc-800 text-zinc-100 border-zinc-700">
          Rétablir <span className="text-zinc-400 text-xs ml-1">Ctrl+Y</span>
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-5 bg-zinc-700" />

      {/* Nom du projet */}
      <div className="flex items-center gap-2 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitName}
            onKeyDown={handleKeyDown}
            className="bg-zinc-700 text-white text-sm px-2 h-7 rounded-md border border-blue-500 outline-none w-48 min-w-0"
            autoFocus
          />
        ) : (
          <button
            onClick={() => { setEditing(true); setDraft(projectName); }}
            className="text-sm font-medium text-white hover:text-blue-300 truncate max-w-[200px] transition-colors"
            title={projectName}
          >
            {projectName}
          </button>
        )}

        {isDirty && !isSaving && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4 border-zinc-600 text-zinc-400 flex-shrink-0"
          >
            {autoSaveActive ? 'auto-save…' : 'modifié'}
          </Badge>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <IconButton
          icon={<LayoutTemplate size={15} />}
          label="Templates"
          onClick={onOpenTemplates}
        />

        <Separator orientation="vertical" className="h-5 bg-zinc-700 mx-1" />

        <IconButton
          icon={<FileImage size={15} />}
          label="Export PNG"
          onClick={onExportPNG}
          shortcut="Ctrl+Shift+E"
        />

        <IconButton
          icon={<Download size={15} />}
          label="Export PDF"
          onClick={onExportPDF}
        />

        <Separator orientation="vertical" className="h-5 bg-zinc-700 mx-1" />

        <IconButton
          icon={isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          label="Sauvegarder"
          onClick={onSave}
          disabled={isSaving || !isDirty}
          shortcut="Ctrl+S"
          variant="primary"
        />
      </div>
    </div>
  );
}
