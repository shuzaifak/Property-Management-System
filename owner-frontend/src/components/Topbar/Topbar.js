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
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import api from '../../utils/api';

const Topbar = () => {
  const { ownerUser, logout, isAuthenticated, updateUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { 
    logout(); 
    // Navigate to login using useNavigate instead of window.location.href
    window.location.href = '/login'; 
  };
  const handleOpenDialog = () => { 
    setOpenDialog(true); 
    handleMenuClose(); 
    setUploadError('');
  };
  const handleCloseDialog = () => { 
    setOpenDialog(false); 
    setSelectedFile(null); 
    setUploadError('');
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      setIsUploading(true);
      console.log('Uploading avatar...');
      const res = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const updatedUser = res.data.user;
      console.log('Upload successful:', updatedUser);

      // Update localStorage and AuthContext
      localStorage.setItem('ownerUser', JSON.stringify(updatedUser));
      updateUser(updatedUser);

      setUploadError('');
      handleCloseDialog();
      alert('Avatar updated successfully!');
    } catch (err) {
      console.error('Upload failed:', err);
      const message = err.response?.data?.message || 'Upload failed. Please try again.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'black', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" flexGrow={1}>
            Owner Panel
          </Typography>
          {isAuthenticated && ownerUser && (
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body1">{ownerUser.name}</Typography>
              <IconButton onClick={handleMenuOpen}>
                <Avatar alt="Owner" src={ownerUser.avatar || 'https://via.placeholder.com/150'} />
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
              {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="error" disabled={isUploading}>Cancel</Button>
              <Button 
                onClick={handleUpload} 
                variant="contained" 
                color="primary" 
                disabled={isUploading}
              >
                {isUploading ? <CircularProgress size={24} /> : 'Upload'}
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default Topbar;
