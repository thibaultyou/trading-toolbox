import { useState } from 'react';
import {
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  AppBar,
  Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DrawerItem from '../atoms/MenuItem';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';
import { APP_SETUPS_CREATE_PATH, APP_SETUPS_READ_PATH } from '../../config';

interface MenuProps {
  variant: boolean;
  setTheme: (variant: boolean) => void;
}

const Menu = ({ variant, setTheme }: MenuProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const drawerItems = [
    {
      to: APP_SETUPS_CREATE_PATH,
      icon: <AddAlarmIcon />,
      primary: 'Configure new setup',
    },
    {
      to: APP_SETUPS_READ_PATH,
      icon: <AccessAlarmIcon />,
      primary: 'Pending setups',
    },
  ];

  return (
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleDrawerOpen}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="a" sx={{ flex: 1 }}>
          &nbsp;&nbsp;&nbsp;TRDNG v2
        </Typography>
        <Button
          color="inherit"
          startIcon={variant ? <DarkModeIcon /> : <LightModeIcon />}
          onClick={() => setTheme(!variant)}
        >
          {variant ? 'Dark Mode' : 'Light Mode'}
        </Button>
        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
          <List>
            {drawerItems.map((item) => (
              <DrawerItem key={item.to} {...item} onClose={handleDrawerClose} />
            ))}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

export default Menu;
