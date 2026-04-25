import { useEffect, useRef } from 'react';
import { usePresentationStore } from '../stores/presentationStore';
import { useUIStore } from '../stores/uiStore';

export function useAutoSave() {
  const slides = usePresentationStore((state) => state.slides);
  const autoSave = useUIStore((state) => state.autoSave);
  const saveToLocalStorage = usePresentationStore((state) => state.saveToLocalStorage);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoSave) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [slides, autoSave, saveToLocalStorage]);
}
