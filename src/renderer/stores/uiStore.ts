import { create } from 'zustand';

interface UIState {
  zoom: number;
  isPlaying: boolean;
  isDragging: boolean;
  autoSave: boolean;
  setZoom: (zoom: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  zoom: 100,
  isPlaying: false,
  isDragging: false,
  autoSave: true,
  setZoom: (zoom) => set({ zoom }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsDragging: (isDragging) => set({ isDragging }),
  setAutoSave: (autoSave) => set({ autoSave }),
}));