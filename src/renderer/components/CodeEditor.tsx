import React, { useCallback, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Box } from '@mui/material';
import { usePresentationStore } from '../stores/presentationStore';
import type { editor } from 'monaco-editor';

const CodeEditor: React.FC = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const { slides, currentSlideIndex } = usePresentationStore();
  const currentSlide = slides[currentSlideIndex];

  // Cleanup editor on unmount to prevent "Canceled" warnings
  useEffect(() => {
    return () => {
      editorRef.current?.dispose();
      editorRef.current = null;
    };
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (!value) return;
    try {
      const parsed = JSON.parse(value);
      if (parsed.slides && Array.isArray(parsed.slides)) {
        // This is a full presentation JSON
        usePresentationStore.setState({ slides: parsed.slides });
      }
    } catch {
      // Invalid JSON, ignore
    }
  }, []);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    // Set editor to format JSON on paste
    editor.getModel()?.updateOptions({ tabSize: 2 });
  };

  // Determine content to edit
  let editorContent = '';
  if (currentSlide) {
    // Edit the current slide's JSON
    editorContent = JSON.stringify(currentSlide, null, 2);
  } else {
    // Edit the entire presentation
    editorContent = JSON.stringify({ slides }, null, 2);
  }

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
        编辑幻灯片 {currentSlideIndex + 1} JSON
      </Box>
      <Box sx={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={editorContent}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </Box>
    </Box>
  );
};

export default CodeEditor;
