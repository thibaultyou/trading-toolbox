import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import React from 'react';

interface MenuItemProps {
  to: string;
  icon: JSX.Element;
  primary: string;
  onClose: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ to, icon, primary, onClose }) => (
  <Link
    to={to}
    style={{ textDecoration: 'none', color: 'inherit' }}
    onClick={onClose}
  >
    <ListItem button>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={primary} />
    </ListItem>
  </Link>
);

export default MenuItem;
