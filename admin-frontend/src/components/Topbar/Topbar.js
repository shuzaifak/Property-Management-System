// src/components/Topbar/Topbar.js
import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../../utils/api';

const Topbar = () => {
  const { adminUser, logout, isAuthenticated, updateUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      const res = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = res.data.user;
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      updateUser(updatedUser); // Update user in context
      handleCloseDialog();
    } catch (err) {
      console.error('Upload failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 1 }}>
      <Toolbar>
        <Typography variant="h6" flexGrow={1}>
          Admin Panel
        </Typography>
        {isAuthenticated && adminUser && (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1">{adminUser.name}</Typography>
            <IconButton onClick={handleMenuOpen}>
              <Avatar alt="Admin" src={adminUser.avatar || 'https://via.placeholder.com/150'} />
            </IconButton>
            <IconButton onClick={handleLogout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleOpenDialog}>Change Profile Picture</MenuItem>
        </Menu>

        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Change Profile Picture</DialogTitle>
          <DialogContent>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="error">Cancel</Button>
            <Button onClick={handleUpload} variant="contained" color="primary">Upload</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
