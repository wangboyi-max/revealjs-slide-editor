import { useEffect } from 'react';
import { usePresentationStore } from '../stores/presentationStore';
import { useUIStore } from '../stores/uiStore';

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      // Zoom shortcuts
      if (isCtrlOrCmd && (event.key === '=' || event.key === '+')) {
        event.preventDefault();
        useUIStore.getState().zoomIn();
        return;
      }
      if (isCtrlOrCmd && event.key === '-') {
        event.preventDefault();
        useUIStore.getState().zoomOut();
        return;
      }
      if (isCtrlOrCmd && event.key === '0') {
        event.preventDefault();
        useUIStore.getState().resetView();
        return;
      }

      // Space pan toggle (only when not editing text)
      if (event.key === ' ' && !isEditableTarget(event.target)) {
        event.preventDefault();
        if (!useUIStore.getState().spaceDown) {
          useUIStore.getState().setSpaceDown(true);
        }
        return;
      }

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

    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === ' ') {
        useUIStore.getState().setSpaceDown(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
}
