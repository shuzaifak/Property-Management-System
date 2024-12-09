import React, { useContext, useState } from 'react';
import { 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Box, 
  Avatar, 
  Container, 
  Card, 
  CardContent, 
  CardMedia,
  IconButton
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const ProfileUpdate = () => {
  const { ownerUser, updateUser } = useContext(AuthContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('avatar', selectedFile);
    
    try {
      const res = await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const updated = res.data.user;
      localStorage.setItem('ownerUser', JSON.stringify(updated));
      updateUser(updated);
      setOpenDialog(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Upload failed', err.response?.data?.message || err.message);
    }
  };

  // Subtle hover and focus animations
  const ProfileCard = styled(Card)(({ theme }) => ({
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
      transform: 'scale(1.02)',
      boxShadow: theme.shadows[12]
    }
  }));

  // Pulsate animation for edit button
  const pulsate = keyframes`
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  `;

  const EditButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      animation: `${pulsate} 1s infinite`
    }
  }));

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mt: 4 
      }}>
        <ProfileCard sx={{ 
          maxWidth: 400, 
          width: '100%', 
          position: 'relative',
          overflow: 'visible'
        }}>
          <CardMedia
            component="div"
            sx={{
              height: 200,
              position: 'relative',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <Box sx={{
              position: 'absolute',
              bottom: -50,
              left: '50%',
              transform: 'translateX(-50%)',
              border: '4px solid white',
              borderRadius: '50%',
              boxShadow: 3
            }}>
              <Avatar
                alt="Owner Avatar"
                src={ownerUser?.avatar || 'https://via.placeholder.com/150'}
                sx={{ 
                  width: 120, 
                  height: 120,
                }}
              />
              <EditButton 
                size="small" 
                onClick={() => setOpenDialog(true)}
              >
                <EditIcon fontSize="small" />
              </EditButton>
            </Box>
          </CardMedia>

          <CardContent sx={{ 
            mt: 7, 
            textAlign: 'center',
            pb: 2 
          }}>
            <Typography variant="h6" color="text.primary">
              {ownerUser?.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Profile Settings
            </Typography>
          </CardContent>
        </ProfileCard>

        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>
            Change Profile Picture
            <IconButton
              onClick={() => setOpenDialog(false)}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: 8 
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent dividers>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 2 
            }}>
              {previewUrl && (
                <Avatar
                  alt="Preview"
                  src={previewUrl}
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    mb: 2 
                  }}
                />
              )}
              
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Select Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>
              
              {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button 
              color="primary" 
              onClick={() => setOpenDialog(false)}
            >
              Cancel
            </Button>
            
            <Button 
              variant="contained" 
              onClick={handleUpload}
              disabled={!selectedFile}
              startIcon={<CloudUploadIcon />}
            >
              Upload
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProfileUpdate;