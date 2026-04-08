'use client';

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';

interface ColorPickerPopoverProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

export function ColorPickerPopover({ color, onChange, label, className }: ColorPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(color);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync externe → interne
  useEffect(() => { setHex(color); }, [color]);

  // Ferme si clic en dehors
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function handleHexInput(value: string) {
    setHex(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) onChange(value);
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {label && <p className="text-xs text-zinc-400 mb-1">{label}</p>}
      <div className="flex items-center gap-2">
        {/* Swatch */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="h-7 w-10 rounded border border-zinc-600 flex-shrink-0 transition-opacity hover:opacity-80"
          style={{ background: color }}
          aria-label="Choisir une couleur"
        />
        {/* Input hex */}
        <input
          value={hex}
          onChange={(e) => handleHexInput(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 h-7 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {open && (
        <div className="absolute left-0 top-10 z-50 bg-[#1a1a1a] border border-zinc-700 rounded-xl shadow-2xl p-3">
          <HexColorPicker
            color={color}
            onChange={(c) => { setHex(c); onChange(c); }}
            style={{ width: '200px' }}
          />
          <input
            value={hex}
            onChange={(e) => handleHexInput(e.target.value)}
            className="mt-2 w-full bg-zinc-800 border border-zinc-700 rounded px-2 h-7 text-xs text-zinc-100 font-mono focus:outline-none focus:border-blue-500"
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      )}
    </div>
  );
}
