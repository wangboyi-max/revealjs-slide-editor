import React from 'react';
import { Box, Paper, Typography, Tooltip } from '@mui/material';
import { TextFields as TextIcon, Image as ImageIcon, AudioFile as AudioIcon, VideoFile as VideoIcon } from '@mui/icons-material';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableItemProps {
  id: string;
  type: 'text' | 'image' | 'audio' | 'video';
  icon: React.ReactNode;
  label: string;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ id, type, icon, label }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Tooltip title={label} placement="right">
      <Paper
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        sx={{
          width: 48,
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          border: '1px solid #e0e0e0',
          '&:hover': { borderColor: 'primary.main', bgcolor: '#f5f5f5' },
        }}
      >
        {icon}
      </Paper>
    </Tooltip>
  );
};

const Toolbox: React.FC = () => {
  return (
    <Box sx={{ width: 64, bgcolor: '#fafafa', borderRight: '1px solid #e0e0e0', p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem' }}>工具</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <DraggableItem
          id="toolbox-text"
          type="text"
          icon={<TextIcon color="action" />}
          label="文本"
        />
        <DraggableItem
          id="toolbox-image"
          type="image"
          icon={<ImageIcon color="action" />}
          label="图片"
        />
        <DraggableItem
          id="toolbox-audio"
          type="audio"
          icon={<AudioIcon color="action" />}
          label="音频"
        />
        <DraggableItem
          id="toolbox-video"
          type="video"
          icon={<VideoIcon color="action" />}
          label="视频"
        />
      </Box>
    </Box>
  );
};

export default Toolbox;