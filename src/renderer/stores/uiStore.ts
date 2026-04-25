import { create } from 'zustand';

export type EditorMode = 'visual' | 'code';

const ZOOM_STOPS = [25, 50, 75, 100, 125, 150, 200, 300, 400] as const;
const MIN_ZOOM = 25;
const MAX_ZOOM = 400;

function clampZoom(z: number): number {
  if (z < MIN_ZOOM) return MIN_ZOOM;
  if (z > MAX_ZOOM) return MAX_ZOOM;
  return z;
}

interface UIState {
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  spaceDown: boolean;
  isPlaying: boolean;
  isDragging: boolean;
  autoSave: boolean;
  editorMode: EditorMode;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setIsPanning: (panning: boolean) => void;
  setSpaceDown: (down: boolean) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setEditorMode: (mode: EditorMode) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  zoom: 100,
  panX: 0,
  panY: 0,
  isPanning: false,
  spaceDown: false,
  isPlaying: false,
  isDragging: false,
  autoSave: true,
  editorMode: 'visual',
  setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),
  setPan: (panX, panY) => set({ panX, panY }),
  resetView: () => set({ zoom: 100, panX: 0, panY: 0 }),
  zoomIn: () => {
    const current = get().zoom;
    const next = ZOOM_STOPS.find((stop) => stop > current);
    set({ zoom: clampZoom(next ?? MAX_ZOOM) });
  },
  zoomOut: () => {
    const current = get().zoom;
    const reversed = [...ZOOM_STOPS].reverse();
    const next = reversed.find((stop) => stop < current);
    set({ zoom: clampZoom(next ?? MIN_ZOOM) });
  },
  setIsPanning: (isPanning) => set({ isPanning }),
  setSpaceDown: (spaceDown) => set({ spaceDown }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setAutoSave: (autoSave) => set({ autoSave }),
  setEditorMode: (editorMode) => set({ editorMode }),
}));
