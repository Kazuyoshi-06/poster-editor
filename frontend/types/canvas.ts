export interface CanvasObject {
  id: string;
  type: 'image' | 'text' | 'rect' | 'shape';
  x: number;
  y: number;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

export interface Layer {
  id: string;
  name: string;
  locked: boolean;
  visible: boolean;
  objects: CanvasObject[];
}

export interface Background {
  type: 'color' | 'gradient' | 'image';
  value: string;
}

export interface CanvasData {
  version: string;
  stage: { width: number; height: number };
  background: Background;
  layers: Layer[];
}

export interface PosterProject {
  id: number;
  name: string;
  canvas_data: CanvasData;
  width: number;
  height: number;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: number;
  name: string;
  category: 'event' | 'tournament' | 'announcement' | 'generic';
  canvas_data: CanvasData;
  preview: string | null;
  created_at: string;
}

export interface UploadedAsset {
  id: number;
  file_url: string;
  original_name: string;
  asset_type: 'image' | 'background' | 'logo';
  width: number | null;
  height: number | null;
  file_size: number | null;
  uploaded_at: string;
}
