'use client';

import { useCallback, useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { exportToPNG, exportToPDF } from '@/lib/exportUtils';
import { toast } from 'sonner';
import Konva from 'konva';
import { cn } from '@/lib/utils';

interface ExportOptionsProps {
  stageRef: Konva.Stage | null;
  filename: string;
  onClose: () => void;
}

type ExportFormat = 'png' | 'pdf';
type PDFFormat = 'custom' | 'a4' | 'a3' | 'letter';

export default function ExportOptions({ stageRef, filename, onClose }: ExportOptionsProps) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(95);
  const [pixelRatio, setPixelRatio] = useState(3);
  const [pdfFormat, setPDFFormat] = useState<PDFFormat>('custom');
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    if (!stageRef) {
      toast.error('Canvas non disponible');
      return;
    }

    setExporting(true);
    try {
      if (format === 'png') {
        await exportToPNG(stageRef, filename, pixelRatio);
        toast.success(`📥 Export PNG (${pixelRatio}x) en cours…`);
      } else {
        await exportToPDF(stageRef, filename, pixelRatio, pdfFormat);
        toast.success(`📥 Export PDF en cours…`);
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export');
    } finally {
      setExporting(false);
    }
  }, [stageRef, format, filename, pixelRatio, pdfFormat, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleExport();
      if (e.key === 'Escape') onClose();
    },
    [handleExport, onClose],
  );

  const resolutionDescription = {
    1: 'Standard (96 DPI)',
    2: 'Haute (192 DPI)',
    3: 'Très haute (288 DPI)',
    4: 'Ultra (384 DPI)',
  }[pixelRatio] || `${pixelRatio}x`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center pointer-events-auto">
      <div className="bg-[#1a1a1a] border border-zinc-700 rounded-lg shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Download size={20} />
            Exporter le projet
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition"
            title="Fermer (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Format */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Format
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFormat('png')}
                className={cn(
                  'px-4 py-3 rounded-lg font-medium text-sm transition-colors border',
                  format === 'png'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600',
                )}
              >
                📷 PNG
              </button>
              <button
                onClick={() => setFormat('pdf')}
                className={cn(
                  'px-4 py-3 rounded-lg font-medium text-sm transition-colors border',
                  format === 'pdf'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600',
                )}
              >
                📄 PDF
              </button>
            </div>
          </div>

          {/* Format PDF (si PDF sélectionné) */}
          {format === 'pdf' && (
            <div className="space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Norme PDF
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPDFFormat('custom')}
                  className={cn(
                    'px-3 py-2 rounded text-xs transition-colors border',
                    pdfFormat === 'custom'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600',
                  )}
                >
                  Personnalisé
                </button>
                <button
                  onClick={() => setPDFFormat('a4')}
                  className={cn(
                    'px-3 py-2 rounded text-xs transition-colors border',
                    pdfFormat === 'a4'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600',
                  )}
                >
                  A4 (210×297mm)
                </button>
                <button
                  onClick={() => setPDFFormat('a3')}
                  className={cn(
                    'px-3 py-2 rounded text-xs transition-colors border',
                    pdfFormat === 'a3'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600',
                  )}
                >
                  A3 (297×420mm)
                </button>
                <button
                  onClick={() => setPDFFormat('letter')}
                  className={cn(
                    'px-3 py-2 rounded text-xs transition-colors border',
                    pdfFormat === 'letter'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-600',
                  )}
                >
                  Letter (8.5×11")
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                Le format "Personnalisé" adapte le PDF exactement aux dimensions de votre affiche.
              </p>
            </div>
          )}

          <Separator className="bg-zinc-700" />

          {/* Résolution / Pixel Ratio */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Résolution
            </label>
            <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">
                  {resolutionDescription}
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {pixelRatio}x
                </span>
              </div>
              <Slider
                value={[pixelRatio]}
                onValueChange={(vals) => setPixelRatio((vals as number[])[0])}
                min={1}
                max={4}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-zinc-500">
                Plus haute résolution = fichier plus volumineux, mais meilleure qualité d'impression
              </p>
            </div>
          </div>

          {/* Qualité (pour PNG/PDF) */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Qualité ({quality}%)
            </label>
            <Slider
              value={[quality]}
              onValueChange={(vals) => setQuality((vals as number[])[0])}
              min={50}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <Separator className="bg-zinc-700" />

          {/* Infos de fichier */}
          <div className="bg-zinc-900/50 border border-zinc-700 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Fichier :</span>
              <span className="text-zinc-200 font-mono">{filename}.{format}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Résolution :</span>
              <span className="text-zinc-200">{pixelRatio}x (qualité optimale)</span>
            </div>
            {format === 'pdf' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Format PDF :</span>
                <span className="text-zinc-200">
                  {pdfFormat === 'custom' ? 'Personnalisé' : pdfFormat.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-2 px-6 py-4 border-t border-zinc-700 flex-shrink-0 justify-end">
          <button
            onClick={onClose}
            disabled={exporting}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 text-zinc-200 rounded-lg text-sm font-medium transition"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            onKeyDown={handleKeyDown}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
          >
            {exporting && <Loader2 size={16} className="animate-spin" />}
            {exporting ? 'Export en cours…' : 'Exporter'}
          </button>
        </div>
      </div>
    </div>
  );
}
