import { useEffect } from 'react';
import { usePresentationStore } from '../stores/presentationStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd && event.key === 's') {
        event.preventDefault();
        usePresentationStore.getState().saveToFile();
      } else if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        usePresentationStore.getState().undo();
      } else if (isCtrlOrCmd && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        usePresentationStore.getState().redo();
      } else if (isCtrlOrCmd && event.key === 'c') {
        event.preventDefault();
        const { selectedElementId, slides, currentSlideIndex } = usePresentationStore.getState();
        if (selectedElementId) {
          const currentSlide = slides[currentSlideIndex];
          const element = currentSlide.elements.find(el => el.id === selectedElementId);
          if (element) {
            localStorage.setItem('clipboard', JSON.stringify(element));
          }
        }
      } else if (isCtrlOrCmd && event.key === 'v') {
        event.preventDefault();
        const clipboardData = localStorage.getItem('clipboard');
        if (clipboardData) {
          try {
            const element = JSON.parse(clipboardData);
            const { slides, currentSlideIndex, addElement } = usePresentationStore.getState();
            const currentSlide = slides[currentSlideIndex];
            const newElement = {
              ...element,
              id: crypto.randomUUID(),
              position: { x: element.position.x + 5, y: element.position.y + 5 },
            };
            addElement(currentSlide.id, newElement);
          } catch (e) {
            console.error('Failed to paste element:', e);
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
