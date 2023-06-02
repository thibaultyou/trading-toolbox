import React from 'react';
import { Paper, Grid } from '@mui/material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)({
  padding: '20px',
  margin: '10px',
  backgroundColor: '#f5f5f5',
});

interface Props {
  children: React.ReactNode;
}

const Page: React.FC<Props> = ({ children }) => (
  <StyledPaper>
    <Grid item xs={12} sm={6} md={4}>
      {children}
    </Grid>
  </StyledPaper>
);

export default Page;
