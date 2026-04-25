import React, { useEffect, useCallback, useRef } from 'react';
import { Box } from '@mui/material';
import Toolbar from './components/Toolbar';
import SlideList from './components/SlideList';
import Canvas from './components/Canvas';
import CodeEditor from './components/CodeEditor';
import PropertiesPanel from './components/PropertiesPanel';
import StatusBar from './components/StatusBar';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePresentationStore } from './stores/presentationStore';
import { useUIStore } from './stores/uiStore';

const App: React.FC = () => {
  useAutoSave();
  useKeyboardShortcuts();
  const { editorMode } = useUIStore();
  const menuListenersRef = useRef(false);

  const handleNew = useCallback(() => {
    console.log('[Menu] 收到新建命令');
    if (confirm('确定要新建演示文稿吗？当前未保存的内容将丢失。')) {
      console.log('[Menu] 用户确认新建，重置状态');
      usePresentationStore.setState({
        slides: [{ id: '1', elements: [], background: '#ffffff', transition: 'slide' }],
        currentSlideIndex: 0,
        selectedElementId: null,
        past: [],
        future: [],
      });
      console.log('[Menu] 状态已重置');
    } else {
      console.log('[Menu] 用户取消新建');
    }
  }, []);

  const handleOpen = useCallback(() => {
    usePresentationStore.getState().loadFromFile();
  }, []);

  const handleSave = useCallback(() => {
    usePresentationStore.getState().saveToFile();
  }, []);

  const handleSaveAs = useCallback(() => {
    usePresentationStore.getState().saveToFile();
  }, []);

  useEffect(() => {
    if (menuListenersRef.current) return;
    menuListenersRef.current = true;

    window.electronAPI.on('menu:new', handleNew);
    window.electronAPI.on('menu:open', handleOpen);
    window.electronAPI.on('menu:save', handleSave);
    window.electronAPI.on('menu:saveAs', handleSaveAs);

    return () => {
      window.electronAPI.off('menu:new', handleNew);
      window.electronAPI.off('menu:open', handleOpen);
      window.electronAPI.off('menu:save', handleSave);
      window.electronAPI.off('menu:saveAs', handleSaveAs);
    };
  }, [handleNew, handleOpen, handleSave, handleSaveAs]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Toolbar />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <SlideList />
        {editorMode === 'visual' ? (
          <>
            <Canvas />
            <PropertiesPanel />
          </>
        ) : (
          <>
            <Box sx={{ flex: 1, display: 'flex' }}>
              <CodeEditor />
              <Canvas />
            </Box>
          </>
        )}
      </Box>
      <StatusBar />
    </Box>
  );
};

export default App;
