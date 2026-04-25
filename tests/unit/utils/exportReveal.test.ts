import { describe, it, expect } from 'vitest';
import { generateSlideHTML, generateFullHTML, DEFAULT_OPTIONS, exportToFile } from '../../../src/renderer/utils/exportReveal';
import { Presentation, Slide, Element } from '../../../src/renderer/stores/presentationStore';

describe('exportReveal', () => {
  const mockElement: Element = {
    id: 'elem1',
    type: 'text',
    content: '<p>Hello World</p>',
    position: { x: 10, y: 10 },
    size: { width: 80, height: 20 },
  };

  const mockSlide: Slide = {
    id: '1',
    background: '#ffffff',
    transition: 'slide',
    elements: [mockElement],
  };

  const mockPresentation: Presentation = {
    id: '1',
    title: 'Test Presentation',
    slides: [mockSlide],
    theme: 'black',
  };

  describe('generateSlideHTML', () => {
    it('should generate section with background', () => {
      const html = generateSlideHTML(mockSlide);
      expect(html).toContain('data-background="#ffffff"');
    });

    it('should generate section with transition', () => {
      const html = generateSlideHTML(mockSlide);
      expect(html).toContain('data-transition="slide"');
    });

    it('should generate text element with correct positioning', () => {
      const html = generateSlideHTML(mockSlide);
      expect(html).toContain('left:10%');
      expect(html).toContain('top:10%');
    });

    it('should generate text element with correct size', () => {
      const html = generateSlideHTML(mockSlide);
      expect(html).toContain('width:80%');
      expect(html).toContain('height:20%');
    });

    it('should include notes when includeNotes is true', () => {
      const slideWithNotes: Slide = { ...mockSlide, notes: 'Speaker notes here' };
      const html = generateSlideHTML(slideWithNotes, { ...DEFAULT_OPTIONS, includeNotes: true });
      expect(html).toContain('<aside class="notes">');
      expect(html).toContain('Speaker notes here');
    });

    it('should not include notes when includeNotes is false', () => {
      const slideWithNotes: Slide = { ...mockSlide, notes: 'Speaker notes here' };
      const html = generateSlideHTML(slideWithNotes, { ...DEFAULT_OPTIONS, includeNotes: false });
      expect(html).not.toContain('<aside class="notes">');
    });

    it('should handle image elements with src and alt', () => {
      const imageElement: Element = {
        id: 'img1',
        type: 'image',
        content: '',
        src: 'https://example.com/image.png',
        alt: 'Test image',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        objectFit: 'cover',
      };
      const slideWithImage: Slide = { ...mockSlide, elements: [imageElement] };
      const html = generateSlideHTML(slideWithImage);
      expect(html).toContain('src="https://example.com/image.png"');
      expect(html).toContain('alt="Test image"');
      expect(html).toContain('object-fit:cover');
    });

    it('should handle audio elements', () => {
      const audioElement: Element = {
        id: 'audio1',
        type: 'audio',
        content: '',
        src: 'https://example.com/audio.mp3',
        position: { x: 0, y: 0 },
        autoplay: true,
        loop: true,
      };
      const slideWithAudio: Slide = { ...mockSlide, elements: [audioElement] };
      const html = generateSlideHTML(slideWithAudio);
      expect(html).toContain('src="https://example.com/audio.mp3"');
      expect(html).toContain('autoplay');
      expect(html).toContain('loop');
    });

    it('should handle video elements', () => {
      const videoElement: Element = {
        id: 'video1',
        type: 'video',
        content: '',
        src: 'https://example.com/video.mp4',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 50 },
        autoplay: true,
        muted: true,
      };
      const slideWithVideo: Slide = { ...mockSlide, elements: [videoElement] };
      const html = generateSlideHTML(slideWithVideo);
      expect(html).toContain('src="https://example.com/video.mp4"');
      expect(html).toContain('autoplay');
      expect(html).toContain('muted');
    });

    it('should escape HTML in content to prevent XSS', () => {
      const maliciousElement: Element = {
        id: 'mal1',
        type: 'text',
        content: '<script>alert("xss")</script>',
        position: { x: 0, y: 0 },
        size: { width: 100, height: 100 },
      };
      const maliciousSlide: Slide = { ...mockSlide, elements: [maliciousElement] };
      const html = generateSlideHTML(maliciousSlide);
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
    });

    it('should escape HTML in notes to prevent XSS', () => {
      const maliciousNotes = '<img src=x onerror="alert(1)">';
      const slideWithMaliciousNotes: Slide = { ...mockSlide, notes: maliciousNotes };
      const html = generateSlideHTML(slideWithMaliciousNotes, { ...DEFAULT_OPTIONS, includeNotes: true });
      // The raw HTML tag should not be present
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;img');
    });
  });

  describe('generateFullHTML', () => {
    it('should generate complete HTML document', () => {
      const html = generateFullHTML(mockPresentation);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
    });

    it('should include presentation title', () => {
      const html = generateFullHTML(mockPresentation);
      expect(html).toContain('<title>Test Presentation</title>');
    });

    it('should include reveal.js CDN', () => {
      const html = generateFullHTML(mockPresentation);
      expect(html).toContain('reveal.js');
      expect(html).toContain('cdn.jsdelivr.net');
    });

    it('should include reveal.css', () => {
      const html = generateFullHTML(mockPresentation);
      expect(html).toContain('reveal.css');
    });

    it('should include theme CSS', () => {
      const html = generateFullHTML(mockPresentation, { ...DEFAULT_OPTIONS, theme: 'black' });
      expect(html).toContain('theme/black.css');
    });

    it('should initialize Reveal with defaults', () => {
      const html = generateFullHTML(mockPresentation);
      expect(html).toContain('Reveal.initialize');
      expect(html).toContain('controls: true');
      expect(html).toContain('progress: true');
      expect(html).toContain('slideNumber: true');
    });

    it('should use slide transition in initialize', () => {
      const html = generateFullHTML(mockPresentation);
      expect(html).toContain("transition: 'slide'");
    });

    it('should escape title to prevent XSS', () => {
      const maliciousPresentation: Presentation = {
        ...mockPresentation,
        title: '<img src=x onerror="alert(1)">',
      };
      const html = generateFullHTML(maliciousPresentation);
      // The raw HTML tag should not be present
      expect(html).not.toContain('<img');
      expect(html).toContain('&lt;img');
    });

    it('should include all slides', () => {
      const multiSlidePresentation: Presentation = {
        ...mockPresentation,
        slides: [
          mockSlide,
          { ...mockSlide, id: '2' },
          { ...mockSlide, id: '3' },
        ],
      };
      const html = generateFullHTML(multiSlidePresentation);
      expect(html).toContain('<section');
      // Should have 3 sections
      const sectionCount = (html.match(/<section/g) || []).length;
      expect(sectionCount).toBe(3);
    });
  });

  describe('DEFAULT_OPTIONS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_OPTIONS.standalone).toBe(true);
      expect(DEFAULT_OPTIONS.theme).toBe('black');
      expect(DEFAULT_OPTIONS.includeNotes).toBe(true);
    });
  });
});