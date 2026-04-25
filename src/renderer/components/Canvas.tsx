import React, { useEffect, useRef, useCallback } from 'react';
import { Box } from '@mui/material';
import Reveal from 'reveal.js';
import DOMPurify from 'dompurify';
import { usePresentationStore } from '../stores/presentationStore';
import { useUIStore } from '../stores/uiStore';
import AudioElement from './AudioElement';
import VideoElement from './VideoElement';

interface RevealDeckLike {
  slide: (index: number) => void;
  layout?: () => void;
  sync?: () => void;
  destroy?: () => void;
}

interface PanStartState {
  x: number;
  y: number;
  startPanX: number;
  startPanY: number;
  active: boolean;
}

const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;

const Canvas: React.FC = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const revealApi = useRef<RevealDeckLike | null>(null);
  const panStart = useRef<PanStartState>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
    active: false,
  });

  const { slides, currentSlideIndex, selectedElementId } = usePresentationStore();
  const { zoom, panX, panY, isPanning, spaceDown } = useUIStore();

  // Reveal initialize / destroy
  useEffect(() => {
    if (!revealRef.current || revealApi.current) return;

    let cancelled = false;

    const init = async () => {
      try {
        const result = Reveal.initialize({
          embedded: true,
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          margin: 0,
          minScale: 1,
          maxScale: 1,
          controls: false,
          progress: false,
          history: false,
          keyboard: false,
          touch: false,
          loop: false,
          autoSlide: 0,
          transition: 'none',
        });
        const api = (await Promise.resolve(result)) as RevealDeckLike;
        if (cancelled) return;
        revealApi.current = api;
        const idx = usePresentationStore.getState().currentSlideIndex;
        api.slide?.(idx);
      } catch (err) {
        const msg = (err as Error)?.message || '';
        if (!msg.includes('already been initialized')) {
          console.error('Reveal init failed:', err);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      try {
        Reveal.destroy?.();
      } catch {
        /* ignore */
      }
      revealApi.current = null;
    };
  }, []);

  // Sync slide index changes
  useEffect(() => {
    revealApi.current?.slide?.(currentSlideIndex);
  }, [currentSlideIndex, slides]);

  // ResizeObserver -> reveal.layout fallback
  useEffect(() => {
    const target = viewportRef.current;
    if (!target) return;
    const ro = new ResizeObserver(() => {
      try {
        if (revealApi.current?.layout) {
          revealApi.current.layout();
        } else {
          Reveal.layout?.();
        }
      } catch {
        /* ignore */
      }
    });
    ro.observe(target);
    return () => ro.disconnect();
  }, []);

  // Pointer & wheel handlers
  const isOnElement = useCallback((target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    return target.closest('[data-element-id]') !== null;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const ui = useUIStore.getState();
      const middleButton = e.button === 1;
      const leftButton = e.button === 0;
      const onElement = isOnElement(e.target);

      const shouldPan =
        middleButton || (leftButton && (ui.spaceDown || !onElement));

      if (!shouldPan) return;
      e.preventDefault();
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: ui.panX,
        startPanY: ui.panY,
        active: true,
      };
      ui.setIsPanning(true);
      try {
        (e.target as Element).setPointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [isOnElement],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const ps = panStart.current;
    if (!ps.active) return;
    const dx = e.clientX - ps.x;
    const dy = e.clientY - ps.y;
    useUIStore.getState().setPan(ps.startPanX + dx, ps.startPanY + dy);
  }, []);

  const endPan = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!panStart.current.active) return;
    panStart.current.active = false;
    useUIStore.getState().setIsPanning(false);
    try {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  // Native non-passive wheel listener so preventDefault works in all browsers
  // (React's synthetic onWheel is passive by default and cannot preventDefault)
  useEffect(() => {
    const target = viewportRef.current;
    if (!target) return;
    const onWheelNative = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const ui = useUIStore.getState();
      if (e.deltaY < 0) ui.zoomIn();
      else ui.zoomOut();
    };
    target.addEventListener('wheel', onWheelNative, { passive: false });
    return () => target.removeEventListener('wheel', onWheelNative);
  }, []);

  const currentSlide = slides[currentSlideIndex];

  const cursor = isPanning ? 'grabbing' : spaceDown ? 'grab' : 'default';

  return (
    <Box
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      sx={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f5f5f5',
        minWidth: 0,
        cursor,
        userSelect: 'none',
      }}
    >
      <Box
        ref={deckRef}
        sx={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          position: 'absolute',
          left: '50%',
          top: '50%',
          transformOrigin: 'center center',
          transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
          transition: isPanning ? 'none' : 'transform 120ms ease-out',
          bgcolor: '#fff',
          boxShadow: '0 0 12px rgba(0,0,0,.15)',
          '& .reveal': {
            width: '100%',
            height: '100%',
          },
          '& .reveal .slides': {
            textAlign: 'left',
          },
          '& .reveal section': {
            position: 'relative',
          },
        }}
      >
        <div ref={revealRef} className="reveal" style={{ width: '100%', height: '100%' }}>
          <div className="slides">
            <section
              style={{ background: currentSlide?.background || '#ffffff' }}
              data-auto-animate=""
            >
              {currentSlide?.elements.map((element) => (
                <Box
                  key={element.id}
                  data-element-id={element.id}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => usePresentationStore.getState().selectElement(element.id)}
                  sx={{
                    position: 'absolute',
                    left: `${element.position.x}%`,
                    top: `${element.position.y}%`,
                    width: `${element.size.width}%`,
                    height: `${element.size.height}%`,
                    outline: selectedElementId === element.id ? '2px solid #2196f3' : 'none',
                    cursor: 'move',
                    pointerEvents: 'auto',
                  }}
                >
                  {element.type === 'text' && (
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(element.content) }} />
                  )}
                  {element.type === 'image' && (
                    <img src={element.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  {element.type === 'audio' && (
                    <AudioElement
                      src={element.content}
                      width="100%"
                      height="100%"
                      isSelected={selectedElementId === element.id}
                      onSelect={() => usePresentationStore.getState().selectElement(element.id)}
                    />
                  )}
                  {element.type === 'video' && (
                    <VideoElement
                      src={element.content}
                      width="100%"
                      height="100%"
                      isSelected={selectedElementId === element.id}
                      onSelect={() => usePresentationStore.getState().selectElement(element.id)}
                    />
                  )}
                </Box>
              ))}
            </section>
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default Canvas;
