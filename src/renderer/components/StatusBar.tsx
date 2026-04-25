import React from 'react';
import { Box, Typography } from '@mui/material';

const StatusBar: React.FC = () => {
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
        Slide 1 / 3
      </Typography>
      <Typography variant="caption" sx={{ flexGrow: 0 }}>
        100%
      </Typography>
    </Box>
  );
};

export default StatusBar;
