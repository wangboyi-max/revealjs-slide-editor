import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Reveal from 'reveal.js';
import DOMPurify from 'dompurify';
import { usePresentationStore } from '../stores/presentationStore';
import AudioElement from './AudioElement';
import VideoElement from './VideoElement';

const Canvas: React.FC = () => {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealApi = useRef<{ slide: (index: number) => void } | null>(null);
  const { slides, currentSlideIndex, selectedElementId } = usePresentationStore();

  useEffect(() => {
    if (deckRef.current && !revealApi.current) {
      (Reveal.initialize({
        controls: false,
        progress: false,
        history: false,
        keyboard: false,
        touch: false,
        loop: true,
        autoSlide: 0,
        transition: 'none',
      }) as unknown as Promise<{ slide: (index: number) => void }>).then((api) => {
        revealApi.current = api;
        api.slide(currentSlideIndex);
      });
    }
  }, []);

  useEffect(() => {
    if (revealApi.current) {
      revealApi.current.slide(currentSlideIndex);
    }
  }, [currentSlideIndex, slides]);

  const currentSlide = slides[currentSlideIndex];

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        overflow: 'auto',
        p: 3,
      }}
    >
      <Box
        ref={deckRef}
        sx={{
          width: '100%',
          maxWidth: 960,
          aspectRatio: '16/9',
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
        <div className="reveal">
          <div className="slides">
            <section
              style={{ background: currentSlide?.background || '#ffffff' }}
              data-auto-animate=""
            >
              {currentSlide?.elements.map((element) => (
                <Box
                  key={element.id}
                  onClick={() => usePresentationStore.getState().selectElement(element.id)}
                  sx={{
                    position: 'absolute',
                    left: `${element.position.x}%`,
                    top: `${element.position.y}%`,
                    width: `${element.size.width}%`,
                    height: `${element.size.height}%`,
                    outline: selectedElementId === element.id ? '2px solid #2196f3' : 'none',
                    cursor: 'move',
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