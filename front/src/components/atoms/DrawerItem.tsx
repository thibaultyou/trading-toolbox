import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import React from 'react';

interface DrawerItemProps {
  to: string;
  icon: JSX.Element;
  primary: string;
  onClose: () => void;
}

const DrawerItem: React.FC<DrawerItemProps> = ({
  to,
  icon,
  primary,
  onClose,
}) => (
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

export default DrawerItem;
