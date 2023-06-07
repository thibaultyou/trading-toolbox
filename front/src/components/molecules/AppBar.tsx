import React, { useState } from 'react';
import {
  Button,
  Typography,
  IconButton,
  Drawer,
  List,
  AppBar as MUIAppBar,
  Toolbar,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import DrawerItem from '../atoms/DrawerItem';
import AddAlarmIcon from '@mui/icons-material/AddAlarm';
import AccessAlarmIcon from '@mui/icons-material/AccessAlarm';

interface AppBarProps {
  variant: boolean;
  setTheme: (variant: boolean) => void;
}

const AppBar = ({ variant, setTheme }: AppBarProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerOpen = () => setDrawerOpen(true);
  const handleDrawerClose = () => setDrawerOpen(false);

  const drawerItems = [
    {
      to: '/create',
      icon: <AddAlarmIcon />,
      primary: 'Configure new setup',
    },
    {
      to: '/setups',
      icon: <AccessAlarmIcon />,
      primary: 'Pending setups',
    },
  ];

  return (
    <MUIAppBar position="static">
      <Toolbar>
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
    </MUIAppBar>
  );
};

export default AppBar;
