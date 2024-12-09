import React from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Typography, 
  useTheme,
  alpha
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import sidebarItems from './sidebarItems';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <Drawer 
      variant="permanent" 
      sx={{ 
        width: drawerWidth, 
        '& .MuiDrawer-paper': { 
          width: drawerWidth, 
          boxSizing: 'border-box', 
          bgcolor: theme.palette.background.default,
          borderRight: 'none',
          boxShadow: theme.shadows[1],
        } 
      }}
    >
      <Box 
        p={3} 
        sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: theme.palette.primary.contrastText,
          textAlign: 'center',
          boxShadow: theme.shadows[2]
        }}
      >
        <Typography 
          variant="h5" 
          fontWeight="fontWeightBold" 
          sx={{ 
            letterSpacing: '0.5px',
            textTransform: 'uppercase'
          }}
        >
          Property Sync
        </Typography>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            opacity: 0.8,
            mt: 0.5
          }}
        >
          Owner Dashboard
        </Typography>
      </Box>
      <List sx={{ py: 2 }}>
        {sidebarItems.map((item) => (
          <ListItemButton 
            key={item.name} 
            onClick={() => navigate(item.path)}
            sx={{
              mx: 2,
              my: 0.5,
              borderRadius: 2,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
              ...(location.pathname === item.path && {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main
                }
              })
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 40,
                color: theme.palette.text.secondary
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name}
              primaryTypographyProps={{
                variant: 'body2',
                color: location.pathname === item.path ? 'primary' : 'textPrimary'
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;