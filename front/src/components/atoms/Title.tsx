import React, { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface TitleProps {
  children: ReactNode;
}

const Title: React.FC<TitleProps> = ({ children }) => {
  return (
    <Typography
      variant="h5"
      gutterBottom
      align="center"
      component="div"
      sx={{ mb: 2, mt: 2 }}
    >
      {children}
    </Typography>
  );
};

export default Title;
