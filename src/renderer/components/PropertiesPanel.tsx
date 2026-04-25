import React from 'react';
import { Box, Paper, Typography, TextField, Slider, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel } from '@mui/material';
import { usePresentationStore, Element } from '../stores/presentationStore';

const PropertiesPanel: React.FC = () => {
  const { slides, currentSlideIndex, selectedElementId, updateElement } = usePresentationStore();
  const currentSlide = slides[currentSlideIndex];
  const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId);

  if (!selectedElement) {
    return (
      <Paper
        elevation={0}
        sx={{
          width: 280,
          borderLeft: 1,
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            属性
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            选择一个元素以编辑其属性
          </Typography>
        </Box>
      </Paper>
    );
  }

  const handlePropertyChange = (property: keyof Element, value: unknown) => {
    updateElement(currentSlide.id, selectedElement.id, { [property]: value });
  };

  const handleTextContentChange = (newContent: string) => {
    updateElement(currentSlide.id, selectedElement.id, { content: newContent });
  };

  const extractFontSize = (content: string): number => {
    const fontSizeMatch = content.match(/font-size:\s*(\d+)/i);
    return fontSizeMatch ? parseInt(fontSizeMatch[1], 10) : 24;
  };

  const handleFontSizeChange = (_: Event | React.SyntheticEvent<Element, Event>, newValue: number | number[]) => {
    const size = newValue as number;
    const currentContent = selectedElement.content;
    // Try to update existing font-size style or add one
    let newContent: string;
    if (/font-size:\s*\d+/i.test(currentContent)) {
      newContent = currentContent.replace(/font-size:\s*\d+/i, `font-size: ${size}`);
    } else {
      // Add inline style to the content
      newContent = `<span style="font-size: ${size}px">${currentContent.replace(/<\/?[^>]+(>|$)/gi, '')}</span>`;
    }
    updateElement(currentSlide.id, selectedElement.id, { content: newContent });
  };

  const fontSize = selectedElement.type === 'text' ? extractFontSize(selectedElement.content) : 24;

  return (
    <Paper
      elevation={0}
      sx={{
        width: 280,
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold">
          属性
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          类型: {selectedElement.type}
        </Typography>

        {selectedElement.type === 'text' && (
          <>
            <TextField
              label="内容"
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={3}
              value={selectedElement.content.replace(/<[^>]+>/g, '')}
              onChange={(e) => handleTextContentChange(e.target.value)}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                字号: {fontSize}px
              </Typography>
              <Slider
                size="small"
                min={12}
                max={72}
                value={fontSize}
                onChange={handleFontSizeChange}
                valueLabelDisplay="auto"
              />
            </Box>
          </>
        )}

        {selectedElement.type === 'image' && (
          <>
            <TextField
              label="图片地址"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedElement.src || ''}
              onChange={(e) => handlePropertyChange('src', e.target.value)}
            />
            <TextField
              label="替代文本"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedElement.alt || ''}
              onChange={(e) => handlePropertyChange('alt', e.target.value)}
            />
            <FormControl fullWidth size="small">
              <InputLabel>填充方式</InputLabel>
              <Select
                label="填充方式"
                value={selectedElement.objectFit || 'cover'}
                onChange={(e) => handlePropertyChange('objectFit', e.target.value)}
              >
                <MenuItem value="cover">Cover</MenuItem>
                <MenuItem value="contain">Contain</MenuItem>
                <MenuItem value="fill">Fill</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        {(selectedElement.type === 'audio' || selectedElement.type === 'video') && (
          <>
            <TextField
              label="媒体地址"
              variant="outlined"
              size="small"
              fullWidth
              value={selectedElement.src || selectedElement.content || ''}
              onChange={(e) => handlePropertyChange('content', e.target.value)}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedElement.autoplay || false}
                  onChange={(e) => handlePropertyChange('autoplay', e.target.checked)}
                />
              }
              label="自动播放"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedElement.loop || false}
                  onChange={(e) => handlePropertyChange('loop', e.target.checked)}
                />
              }
              label="循环"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={selectedElement.muted || false}
                  onChange={(e) => handlePropertyChange('muted', e.target.checked)}
                />
              }
              label="静音"
            />
          </>
        )}

        <Box>
          <Typography variant="caption" color="text.secondary">
            位置
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="X (%)"
              variant="outlined"
              size="small"
              type="number"
              value={Math.round(selectedElement.position.x)}
              onChange={(e) => handlePropertyChange('position', { ...selectedElement.position, x: parseFloat(e.target.value) || 0 })}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Y (%)"
              variant="outlined"
              size="small"
              type="number"
              value={Math.round(selectedElement.position.y)}
              onChange={(e) => handlePropertyChange('position', { ...selectedElement.position, y: parseFloat(e.target.value) || 0 })}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            尺寸
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="宽度 (%)"
              variant="outlined"
              size="small"
              type="number"
              value={Math.round(selectedElement.size.width)}
              onChange={(e) => handlePropertyChange('size', { ...selectedElement.size, width: parseFloat(e.target.value) || 10 })}
              sx={{ flex: 1 }}
            />
            <TextField
              label="高度 (%)"
              variant="outlined"
              size="small"
              type="number"
              value={Math.round(selectedElement.size.height)}
              onChange={(e) => handlePropertyChange('size', { ...selectedElement.size, height: parseFloat(e.target.value) || 10 })}
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default PropertiesPanel;
