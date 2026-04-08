'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Copy, X,
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';
import { ColorPickerPopover } from '@/components/shared/ColorPickerPopover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import type { CanvasObject } from '@/types/canvas';
import { cn } from '@/lib/utils';

interface TextEditorProps {
  onClose: () => void;
}

// ─── Fonts disponibles (Google Fonts pré-chargées) ────────────────────────────

const GOOGLE_FONTS = [
  { name: 'Bebas Neue', fontFamily: 'Bebas Neue' },
  { name: 'Oswald', fontFamily: 'Oswald' },
  { name: 'Montserrat', fontFamily: 'Montserrat' },
  { name: 'Arial', fontFamily: 'Arial' },
  { name: 'Georgia', fontFamily: 'Georgia' },
  { name: 'Roboto', fontFamily: 'Roboto' },
  { name: 'Times New Roman', fontFamily: 'Times New Roman' },
  { name: 'Verdana', fontFamily: 'Verdana' },
];

export default function TextEditor({ onClose }: TextEditorProps) {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const getSelectedObject = useEditorStore((s) => s.getSelectedObject);
  const findObjectLayer = useEditorStore((s) => s.findObjectLayer);
  const updateObject = useEditorStore((s) => s.updateObject);

  const selectedObject = getSelectedObject() as CanvasObject | null;
  const selectedLayer = selectedObject ? findObjectLayer(selectedObject.id) : null;

  // État local pour l'édition
  const [text, setText] = useState(selectedObject?.text as string || '');
  const [fontFamily, setFontFamily] = useState((selectedObject?.fontFamily as string) || 'Bebas Neue');
  const [fontSize, setFontSize] = useState((selectedObject?.fontSize as number) || 24);
  const [fill, setFill] = useState((selectedObject?.fill as string) || '#ffffff');
  const [align, setAlign] = useState((selectedObject?.align as string) || 'left');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [shadowColor, setShadowColor] = useState((selectedObject?.shadowColor as string) || '#000000');
  const [shadowBlur, setShadowBlur] = useState((selectedObject?.shadowBlur as number) || 0);
  const [shadowOffsetX, setShadowOffsetX] = useState((selectedObject?.shadowOffsetX as number) || 0);
  const [shadowOffsetY, setShadowOffsetY] = useState((selectedObject?.shadowOffsetY as number) || 0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus sur le textarea au montage
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  // ─── Appliquer les changements ──────────────────────────────────────────────

  const applyChanges = useCallback(() => {
    if (!selectedObject || !selectedLayer) return;

    const updates: Partial<CanvasObject> = {
      text,
      fontFamily,
      fontSize,
      fill,
      align,
      shadowColor,
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY,
    };

    // Appliquer les styles (fontStyle = "bold italic underline" ou combinaisons)
    const styles: string[] = [];
    if (bold) styles.push('bold');
    if (italic) styles.push('italic');
    if (underline) styles.push('underline');
    if (styles.length > 0) {
      updates.fontStyle = styles.join(' ');
    } else {
      updates.fontStyle = 'normal';
    }

    updateObject(selectedLayer.id, selectedObject.id, updates);
    onClose();
  }, [selectedObject, selectedLayer, text, fontFamily, fontSize, fill, align, bold, italic, underline, shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY, updateObject, onClose]);

  // ─── Fermer sans sauvegarder ──────────────────────────────────────────────

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // ─── Raccourcis clavier ──────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        applyChanges();
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    },
    [applyChanges, handleClose],
  );

  if (!selectedObject || selectedObject.type !== 'text') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center pointer-events-auto">
      <div className="bg-[#1a1a1a] border border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Éditeur de texte</h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition"
            title="Fermer (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Texte
            </label>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 min-h-24 resize-none font-mono"
              placeholder="Entrez votre texte..."
            />
          </div>

          <Separator className="bg-zinc-700" />

          {/* Police */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Police
            </label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {GOOGLE_FONTS.map((font) => (
                <option key={font.fontFamily} value={font.fontFamily}>
                  {font.name}
                </option>
              ))}
            </select>
          </div>

          {/* Taille de police */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Taille ({fontSize}px)
            </label>
            <Slider
              value={[fontSize]}
              onValueChange={(vals) => setFontSize((vals as number[])[0])}
              min={8}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          {/* Styles de texte */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Styles
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setBold(!bold)}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded transition-colors',
                  bold
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                )}
                title="Gras (Ctrl+B)"
              >
                <Bold size={16} />
              </button>
              <button
                onClick={() => setItalic(!italic)}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded transition-colors',
                  italic
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                )}
                title="Italique"
              >
                <Italic size={16} />
              </button>
              <button
                onClick={() => setUnderline(!underline)}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded transition-colors',
                  underline
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                )}
                title="Souligné"
              >
                <Underline size={16} />
              </button>
            </div>
          </div>

          {/* Alignement */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Alignement
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setAlign('left')}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded transition-colors',
                  align === 'left'
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                )}
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => setAlign('center')}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded transition-colors',
                  align === 'center'
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                )}
              >
                <AlignCenter size={16} />
              </button>
              <button
                onClick={() => setAlign('right')}
                className={cn(
                  'h-8 w-8 flex items-center justify-center rounded transition-colors',
                  align === 'right'
                    ? 'bg-blue-600/30 text-blue-400'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white',
                )}
              >
                <AlignRight size={16} />
              </button>
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* Couleur du texte */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Couleur du texte
            </label>
            <div className="flex items-center gap-2">
              <ColorPickerPopover color={fill} onChange={setFill} label="Couleur" />
              <div
                className="w-24 h-9 rounded border border-zinc-600"
                style={{ backgroundColor: fill }}
              />
            </div>
          </div>

          <Separator className="bg-zinc-700" />

          {/* Ombres */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Ombre
            </label>

            {/* Couleur ombre */}
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Couleur ombre</label>
              <div className="flex items-center gap-2">
                <ColorPickerPopover color={shadowColor} onChange={setShadowColor} label="Couleur ombre" />
                <div
                  className="w-32 h-7 rounded border border-zinc-600"
                  style={{ backgroundColor: shadowColor }}
                />
              </div>
            </div>

            {/* Flou ombre */}
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Flou ({shadowBlur}px)</label>
              <Slider
                value={[shadowBlur]}
                onValueChange={(vals) => setShadowBlur((vals as number[])[0])}
                min={0}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Décalage X */}
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Décalage X ({shadowOffsetX}px)</label>
              <Slider
                value={[shadowOffsetX]}
                onValueChange={(vals) => setShadowOffsetX((vals as number[])[0])}
                min={-20}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {/* Décalage Y */}
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Décalage Y ({shadowOffsetY}px)</label>
              <Slider
                value={[shadowOffsetY]}
                onValueChange={(vals) => setShadowOffsetY((vals as number[])[0])}
                min={-20}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2 px-6 py-4 border-t border-zinc-700 flex-shrink-0 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition"
          >
            Annuler
          </button>
          <button
            onClick={applyChanges}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            title="Ctrl+Entrée"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}
