import React from 'react';
import { Box } from '@mui/material';

interface VideoElementProps {
  src: string;
  width?: number | string;
  height?: number | string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const VideoElement: React.FC<VideoElementProps> = ({
  src,
  width = '100%',
  height = '100%',
  isSelected = false,
  onSelect,
}) => {
  return (
    <Box
      onClick={onSelect}
      sx={{
        width,
        height,
        outline: isSelected ? '2px solid #2196f3' : 'none',
        cursor: 'move',
        overflow: 'hidden',
        bgcolor: '#000',
      }}
    >
      <video
        src={src}
        controls
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </Box>
  );
};

export default VideoElement;
