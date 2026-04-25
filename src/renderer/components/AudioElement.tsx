import React from 'react';
import { Box } from '@mui/material';

interface AudioElementProps {
  src: string;
  width?: number | string;
  height?: number | string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const AudioElement: React.FC<AudioElementProps> = ({
  src,
  width = '100%',
  height = 40,
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        borderRadius: 1,
      }}
    >
      <audio src={src} controls style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

export default AudioElement;
