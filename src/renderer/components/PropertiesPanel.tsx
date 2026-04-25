import React from 'react';
import { Box, Paper, Typography, TextField, Slider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const PropertiesPanel: React.FC = () => {
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
        <TextField
          label="标题"
          variant="outlined"
          size="small"
          fullWidth
        />

        <TextField
          label="副标题"
          variant="outlined"
          size="small"
          fullWidth
        />

        <FormControl fullWidth size="small">
          <InputLabel>字体</InputLabel>
          <Select label="字体" defaultValue="Roboto">
            <MenuItem value="Roboto">Roboto</MenuItem>
            <MenuItem value="Arial">Arial</MenuItem>
            <MenuItem value="Times New Roman">Times New Roman</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="caption" color="text.secondary">
            字号
          </Typography>
          <Slider
            size="small"
            min={12}
            max={72}
            defaultValue={24}
            valueLabelDisplay="auto"
          />
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel>对齐</InputLabel>
          <Select label="对齐" defaultValue="left">
            <MenuItem value="left">左对齐</MenuItem>
            <MenuItem value="center">居中</MenuItem>
            <MenuItem value="right">右对齐</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Paper>
  );
};

export default PropertiesPanel;
