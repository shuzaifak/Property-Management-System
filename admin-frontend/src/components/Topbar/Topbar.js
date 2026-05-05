import React, { useContext, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, Avatar, IconButton,
  Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, Button
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../../utils/api';

const Topbar = () => {
  const { adminUser, logout, isAuthenticated, updateUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); window.location.href = '/login'; };
  const handleOpenDialog = () => { setOpenDialog(true); handleMenuClose(); };
  const handleCloseDialog = () => { setOpenDialog(false); setSelectedFile(null); };
  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('avatar', selectedFile);
    try {
      const res = await api.post('/users/upload-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      const updatedUser = res.data.user;
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      updateUser(updatedUser);
      handleCloseDialog();
    } catch (err) {
      console.error('Upload failed', err.response?.data?.message || err.message);
    }
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
        <Typography variant="h6" flexGrow={1} sx={{
          fontWeight: 700,
          background: 'linear-gradient(90deg, #3b82f6 30%, #93c5fd 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Property Sync Admin
        </Typography>
        {isAuthenticated && adminUser && (
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{adminUser.name}</Typography>
            <IconButton onClick={handleMenuOpen}>
              <Avatar alt="Admin" src={adminUser.avatar} sx={{ width: 36, height: 36, bgcolor: '#2563eb', boxShadow: '0 0 0 2px rgba(59,130,246,0.5)' }}>
                {!adminUser.avatar && adminUser.name?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <IconButton onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.5)', '&:hover': { color: '#f87171' } }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        )}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem onClick={handleOpenDialog}>Change Profile Picture</MenuItem>
        </Menu>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle sx={{ fontWeight: 700 }}>Change Profile Picture</DialogTitle>
          <DialogContent><input type="file" accept="image/*" onChange={handleFileChange} /></DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>Cancel</Button>
            <Button onClick={handleUpload} variant="contained" color="primary">Upload</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
