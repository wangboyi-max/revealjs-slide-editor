import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePresentationStore } from '../../../src/renderer/stores/presentationStore';

// Mock electronAPI
const mockElectronAPI = {
  file: {
    read: vi.fn().mockResolvedValue({ success: true, data: '{}' }),
    write: vi.fn().mockResolvedValue({ success: true }),
  },
  dialog: {
    showSaveDialog: vi.fn().mockResolvedValue({ canceled: false, filePath: 'test.json' }),
    showOpenDialog: vi.fn().mockResolvedValue({ canceled: false, filePaths: ['test.json'] }),
  },
  getAppDataPath: vi.fn().mockResolvedValue('/tmp'),
  export: { html: vi.fn() },
  on: vi.fn(),
  off: vi.fn(),
};

Object.defineProperty(window, 'electronAPI', { value: mockElectronAPI, writable: true });

describe('presentationStore', () => {
  beforeEach(() => {
    // Reset store state
    usePresentationStore.setState({
      slides: [{ id: '1', elements: [], background: '#ffffff', transition: 'slide' }],
      currentSlideIndex: 0,
      selectedElementId: null,
      past: [],
      future: [],
    });
  });

  it('addSlide', () => {
    const store = usePresentationStore.getState();
    store.addSlide();
    expect(usePresentationStore.getState().slides.length).toBe(2);
  });

  it('deleteSlide', () => {
    const store = usePresentationStore.getState();
    store.addSlide();
    store.deleteSlide('1');
    expect(usePresentationStore.getState().slides.length).toBe(1);
    // Should not delete last slide
    store.deleteSlide('2');
    expect(usePresentationStore.getState().slides.length).toBe(1);
  });

  it('selectSlide', () => {
    const store = usePresentationStore.getState();
    store.addSlide();
    store.selectSlide(1);
    expect(usePresentationStore.getState().currentSlideIndex).toBe(1);
  });

  it('addElement', () => {
    const store = usePresentationStore.getState();
    store.addElement('1', {
      id: 'elem1',
      type: 'text',
      content: '<p>Hello</p>',
      position: { x: 10, y: 10 },
      size: { width: 20, height: 10 },
    });
    expect(usePresentationStore.getState().slides[0].elements.length).toBe(1);
    expect(usePresentationStore.getState().slides[0].elements[0].type).toBe('text');
  });

  it('updateElement', () => {
    const store = usePresentationStore.getState();
    store.addElement('1', {
      id: 'elem1',
      type: 'text',
      content: '<p>Hello</p>',
      position: { x: 10, y: 10 },
      size: { width: 20, height: 10 },
    });
    store.updateElement('1', 'elem1', { position: { x: 20, y: 20 } });
    expect(usePresentationStore.getState().slides[0].elements[0].position.x).toBe(20);
    expect(usePresentationStore.getState().slides[0].elements[0].position.y).toBe(20);
  });

  it('selectElement', () => {
    const store = usePresentationStore.getState();
    store.selectElement('elem1');
    expect(usePresentationStore.getState().selectedElementId).toBe('elem1');
    store.selectElement(null);
    expect(usePresentationStore.getState().selectedElementId).toBe(null);
  });

  it('undo and redo', () => {
    const store = usePresentationStore.getState();
    store.addElement('1', {
      id: 'elem1',
      type: 'text',
      content: '<p>Hello</p>',
      position: { x: 10, y: 10 },
      size: { width: 20, height: 10 },
    });
    expect(usePresentationStore.getState().past.length).toBe(1);
    expect(usePresentationStore.getState().slides[0].elements.length).toBe(1);

    store.undo();
    expect(usePresentationStore.getState().slides[0].elements.length).toBe(0);
    expect(usePresentationStore.getState().future.length).toBe(1);

    store.redo();
    expect(usePresentationStore.getState().slides[0].elements.length).toBe(1);
    expect(usePresentationStore.getState().future.length).toBe(0);
  });

  it('deleteSlide keeps at least one slide', () => {
    const store = usePresentationStore.getState();
    store.deleteSlide('1');
    expect(usePresentationStore.getState().slides.length).toBe(1);
    expect(usePresentationStore.getState().slides[0].id).toBeDefined();
  });

  it('selectSlide adjusts index when deleting last slide', () => {
    const store = usePresentationStore.getState();
    store.addSlide();
    store.addSlide();
    const state = usePresentationStore.getState();
    expect(state.slides.length).toBe(3);
    // Get the actual slide id
    const slideIdToDelete = state.slides[2].id;
    // Set currentSlideIndex to 2 and delete
    usePresentationStore.setState({ currentSlideIndex: 2 });
    store.deleteSlide(slideIdToDelete);
    expect(usePresentationStore.getState().currentSlideIndex).toBe(1);
  });

  it('saveToFile', async () => {
    const store = usePresentationStore.getState();
    await store.saveToFile();
    expect(mockElectronAPI.dialog.showSaveDialog).toHaveBeenCalled();
    expect(mockElectronAPI.file.write).toHaveBeenCalled();
  });

  it('loadFromFile', async () => {
    const store = usePresentationStore.getState();
    mockElectronAPI.file.read.mockResolvedValueOnce({
      success: true,
      data: JSON.stringify({ slides: [{ id: 'loaded', elements: [], background: '#ffffff', transition: 'slide' }] }),
    });
    await store.loadFromFile();
    expect(mockElectronAPI.dialog.showOpenDialog).toHaveBeenCalled();
    expect(usePresentationStore.getState().slides[0].id).toBe('loaded');
  });

  it('saveToLocalStorage', () => {
    const store = usePresentationStore.getState();
    store.saveToLocalStorage();
    const saved = localStorage.getItem('reveal-editor-autosave');
    expect(saved).toBeTruthy();
  });

  it('loadFromLocalStorage', () => {
    const store = usePresentationStore.getState();
    const testData = { slides: [{ id: 'autosaved', elements: [], background: '#ffffff', transition: 'slide' }] };
    localStorage.setItem('reveal-editor-autosave', JSON.stringify(testData));
    store.loadFromLocalStorage();
    expect(usePresentationStore.getState().slides[0].id).toBe('autosaved');
  });
});