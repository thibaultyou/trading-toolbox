import React from 'react';
import { Paper as MUIPaper, Grid, Fade } from '@mui/material';
import { styled } from '@mui/system';

interface PaperProps {
  children: React.ReactNode;
}

const StyledPaper = styled(MUIPaper)(() => ({
  padding: '20px',
  margin: '10px',
  backgroundColor: '#f5f5f5',
  overflow: 'hidden',
}));

const Paper: React.FC<PaperProps> = ({ children }) => (
  <Fade in={true} unmountOnExit>
    <StyledPaper>
      <Grid item xs={12} sm={6} md={4}>
        {children}
      </Grid>
    </StyledPaper>
  </Fade>
);

export default Paper;
