import { useEffect } from 'react';
import { usePresentationStore } from '../stores/presentationStore';

export function useKeyboardShortcuts() {
  const undo = usePresentationStore((state) => state.undo);
  const redo = usePresentationStore((state) => state.redo);
  const saveToFile = usePresentationStore((state) => state.saveToFile);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (isCtrlOrCmd && event.key === 's') {
        event.preventDefault();
        saveToFile();
      } else if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (isCtrlOrCmd && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveToFile]);
}
