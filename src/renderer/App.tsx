import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import Toolbar from './components/Toolbar';
import SlideList from './components/SlideList';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import StatusBar from './components/StatusBar';
import { useAutoSave } from './hooks/useAutoSave';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { usePresentationStore } from './stores/presentationStore';

const App: React.FC = () => {
  useAutoSave();
  useKeyboardShortcuts();

  useEffect(() => {
    const handleNew = () => {
      if (confirm('确定要新建演示文稿吗？当前未保存的内容将丢失。')) {
        usePresentationStore.setState({
          slides: [{ id: '1', elements: [], background: '#ffffff', transition: 'slide' }],
          currentSlideIndex: 0,
          selectedElementId: null,
          past: [],
          future: [],
        });
      }
    };

    const handleOpen = () => {
      usePresentationStore.getState().loadFromFile();
    };

    const handleSave = () => {
      usePresentationStore.getState().saveToFile();
    };

    const handleSaveAs = () => {
      usePresentationStore.getState().saveToFile();
    };

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
  }, []);

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
        <Canvas />
        <PropertiesPanel />
      </Box>
      <StatusBar />
    </Box>
  );
};

export default App;
