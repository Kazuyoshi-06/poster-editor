import { create } from 'zustand';
import { CanvasObject, Layer, Background, CanvasData } from '@/types/canvas';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToolType = 'select' | 'text' | 'image' | 'rect' | 'background';

interface HistorySnapshot {
  layers: Layer[];
  background: Background;
}

interface EditorState {
  // Projet
  projectId: number | null;
  projectName: string;
  isDirty: boolean;

  // Canvas
  canvasWidth: number;
  canvasHeight: number;
  background: Background;
  layers: Layer[];

  // Sélection & outil
  selectedObjectId: string | null;
  activeTool: ToolType;

  // Zoom (ratio appliqué au Stage Konva)
  zoom: number;

  // Presse-papier
  clipboard: CanvasObject | null;

  // Historique undo/redo
  history: {
    past: HistorySnapshot[];
    future: HistorySnapshot[];
  };

  // ── Actions projet ──────────────────────────────────────────────────────────
  setProject: (id: number, name: string) => void;
  setProjectName: (name: string) => void;
  loadCanvasData: (data: CanvasData, projectId: number, projectName: string) => void;
  getCanvasDataForSave: () => CanvasData;
  markDirty: () => void;
  markClean: () => void;
  resetEditor: () => void;

  // ── Actions canvas ──────────────────────────────────────────────────────────
  setBackground: (bg: Background) => void;
  setCanvasSize: (width: number, height: number) => void;

  // ── Actions objets ──────────────────────────────────────────────────────────
  addObject: (layerId: string, obj: CanvasObject) => void;
  updateObject: (layerId: string, objId: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (layerId: string, objId: string) => void;
  deleteSelectedObject: () => void;
  duplicateObject: (layerId: string, objId: string) => void;
  bringForward: (layerId: string, objId: string) => void;
  sendBackward: (layerId: string, objId: string) => void;
  bringToFront: (layerId: string, objId: string) => void;
  sendToBack: (layerId: string, objId: string) => void;

  // ── Actions calques ─────────────────────────────────────────────────────────
  addLayer: (name: string) => void;
  deleteLayer: (layerId: string) => void;
  renameLayer: (layerId: string, name: string) => void;
  reorderLayers: (layers: Layer[]) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;

  // ── Sélection & outil ───────────────────────────────────────────────────────
  selectObject: (id: string | null) => void;
  setActiveTool: (tool: ToolType) => void;

  // ── Zoom ────────────────────────────────────────────────────────────────────
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;

  // ── Clipboard ───────────────────────────────────────────────────────────────
  copySelectedObject: () => void;
  pasteObject: () => void;

  // ── Historique ──────────────────────────────────────────────────────────────
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ── Helpers ─────────────────────────────────────────────────────────────────
  getSelectedObject: () => CanvasObject | null;
  findObjectLayer: (objId: string) => Layer | null;
}

// ─── État initial ──────────────────────────────────────────────────────────────

const INITIAL_LAYERS: Layer[] = [
  { id: 'layer-bg', name: 'Fond', locked: true, visible: true, objects: [] },
  { id: 'layer-content', name: 'Contenu', locked: false, visible: true, objects: [] },
];

const INITIAL_BACKGROUND: Background = { type: 'color', value: '#1a1a2e' };

const HISTORY_LIMIT = 50;

// ─── Helpers internes ─────────────────────────────────────────────────────────

function snapshot(state: { layers: Layer[]; background: Background }): HistorySnapshot {
  return {
    layers: JSON.parse(JSON.stringify(state.layers)),
    background: { ...state.background },
  };
}

function pushHistory(
  history: EditorState['history'],
  current: HistorySnapshot,
): EditorState['history'] {
  const past = [...history.past, current].slice(-HISTORY_LIMIT);
  return { past, future: [] };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorState>((set, get) => ({
  // ── État initial ─────────────────────────────────────────────────────────
  projectId: null,
  projectName: 'Nouveau projet',
  isDirty: false,
  canvasWidth: 794,
  canvasHeight: 1123,
  background: INITIAL_BACKGROUND,
  layers: INITIAL_LAYERS,
  selectedObjectId: null,
  activeTool: 'select',
  zoom: 0.75,
  clipboard: null,
  history: { past: [], future: [] },

  // ── Actions projet ────────────────────────────────────────────────────────

  setProject: (id, name) => set({ projectId: id, projectName: name }),

  setProjectName: (name) => set({ projectName: name, isDirty: true }),

  loadCanvasData: (data, projectId, projectName) =>
    set({
      projectId,
      projectName,
      layers: (data.layers && data.layers.length > 0) ? data.layers : INITIAL_LAYERS,
      background: data.background ?? INITIAL_BACKGROUND,
      canvasWidth: data.stage?.width ?? 794,
      canvasHeight: data.stage?.height ?? 1123,
      selectedObjectId: null,
      isDirty: false,
      history: { past: [], future: [] },
    }),

  getCanvasDataForSave: (): CanvasData => {
    const { layers, background, canvasWidth, canvasHeight } = get();
    return {
      version: '1.0',
      stage: { width: canvasWidth, height: canvasHeight },
      background,
      layers,
    };
  },

  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  resetEditor: () =>
    set({
      projectId: null,
      projectName: 'Nouveau projet',
      layers: INITIAL_LAYERS,
      background: INITIAL_BACKGROUND,
      selectedObjectId: null,
      isDirty: false,
      history: { past: [], future: [] },
    }),

  // ── Actions canvas ─────────────────────────────────────────────────────────

  setBackground: (bg) =>
    set((state) => ({
      history: pushHistory(state.history, snapshot(state)),
      background: bg,
      isDirty: true,
    })),

  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height, isDirty: true }),

  // ── Actions objets ─────────────────────────────────────────────────────────

  addObject: (layerId, obj) =>
    set((state) => ({
      history: pushHistory(state.history, snapshot(state)),
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, objects: [...l.objects, obj] } : l,
      ),
      selectedObjectId: obj.id,
      isDirty: true,
    })),

  updateObject: (layerId, objId, updates) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId
          ? { ...l, objects: l.objects.map((o) => (o.id === objId ? { ...o, ...updates } : o)) }
          : l,
      ),
      isDirty: true,
    })),

  deleteObject: (layerId, objId) =>
    set((state) => ({
      history: pushHistory(state.history, snapshot(state)),
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, objects: l.objects.filter((o) => o.id !== objId) } : l,
      ),
      selectedObjectId: state.selectedObjectId === objId ? null : state.selectedObjectId,
      isDirty: true,
    })),

  deleteSelectedObject: () => {
    const { selectedObjectId, findObjectLayer, deleteObject } = get();
    if (!selectedObjectId) return;
    const layer = findObjectLayer(selectedObjectId);
    if (!layer || layer.locked) return;
    deleteObject(layer.id, selectedObjectId);
  },

  duplicateObject: (layerId, objId) =>
    set((state) => {
      const layer = state.layers.find((l) => l.id === layerId);
      if (!layer) return {};
      const obj = layer.objects.find((o) => o.id === objId);
      if (!obj) return {};
      const duplicate: CanvasObject = {
        ...JSON.parse(JSON.stringify(obj)),
        id: `${obj.type}-${Date.now()}`,
        x: (obj.x as number) + 20,
        y: (obj.y as number) + 20,
      };
      return {
        history: pushHistory(state.history, snapshot(state)),
        layers: state.layers.map((l) =>
          l.id === layerId ? { ...l, objects: [...l.objects, duplicate] } : l,
        ),
        selectedObjectId: duplicate.id,
        isDirty: true,
      };
    }),

  bringForward: (layerId, objId) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        const idx = l.objects.findIndex((o) => o.id === objId);
        if (idx >= l.objects.length - 1) return l;
        const objs = [...l.objects];
        [objs[idx], objs[idx + 1]] = [objs[idx + 1], objs[idx]];
        return { ...l, objects: objs };
      }),
      isDirty: true,
    })),

  sendBackward: (layerId, objId) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        const idx = l.objects.findIndex((o) => o.id === objId);
        if (idx <= 0) return l;
        const objs = [...l.objects];
        [objs[idx], objs[idx - 1]] = [objs[idx - 1], objs[idx]];
        return { ...l, objects: objs };
      }),
      isDirty: true,
    })),

  bringToFront: (layerId, objId) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        const idx = l.objects.findIndex((o) => o.id === objId);
        if (idx < 0) return l;
        const objs = [...l.objects];
        const [item] = objs.splice(idx, 1);
        return { ...l, objects: [...objs, item] };
      }),
      isDirty: true,
    })),

  sendToBack: (layerId, objId) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== layerId) return l;
        const idx = l.objects.findIndex((o) => o.id === objId);
        if (idx < 0) return l;
        const objs = [...l.objects];
        const [item] = objs.splice(idx, 1);
        return { ...l, objects: [item, ...objs] };
      }),
      isDirty: true,
    })),

  // ── Actions calques ─────────────────────────────────────────────────────────

  addLayer: (name) =>
    set((state) => ({
      layers: [
        ...state.layers,
        { id: `layer-${Date.now()}`, name, locked: false, visible: true, objects: [] },
      ],
      isDirty: true,
    })),

  deleteLayer: (layerId) =>
    set((state) => {
      if (state.layers.length <= 1) return {};
      return {
        history: pushHistory(state.history, snapshot(state)),
        layers: state.layers.filter((l) => l.id !== layerId),
        selectedObjectId: null,
        isDirty: true,
      };
    }),

  renameLayer: (layerId, name) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, name } : l)),
      isDirty: true,
    })),

  reorderLayers: (layers) =>
    set((state) => ({
      history: pushHistory(state.history, snapshot(state)),
      layers,
      isDirty: true,
    })),

  toggleLayerVisibility: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l)),
    })),

  toggleLayerLock: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l)),
    })),

  // ── Sélection & outil ───────────────────────────────────────────────────────

  selectObject: (id) => set({ selectedObjectId: id }),

  setActiveTool: (tool) => set({ activeTool: tool, selectedObjectId: null }),

  // ── Zoom ─────────────────────────────────────────────────────────────────────

  setZoom: (zoom) => set({ zoom: Math.min(3, Math.max(0.1, zoom)) }),

  zoomIn: () => set((state) => ({ zoom: Math.min(3, Math.round((state.zoom + 0.1) * 10) / 10) })),

  zoomOut: () => set((state) => ({ zoom: Math.max(0.1, Math.round((state.zoom - 0.1) * 10) / 10) })),

  zoomReset: () => set({ zoom: 0.75 }),

  // ── Clipboard ────────────────────────────────────────────────────────────────

  copySelectedObject: () => {
    const { getSelectedObject } = get();
    const obj = getSelectedObject();
    if (!obj) return;
    set({ clipboard: JSON.parse(JSON.stringify(obj)) });
  },

  pasteObject: () => {
    const { clipboard, layers } = get();
    if (!clipboard) return;
    const targetLayer = layers.find((l) => !l.locked) ?? layers[layers.length - 1];
    const pasted: CanvasObject = {
      ...JSON.parse(JSON.stringify(clipboard)),
      id: `${clipboard.type}-${Date.now()}`,
      x: (clipboard.x as number) + 20,
      y: (clipboard.y as number) + 20,
    };
    get().addObject(targetLayer.id, pasted);
  },

  // ── Historique ────────────────────────────────────────────────────────────────

  undo: () =>
    set((state) => {
      const { past, future } = state.history;
      if (past.length === 0) return {};
      const previous = past[past.length - 1];
      const newPast = past.slice(0, -1);
      return {
        layers: previous.layers,
        background: previous.background,
        history: {
          past: newPast,
          future: [snapshot(state), ...future].slice(0, HISTORY_LIMIT),
        },
        selectedObjectId: null,
        isDirty: true,
      };
    }),

  redo: () =>
    set((state) => {
      const { past, future } = state.history;
      if (future.length === 0) return {};
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        layers: next.layers,
        background: next.background,
        history: {
          past: [...past, snapshot(state)].slice(-HISTORY_LIMIT),
          future: newFuture,
        },
        selectedObjectId: null,
        isDirty: true,
      };
    }),

  canUndo: () => get().history.past.length > 0,

  canRedo: () => get().history.future.length > 0,

  // ── Helpers ───────────────────────────────────────────────────────────────────

  getSelectedObject: () => {
    const { layers, selectedObjectId } = get();
    if (!selectedObjectId) return null;
    for (const layer of layers) {
      const obj = layer.objects.find((o) => o.id === selectedObjectId);
      if (obj) return obj;
    }
    return null;
  },

  findObjectLayer: (objId) => {
    const { layers } = get();
    return layers.find((l) => l.objects.some((o) => o.id === objId)) ?? null;
  },
}));
