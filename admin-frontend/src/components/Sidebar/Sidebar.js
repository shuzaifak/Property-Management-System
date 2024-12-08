import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import sidebarItems from './sidebarItems';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <Drawer 
      variant="permanent" 
      sx={{ width: drawerWidth, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', bgcolor: 'white' } }}
    >
      <Box p={2}>
        <Typography variant="h6" align="center" gutterBottom>
          Property Sync
        </Typography>
      </Box>
      <List>
        {sidebarItems.map((item) => (
          <ListItemButton key={item.name} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name}/>
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
