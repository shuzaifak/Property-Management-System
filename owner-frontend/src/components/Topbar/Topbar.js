import React, { useContext, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Avatar, IconButton,
  Menu, MenuItem
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

import { useNavigate } from 'react-router-dom';

const Topbar = ({ handleDrawerToggle }) => {
  const { ownerUser, logout, isAuthenticated } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); window.location.href = '/login'; };
  
  const handleViewProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  return (
    <AppBar 
      position="fixed"
      sx={{ 
        width: { sm: `calc(100% - 256px)` },
        ml: { sm: `256px` },
        background: 'rgba(8, 12, 20, 0.7)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: 'none'
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' }, color: '#3b82f6' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" flexGrow={1} sx={{
          fontWeight: 700,
          background: 'linear-gradient(90deg, #3b82f6 30%, #93c5fd 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          Property Sync Owner
        </Typography>
        {isAuthenticated && ownerUser && (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1" sx={{ 
              color: 'rgba(255,255,255,0.7)', 
              fontSize: '0.9rem',
              display: { xs: 'none', sm: 'block' }
            }}>
              {ownerUser.name}
            </Typography>
            <IconButton onClick={handleMenuOpen}>
              <Avatar alt="Owner" src={ownerUser.avatar} sx={{ width: 36, height: 36, bgcolor: '#2563eb', boxShadow: '0 0 0 2px rgba(59,130,246,0.5)' }}>
                {!ownerUser.avatar && ownerUser.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <IconButton onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#f87171' } }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem onClick={handleViewProfile}>My Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;