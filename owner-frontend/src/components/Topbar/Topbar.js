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
  Paper,
  Divider
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  color: theme.palette.common.white,
  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  border: `3px solid ${theme.palette.common.white}`,
  boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
  }
}));

const BlurredPaper = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.common.white, 0.9),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(2),
}));

const Topbar = () => {
  const { ownerUser, logout, isAuthenticated, updateUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => { 
    logout(); 
    window.location.href = '/login'; 
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
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
      localStorage.setItem('ownerUser', JSON.stringify(updatedUser));
      updateUser(updatedUser);
      
      setOpenDialog(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  return (
    <>
      <GradientAppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" flexGrow={1} sx={{ fontWeight: 600 }}>
            Owner Panel
          </Typography>
          {isAuthenticated && ownerUser && (
            <Box 
              display="flex" 
              alignItems="center" 
              sx={{
                transition: 'all 0.5s ease',
                '&:hover': {
                  transform: 'translateX(-10px)',
                }
              }}
            >
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mr: 2, 
                  color: 'white', 
                  fontWeight: 500 
                }}
              >
                {ownerUser.name}
              </Typography>
              <IconButton onClick={handleMenuOpen}>
                <ProfileAvatar 
                  alt="Owner" 
                  src={ownerUser.avatar || 'https://via.placeholder.com/150'} 
                />
              </IconButton>
              <IconButton 
                onClick={handleLogout} 
                sx={{ color: 'white', ml: 1 }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          )}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => setOpenDialog(true)}>
              <SettingsIcon sx={{ mr: 1 }} /> Change Profile Picture
            </MenuItem>
          </Menu>
        </Toolbar>
      </GradientAppBar>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Change Profile Picture</DialogTitle>
        <Divider />
        <DialogContent>
          <BlurredPaper elevation={0}>
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              gap={2}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ width: '100%' }}
              />
              {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </BlurredPaper>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDialog(false)} 
            color="error"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            variant="contained" 
            startIcon={<CloudUploadIcon />}
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Topbar;