'use client';

import { useCallback } from 'react';
import {
  AlignLeft, AlignCenter, AlignRight,
  Bold, Italic,
  BringToFront, SendToBack, ChevronUp, ChevronDown,
  Trash2, Copy,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ColorPickerPopover } from '@/components/shared/ColorPickerPopover';
import { useEditorStore } from '@/store/editorStore';
import { cn } from '@/lib/utils';

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 px-4 pt-3 pb-1">
      {children}
    </p>
  );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('flex items-center gap-2 px-4 py-1', className)}>{children}</div>;
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('text-xs text-zinc-400 w-16 flex-shrink-0', className)}>{children}</span>;
}

interface NumInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

function NumInput({ value, onChange, min, max, step = 1, unit }: NumInputProps) {
  return (
    <div className="flex items-center flex-1">
      <input
        type="number"
        value={Math.round(value * 10) / 10}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!isNaN(v)) onChange(v);
        }}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-l px-2 h-7 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 tabular-nums [appearance:textfield]"
      />
      {unit && (
        <span className="bg-zinc-700 border border-l-0 border-zinc-700 rounded-r px-1.5 h-7 flex items-center text-xs text-zinc-400 flex-shrink-0">
          {unit}
        </span>
      )}
    </div>
  );
}

function IconToggle({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded transition-colors',
        active
          ? 'bg-blue-600/30 text-blue-400'
          : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700',
      )}
    >
      {children}
    </button>
  );
}

// ─── Font families disponibles ────────────────────────────────────────────────

const FONT_FAMILIES = [
  'Arial', 'Bebas Neue', 'Georgia', 'Impact', 'Montserrat',
  'Oswald', 'Roboto', 'Times New Roman', 'Verdana',
];

// ─── Section communes (position, taille, rotation, opacité) ──────────────────

function CommonSection() {
  const obj = useEditorStore((s) => s.getSelectedObject());
  const layer = useEditorStore((s) => s.findObjectLayer(s.selectedObjectId ?? ''));
  const updateObject = useEditorStore((s) => s.updateObject);
  const deleteSelectedObject = useEditorStore((s) => s.deleteSelectedObject);
  const duplicateObject = useEditorStore((s) => s.duplicateObject);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);

  if (!obj || !layer) return null;

  const upd = (k: string, v: unknown) => updateObject(layer.id, obj.id, { [k]: v });

  return (
    <>
      <SectionTitle>Position & taille</SectionTitle>
      <Row>
        <Label>X</Label>
        <NumInput value={obj.x} onChange={(v) => upd('x', v)} step={1} unit="px" />
        <Label className="w-8">Y</Label>
        <NumInput value={obj.y} onChange={(v) => upd('y', v)} step={1} unit="px" />
      </Row>
      {obj.width !== undefined && (
        <Row>
          <Label>Larg.</Label>
          <NumInput value={obj.width as number} onChange={(v) => upd('width', Math.max(1, v))} min={1} unit="px" />
          {obj.height !== undefined && (
            <>
              <Label className="w-8">Haut.</Label>
              <NumInput value={obj.height as number} onChange={(v) => upd('height', Math.max(1, v))} min={1} unit="px" />
            </>
          )}
        </Row>
      )}

      <SectionTitle>Transformation</SectionTitle>
      <Row>
        <Label>Rotation</Label>
        <NumInput value={(obj.rotation as number) ?? 0} onChange={(v) => upd('rotation', v)} min={-180} max={180} unit="°" />
      </Row>
      <Row>
        <Label>Opacité</Label>
        <div className="flex-1 flex items-center gap-2">
          <Slider
            value={[Math.round(((obj.opacity as number) ?? 1) * 100)]}
            min={0} max={100} step={1}
            onValueChange={(vals) => upd('opacity', (vals as number[])[0] / 100)}
            className="flex-1"
          />
          <span className="text-xs text-zinc-400 w-8 text-right tabular-nums">
            {Math.round(((obj.opacity as number) ?? 1) * 100)}%
          </span>
        </div>
      </Row>

      <SectionTitle>Ordre</SectionTitle>
      <Row>
        <div className="flex gap-1 w-full">
          <button onClick={() => bringToFront(layer.id, obj.id)} title="Premier plan"
            className="flex-1 h-7 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 transition-colors">
            <BringToFront size={12} /> Avant
          </button>
          <button onClick={() => bringForward(layer.id, obj.id)} title="Avancer"
            className="h-7 w-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 transition-colors">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => sendBackward(layer.id, obj.id)} title="Reculer"
            className="h-7 w-7 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 transition-colors">
            <ChevronDown size={14} />
          </button>
          <button onClick={() => sendToBack(layer.id, obj.id)} title="Arrière plan"
            className="flex-1 h-7 flex items-center justify-center gap-1 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 transition-colors">
            <SendToBack size={12} /> Arr.
          </button>
        </div>
      </Row>

      <SectionTitle>Actions</SectionTitle>
      <Row>
        <button
          onClick={() => duplicateObject(layer.id, obj.id)}
          className="flex-1 h-7 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-300 transition-colors"
        >
          <Copy size={12} /> Dupliquer
        </button>
        <button
          onClick={deleteSelectedObject}
          className="flex-1 h-7 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-red-900/40 hover:text-red-400 rounded text-xs text-zinc-300 transition-colors"
        >
          <Trash2 size={12} /> Supprimer
        </button>
      </Row>
    </>
  );
}

// ─── Section Texte ────────────────────────────────────────────────────────────

function TextSection() {
  const obj = useEditorStore((s) => s.getSelectedObject());
  const layer = useEditorStore((s) => s.findObjectLayer(s.selectedObjectId ?? ''));
  const updateObject = useEditorStore((s) => s.updateObject);

  if (!obj || !layer || obj.type !== 'text') return null;

  const upd = (k: string, v: unknown) => updateObject(layer.id, obj.id, { [k]: v });
  const fontStyle = (obj.fontStyle as string) ?? 'normal';
  const isBold = fontStyle.includes('bold');
  const isItalic = fontStyle.includes('italic');

  function toggleBold() {
    if (isBold && isItalic) upd('fontStyle', 'italic');
    else if (isBold) upd('fontStyle', 'normal');
    else if (isItalic) upd('fontStyle', 'bold italic');
    else upd('fontStyle', 'bold');
  }
  function toggleItalic() {
    if (isItalic && isBold) upd('fontStyle', 'bold');
    else if (isItalic) upd('fontStyle', 'normal');
    else if (isBold) upd('fontStyle', 'bold italic');
    else upd('fontStyle', 'italic');
  }

  return (
    <>
      <SectionTitle>Texte</SectionTitle>
      <div className="px-4 py-1">
        <textarea
          value={obj.text as string}
          onChange={(e) => upd('text', e.target.value)}
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
        />
      </div>

      <Row>
        <Label>Police</Label>
        <select
          value={(obj.fontFamily as string) ?? 'Arial'}
          onChange={(e) => upd('fontFamily', e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 h-7 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </Row>

      <Row>
        <Label>Taille</Label>
        <NumInput
          value={(obj.fontSize as number) ?? 24}
          onChange={(v) => upd('fontSize', Math.max(6, v))}
          min={6} max={400} unit="px"
        />
      </Row>

      <Row>
        <Label>Style</Label>
        <div className="flex gap-1">
          <IconToggle active={isBold} onClick={toggleBold} title="Gras">
            <Bold size={13} />
          </IconToggle>
          <IconToggle active={isItalic} onClick={toggleItalic} title="Italique">
            <Italic size={13} />
          </IconToggle>
        </div>
        <div className="flex gap-1 ml-2">
          {(['left', 'center', 'right'] as const).map((align) => (
            <IconToggle
              key={align}
              active={(obj.align as string) === align}
              onClick={() => upd('align', align)}
              title={align}
            >
              {align === 'left' && <AlignLeft size={13} />}
              {align === 'center' && <AlignCenter size={13} />}
              {align === 'right' && <AlignRight size={13} />}
            </IconToggle>
          ))}
        </div>
      </Row>

      <div className="px-4 py-1">
        <ColorPickerPopover
          label="Couleur"
          color={(obj.fill as string) ?? '#ffffff'}
          onChange={(c) => upd('fill', c)}
        />
      </div>

      <SectionTitle>Ombre</SectionTitle>
      <div className="px-4 py-1">
        <ColorPickerPopover
          label="Couleur ombre"
          color={(obj.shadowColor as string) ?? '#000000'}
          onChange={(c) => upd('shadowColor', c)}
        />
      </div>
      <Row>
        <Label>Flou</Label>
        <NumInput value={(obj.shadowBlur as number) ?? 0} onChange={(v) => upd('shadowBlur', Math.max(0, v))} min={0} max={50} unit="px" />
      </Row>
      <Row>
        <Label>Décalage X</Label>
        <NumInput value={(obj.shadowOffsetX as number) ?? 0} onChange={(v) => upd('shadowOffsetX', v)} unit="px" />
      </Row>
      <Row>
        <Label>Décalage Y</Label>
        <NumInput value={(obj.shadowOffsetY as number) ?? 0} onChange={(v) => upd('shadowOffsetY', v)} unit="px" />
      </Row>
    </>
  );
}

// ─── Section Image ────────────────────────────────────────────────────────────

function ImageSection() {
  const obj = useEditorStore((s) => s.getSelectedObject());
  if (!obj || obj.type !== 'image') return null;

  return (
    <>
      <SectionTitle>Image</SectionTitle>
      <Row>
        <p className="text-xs text-zinc-500 truncate flex-1" title={obj.src as string}>
          {(obj.src as string)?.split('/').pop() ?? 'image'}
        </p>
      </Row>
    </>
  );
}

// ─── Section Forme ────────────────────────────────────────────────────────────

function RectSection() {
  const obj = useEditorStore((s) => s.getSelectedObject());
  const layer = useEditorStore((s) => s.findObjectLayer(s.selectedObjectId ?? ''));
  const updateObject = useEditorStore((s) => s.updateObject);

  if (!obj || !layer || obj.type !== 'rect') return null;
  const upd = (k: string, v: unknown) => updateObject(layer.id, obj.id, { [k]: v });

  return (
    <>
      <SectionTitle>Forme</SectionTitle>
      <div className="px-4 py-1">
        <ColorPickerPopover
          label="Couleur de remplissage"
          color={(obj.fill as string) ?? '#3b82f6'}
          onChange={(c) => upd('fill', c)}
        />
      </div>
      <div className="px-4 py-1 mt-1">
        <ColorPickerPopover
          label="Couleur de contour"
          color={(obj.stroke as string) ?? '#000000'}
          onChange={(c) => upd('stroke', c)}
        />
      </div>
      <Row>
        <Label>Contour</Label>
        <NumInput
          value={(obj.strokeWidth as number) ?? 0}
          onChange={(v) => upd('strokeWidth', Math.max(0, v))}
          min={0} max={50} unit="px"
        />
      </Row>
      <Row>
        <Label>Rayon</Label>
        <NumInput
          value={(obj.cornerRadius as number) ?? 0}
          onChange={(v) => upd('cornerRadius', Math.max(0, v))}
          min={0} max={200} unit="px"
        />
      </Row>
    </>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────

export default function PropertiesPanel() {
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const obj = useEditorStore((s) => s.getSelectedObject());

  if (!selectedObjectId || !obj) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <p className="text-xs text-zinc-500">
          Sélectionnez un objet sur le canvas pour éditer ses propriétés.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-4">
      {/* Titre type objet */}
      <div className="px-4 py-3 border-b border-zinc-800 flex-shrink-0">
        <p className="text-xs font-semibold text-zinc-300 capitalize">
          {obj.type === 'text' ? 'Texte' : obj.type === 'image' ? 'Image' : 'Forme'}
        </p>
        <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{obj.id}</p>
      </div>

      {/* Sections spécifiques au type */}
      {obj.type === 'text' && <TextSection />}
      {obj.type === 'image' && <ImageSection />}
      {obj.type === 'rect' && <RectSection />}

      <Separator className="bg-zinc-800 my-1" />

      {/* Sections communes */}
      <CommonSection />
    </div>
  );
}
