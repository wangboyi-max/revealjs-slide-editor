import React from 'react';
import { AppBar, Toolbar as MuiToolbar, Typography, IconButton, Box, Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  Add as AddIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  FileDownload as ExportIcon,
  Visibility as VisualIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { usePresentationStore } from '../stores/presentationStore';
import { useUIStore, EditorMode } from '../stores/uiStore';
import { exportToFile } from '../utils/exportReveal';

const Toolbar: React.FC = () => {
  const { undo, redo, past, future } = usePresentationStore();
  const { editorMode, setEditorMode } = useUIStore();

  const handleNew = () => {
    if (window.confirm('创建新演示文稿？当前未保存的内容将丢失。')) {
      usePresentationStore.setState({
        slides: [{ id: '1', elements: [], background: '#ffffff', transition: 'slide' }],
        currentSlideIndex: 0,
        selectedElementId: null,
        past: [],
        future: [],
      });
    }
  };

  const handleSave = () => {
    usePresentationStore.getState().saveToFile();
  };

  const handleExport = async () => {
    const state = usePresentationStore.getState();
    const presentation = {
      id: '1',
      title: 'presentation',
      slides: state.slides,
      theme: 'black',
    };
    const result = await exportToFile(presentation);
    if (result.success) {
      console.log('Exported to:', result.filePath);
    } else if (result.error && result.error !== 'Export cancelled') {
      console.error('Export failed:', result.error);
    }
  };

  const handlePlay = () => {
    // Play functionality: Opens presentation in fullscreen
    // TODO: Implement proper IPC channel for playing presentations
    const state = usePresentationStore.getState();
    const presentation = {
      id: '1',
      title: 'presentation',
      slides: state.slides,
      theme: 'black',
    };
    exportToFile(presentation);
  };

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: EditorMode | null) => {
    if (newMode !== null) {
      setEditorMode(newMode);
    }
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <MuiToolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 3 }}>
          Reveal Editor
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 0 }}>
          <IconButton size="small" title="新建 (Ctrl+N)" onClick={handleNew}>
            <AddIcon />
          </IconButton>
          <IconButton size="small" title="保存 (Ctrl+S)" onClick={handleSave}>
            <SaveIcon />
          </IconButton>
          <IconButton size="small" title="导出HTML" onClick={handleExport}>
            <ExportIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, ml: 2, flexGrow: 0 }}>
          <IconButton size="small" title="撤销 (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
            <UndoIcon />
          </IconButton>
          <IconButton size="small" title="重做 (Ctrl+Y)" onClick={redo} disabled={!canRedo}>
            <RedoIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5, ml: 2, flexGrow: 0 }}>
          <ToggleButtonGroup
            value={editorMode}
            exclusive
            onChange={handleModeChange}
            size="small"
          >
            <ToggleButton value="visual" title="可视化模式">
              <VisualIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="code" title="代码模式">
              <CodeIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" startIcon={<PlayIcon />} onClick={handlePlay}>
            播放
          </Button>
        </Box>
      </MuiToolbar>
    </AppBar>
  );
};

export default Toolbar;