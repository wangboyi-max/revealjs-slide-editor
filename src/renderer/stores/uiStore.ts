import { create } from 'zustand';

export type EditorMode = 'visual' | 'code';

interface UIState {
  zoom: number;
  isPlaying: boolean;
  isDragging: boolean;
  autoSave: boolean;
  editorMode: EditorMode;
  setZoom: (zoom: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setEditorMode: (mode: EditorMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  zoom: 100,
  isPlaying: false,
  isDragging: false,
  autoSave: true,
  editorMode: 'visual',
  setZoom: (zoom) => set({ zoom }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setAutoSave: (autoSave) => set({ autoSave }),
  setEditorMode: (editorMode) => set({ editorMode }),
}));
