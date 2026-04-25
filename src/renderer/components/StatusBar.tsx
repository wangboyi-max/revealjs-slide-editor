import React from 'react';
import { Box, Typography } from '@mui/material';
import { usePresentationStore } from '../stores/presentationStore';
import { useUIStore } from '../stores/uiStore';

const StatusBar: React.FC = () => {
  const { currentSlideIndex, slides } = usePresentationStore();
  const { zoom } = useUIStore();

  const slideCount = slides.length;
  const currentSlide = currentSlideIndex + 1;

  return (
    <Box
      sx={{
        height: 24,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 2,
      }}
    >
      <Typography variant="caption" sx={{ flexGrow: 0 }}>
        就绪
      </Typography>
      <Typography variant="caption" sx={{ flexGrow: 1 }}>
        Slide {currentSlide} / {slideCount}
      </Typography>
      <Typography variant="caption" sx={{ flexGrow: 0 }}>
        {zoom}%
      </Typography>
    </Box>
  );
};

export default StatusBar;
