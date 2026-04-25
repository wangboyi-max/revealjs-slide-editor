import { Slide, Element, Presentation } from '../stores/presentationStore';

export interface ExportOptions {
  standalone: boolean;
  theme: 'black' | 'white' | 'league' | 'beige' | 'dark' | 'serif' | 'simple';
  includeNotes: boolean;
}

export const DEFAULT_OPTIONS: ExportOptions = {
  standalone: true,
  theme: 'black',
  includeNotes: true,
};

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function generateElementHTML(element: Element): string {
  switch (element.type) {
    case 'text':
      return `<div style="position:absolute;left:${element.position.x}%;top:${element.position.y}%;width:${element.size.width}%;height:${element.size.height}%">${escapeHtml(element.content)}</div>`;
    case 'image':
      return `<img src="${escapeHtml(element.src || '')}" alt="${escapeHtml(element.alt || '')}" style="position:absolute;left:${element.position.x}%;top:${element.position.y}%;width:${element.size.width}%;height:${element.size.height}%;object-fit:${element.objectFit || 'cover'}" />`;
    case 'audio':
      return `<audio src="${escapeHtml(element.src || '')}" ${element.autoplay ? 'autoplay' : ''} ${element.loop ? 'loop' : ''} controls style="position:absolute;left:${element.position.x}%;top:${element.position.y}%" />`;
    case 'video':
      return `<video src="${escapeHtml(element.src || '')}" ${element.autoplay ? 'autoplay' : ''} ${element.loop ? 'loop' : ''} ${element.muted ? 'muted' : ''} controls style="position:absolute;left:${element.position.x}%;top:${element.position.y}%;width:${element.size.width}%;height:${element.size.height}%" />`;
    default:
      return '';
  }
}

export function generateSlideHTML(slide: Slide, options: ExportOptions = DEFAULT_OPTIONS): string {
  const elementsHTML = slide.elements.map(element => generateElementHTML(element)).join('\n');

  const notesHTML = options.includeNotes && slide.notes
    ? `\n      <aside class="notes">${escapeHtml(slide.notes)}</aside>`
    : '';

  return `
    <section data-background="${escapeHtml(slide.background)}" data-transition="${slide.transition || 'slide'}">
      ${elementsHTML}${notesHTML}
    </section>
  `;
}

export function generateFullHTML(presentation: Presentation, options: ExportOptions = DEFAULT_OPTIONS): string {
  const slidesHTML = presentation.slides.map(slide => generateSlideHTML(slide, options)).join('\n');

  const revealVersion = '5.1.0';
  const revealJS = `<script src="https://cdn.jsdelivr.net/npm/reveal.js@${revealVersion}/dist/reveal.js"></script>`;
  const revealCSS = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealVersion}/dist/reveal.css">`;
  const themeCSS = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@${revealVersion}/dist/theme/${options.theme}.css">`;

  const title = escapeHtml(presentation.title || 'Reveal.js Presentation');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${revealCSS}
  ${themeCSS}
  <style>
    .reveal .slides section {
      text-align: left;
    }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slidesHTML}
    </div>
  </div>
  ${revealJS}
  <script>
    Reveal.initialize({
      controls: true,
      progress: true,
      slideNumber: true,
      hash: true,
      transition: 'slide',
      width: 1280,
      height: 720,
      margin: 0,
    });
  </script>
</body>
</html>`;
}

export async function exportToFile(presentation: Presentation, options: ExportOptions = DEFAULT_OPTIONS): Promise<{ success: boolean; error?: string; filePath?: string }> {
  const html = generateFullHTML(presentation, options);

  const result = await window.electronAPI.dialog.showSaveDialog({
    title: '导出为 Reveal.js HTML',
    defaultPath: `${presentation.title || 'presentation'}.html`,
    filters: [{ name: 'HTML Files', extensions: ['html'] }],
  });

  if (result.canceled || !result.filePath) {
    return { success: false, error: 'Export cancelled' };
  }

  const writeResult = await window.electronAPI.file.write(result.filePath, html);
  if (!writeResult.success) {
    return { success: false, error: writeResult.error };
  }

  return { success: true, filePath: result.filePath };
}