import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Hidden,
  Box,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import HomeIcon from '@mui/icons-material/Home';
import PaymentIcon from '@mui/icons-material/Payment';
import HistoryIcon from '@mui/icons-material/History';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DocumentIcon from '@mui/icons-material/Description'; // New icon for Lease Agreements
import { useState } from 'react';

const drawerWidth = 280;

// Styled components for enhanced visual design
const SidebarDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    backgroundColor: theme.palette.background.default,
    borderRight: 'none',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
}));

const StyledListItem = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(1, 0.5),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    transform: 'translateX(5px)',
  },
  ...(selected && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.contrastText,
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  margin: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
}));

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasActiveLease = user?.currentLease;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <HomeIcon />,
      path: '',
    },
    {
      text: 'Pay Rent',
      icon: <PaymentIcon />,
      path: 'pay-rent',
      condition: hasActiveLease,
    },
    {
      text: 'Payment History',
      icon: <HistoryIcon />,
      path: 'payment-history',
    },
    {
      text: 'Lease Agreements', // New menu item
      icon: <DocumentIcon />,
      path: 'lease-agreements',
      condition: hasActiveLease, // Only show if tenant has an active lease
    },
  ];
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Profile Section */}
      <ProfileSection>
        <Avatar 
          src={user?.avatar} 
          alt={user?.name} 
          sx={{ width: 56, height: 56, mr: 2 }}
        />
        <Box>
          <Typography variant="h6" noWrap>
            {user?.name || 'Tenant'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || 'tenant@example.com'}
          </Typography>
        </Box>
      </ProfileSection>

      {/* Navigation List */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => {
          if (item.condition === false) return null;
          const isSelected = location.pathname.includes(item.path);
          
          return (
            <StyledListItem
              key={item.text}
              component={Link}
              to={`/dashboard/${item.path}`}
              selected={isSelected}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          );
        })}
      </List>

      {/* Logout Option */}
      <Box sx={{ p: 2 }}>
        <StyledListItem 
          button 
          onClick={logout}
          sx={{ 
            backgroundColor: 'error.light', 
            color: 'error.contrastText' 
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </StyledListItem>
      </Box>
    </Box>
  );
  return (
    <>
      <Hidden smUp>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ 
            position: 'fixed', 
            top: 16, 
            left: 16, 
            zIndex: 1300,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark'
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        <SidebarDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: 'block', sm: 'none' },
          }}
        >
          {drawer}
        </SidebarDrawer>
      </Hidden>
      <Hidden xsDown>
        <SidebarDrawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {drawer}
        </SidebarDrawer>
      </Hidden>
    </>
  );
};

export default Sidebar;