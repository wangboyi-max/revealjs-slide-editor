import React from 'react';
import { Box, Paper, IconButton, Typography } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { usePresentationStore } from '../stores/presentationStore';

const SlideThumbnail: React.FC<{
  slide: { id: string; background: string };
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}> = ({ slide, index, isSelected, onClick, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        width: 120,
        height: 67.5,
        bgcolor: slide.background,
        border: isSelected ? '2px solid #2196f3' : '1px solid #e0e0e0',
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover .delete-btn': { opacity: 1 },
      }}
    >
      <Typography variant="caption" color="text.secondary">{index + 1}</Typography>
      {isSelected && (
        <IconButton
          className="delete-btn"
          size="small"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          sx={{ position: 'absolute', top: 2, right: 2, opacity: 0.7, '&:hover': { opacity: 1 } }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Paper>
  );
};

const SlideList: React.FC = () => {
  const { slides, currentSlideIndex, addSlide, deleteSlide, selectSlide } = usePresentationStore();

  return (
    <Box sx={{ width: 160, bgcolor: '#fafafa', borderRight: '1px solid #e0e0e0', p: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">幻灯片</Typography>
        <IconButton size="small" onClick={addSlide}>
          <AddIcon />
        </IconButton>
      </Box>
      <SortableContext items={slides.map(s => s.id)} strategy={verticalListSortingStrategy}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto' }}>
          {slides.map((slide, index) => (
            <SlideThumbnail
              key={slide.id}
              slide={slide}
              index={index}
              isSelected={index === currentSlideIndex}
              onClick={() => selectSlide(index)}
              onDelete={() => deleteSlide(slide.id)}
            />
          ))}
        </Box>
      </SortableContext>
    </Box>
  );
};

export default SlideList;