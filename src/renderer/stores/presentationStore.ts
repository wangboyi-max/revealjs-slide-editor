import { create } from 'zustand';

export interface Element {
  id: string;
  type: 'text' | 'image' | 'audio' | 'video';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  // Image specific
  src?: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  // Audio/Video specific
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export interface Slide {
  id: string;
  elements: Element[];
  background: string;
  transition: string;
  notes?: string;
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  theme: string;
}

interface HistoryState {
  slides: Slide[];
  currentSlideIndex: number;
}

interface PresentationState {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElementId: string | null;
  // undo/redo
  past: HistoryState[];
  future: HistoryState[];
  // actions
  addSlide: () => void;
  deleteSlide: (id: string) => void;
  selectSlide: (index: number) => void;
  addElement: (slideId: string, element: Element) => void;
  updateElement: (slideId: string, elementId: string, updates: Partial<Element>) => void;
  deleteElement: (slideId: string, elementId: string) => void;
  selectElement: (elementId: string | null) => void;
  undo: () => void;
  redo: () => void;
  // file operations
  saveToFile: () => Promise<void>;
  loadFromFile: () => Promise<void>;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
}

const initialState = {
  slides: [{ id: '1', elements: [], background: '#ffffff', transition: 'slide' }],
  currentSlideIndex: 0,
  selectedElementId: null,
  past: [] as HistoryState[],
  future: [] as HistoryState[],
};

function generateId(): string {
  return crypto.randomUUID();
}

function cloneSlides(slides: Slide[]): Slide[] {
  return slides.map(slide => ({
    ...slide,
    elements: slide.elements.map(elem => ({ ...elem }))
  }));
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  ...initialState,

  addSlide: () => {
    const { slides, currentSlideIndex, past } = get();
    set({
      past: [...past, { slides: cloneSlides(slides), currentSlideIndex }],
      future: [],
      slides: [...slides, { id: generateId(), elements: [], background: '#ffffff', transition: 'slide' }]
    });
  },

  deleteSlide: (id) => {
    const { slides, currentSlideIndex, past } = get();
    const newSlides = slides.filter(s => s.id !== id);
    let newIndex = currentSlideIndex;
    if (newSlides.length === 0) {
      newSlides.push({ id: generateId(), elements: [], background: '#ffffff', transition: 'slide' });
      newIndex = 0;
    } else if (currentSlideIndex >= newSlides.length) {
      newIndex = newSlides.length - 1;
    }
    set({
      past: [...past, { slides: cloneSlides(slides), currentSlideIndex }],
      future: [],
      slides: newSlides,
      currentSlideIndex: newIndex,
    });
  },

  selectSlide: (index) => set({ currentSlideIndex: index }),

  addElement: (slideId, element) => {
    const { slides, past } = get();
    set({
      past: [...past, { slides: cloneSlides(slides), currentSlideIndex: get().currentSlideIndex }],
      future: [],
      slides: slides.map(s => s.id === slideId ? { ...s, elements: [...s.elements, element] } : s)
    });
  },

  updateElement: (slideId, elementId, updates) => {
    const { slides, past } = get();
    set({
      past: [...past, { slides: cloneSlides(slides), currentSlideIndex: get().currentSlideIndex }],
      future: [],
      slides: slides.map(s => s.id === slideId ? {
        ...s, elements: s.elements.map(e => e.id === elementId ? { ...e, ...updates } : e)
      } : s)
    });
  },

  deleteElement: (slideId, elementId) => {
    const { slides, past } = get();
    set({
      past: [...past, { slides: cloneSlides(slides), currentSlideIndex: get().currentSlideIndex }],
      future: [],
      slides: slides.map(s => s.id === slideId ? {
        ...s, elements: s.elements.filter(e => e.id !== elementId)
      } : s)
    });
  },

  selectElement: (id) => set({ selectedElementId: id }),

  undo: () => {
    const { past, future, slides, currentSlideIndex } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      future: [{ slides: cloneSlides(slides), currentSlideIndex }, ...future],
      slides: previous.slides,
      currentSlideIndex: previous.currentSlideIndex,
    });
  },

  redo: () => {
    const { past, future, slides, currentSlideIndex } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, { slides: cloneSlides(slides), currentSlideIndex }],
      future: future.slice(1),
      slides: next.slides,
      currentSlideIndex: next.currentSlideIndex,
    });
  },

  saveToFile: async () => {
    const { slides } = get();
    const presentation = { id: '1', title: 'Presentation', slides, theme: 'default' };

    const result = await window.electronAPI.dialog.showSaveDialog({
      title: '保存演示文稿',
      defaultPath: 'presentation.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    });

    if (result.canceled || !result.filePath) {
      return;
    }

    const response = await window.electronAPI.file.write(result.filePath, JSON.stringify(presentation, null, 2));
    if (!response.success) {
      console.error('Failed to save:', response.error);
    }
  },

  loadFromFile: async () => {
    const result = await window.electronAPI.dialog.showOpenDialog({
      title: '打开演示文稿',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
      properties: ['openFile'],
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return;
    }

    const response = await window.electronAPI.file.read(result.filePaths[0]);
    if (!response.success || !response.data) {
      console.error('Failed to load:', response.error);
      return;
    }

    try {
      const presentation = JSON.parse(response.data);
      const { past } = get();
      set({
        past: [...past, { slides: cloneSlides(get().slides), currentSlideIndex: get().currentSlideIndex }],
        future: [],
        slides: presentation.slides || [],
        currentSlideIndex: 0,
      });
    } catch (error) {
      console.error('Failed to parse presentation file:', error);
    }
  },

  saveToLocalStorage: () => {
    const { slides } = get();
    const presentation = { id: '1', title: 'Presentation', slides, theme: 'default' };
    localStorage.setItem('reveal-editor-autosave', JSON.stringify(presentation));
  },

  loadFromLocalStorage: () => {
    const saved = localStorage.getItem('reveal-editor-autosave');
    if (!saved) return;

    try {
      const presentation = JSON.parse(saved);
      const { past } = get();
      set({
        past: [...past, { slides: cloneSlides(get().slides), currentSlideIndex: get().currentSlideIndex }],
        future: [],
        slides: presentation.slides || [],
        currentSlideIndex: 0,
      });
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },
}));