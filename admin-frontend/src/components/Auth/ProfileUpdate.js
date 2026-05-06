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
  Card, 
  CardContent, 
  IconButton,
  Grid,
  Divider,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CloudUpload as CloudUploadIcon, 
  Close as CloseIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  CalendarToday as DateIcon,
  CameraAlt as CameraIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  color: '#f1f5f9',
  overflow: 'hidden'
}));

const ProfileUpdate = () => {
  const { adminUser: user, updateUser } = useContext(AuthContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
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
      const updatedUser = res.data.user;
      localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      updateUser(updatedUser);
      setOpenDialog(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Upload failed', err.response?.data?.message || err.message);
    }
  };

  const InfoRow = ({ icon: Icon, label, value }) => (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
        <Icon fontSize="small" />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, display: 'block' }}>
          {label}
        </Typography>
        <Typography variant="body1" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4, px: { xs: 1, sm: 0 } }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 900, 
          mb: 1, 
          background: 'linear-gradient(90deg, #f1f5f9 0%, #94a3b8 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '1.75rem', sm: '2.5rem' } 
        }}>
          Admin Profile
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>Manage your administrator credentials and profile settings.</Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Profile Card */}
        <Grid item xs={12} md={5}>
          <GlassCard sx={{ height: '100%', position: 'relative' }}>
            <Box sx={{ 
              height: 140, 
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              position: 'relative'
            }}>
              <Box sx={{ 
                position: 'absolute', 
                bottom: -50, 
                left: '50%', 
                transform: 'translateX(-50%)',
                zIndex: 2
              }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={user?.avatar}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      border: '4px solid #080c14',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                      bgcolor: '#3b82f6',
                      fontSize: '3rem',
                      fontWeight: 800
                    }}
                  >
                    {!user?.avatar && user?.name?.[0]}
                  </Avatar>
                  <IconButton 
                    onClick={() => setOpenDialog(true)}
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      right: 0, 
                      bgcolor: '#3b82f6', 
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      '&:hover': { bgcolor: '#2563eb' }
                    }}
                    size="small"
                  >
                    <CameraIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Box>
            <CardContent sx={{ pt: 8, textAlign: 'center', pb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 0.5 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
                System Administrator
              </Typography>
              
              <Divider sx={{ my: 3, opacity: 0.1 }} />
              
              <Stack spacing={1} alignItems="center">
                <Box sx={{ px: 2, py: 0.5, borderRadius: 5, bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                  <AdminIcon fontSize="small" />
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>ROOT ACCESS</Typography>
                </Box>
              </Stack>
            </CardContent>
          </GlassCard>
        </Grid>

        {/* Details Card */}
        <Grid item xs={12} md={7}>
          <GlassCard sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f1f5f9', mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                Admin Credentials
              </Typography>
              
              <InfoRow icon={BadgeIcon} label="Full Name" value={user?.name} />
              <InfoRow icon={EmailIcon} label="Email Address" value={user?.email} />
              <InfoRow icon={BadgeIcon} label="Account Role" value="Administrator" />
              <InfoRow 
                icon={DateIcon} 
                label="Active Since" 
                value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'May 2026'} 
              />
              
              <Box sx={{ mt: 2, p: 2, borderRadius: 3, bgcolor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                <Typography variant="body2" sx={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <strong>System Info:</strong> Your account has full administrative privileges over users and properties.
                </Typography>
              </Box>
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>

      {/* Avatar Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Update Admin Avatar
          <IconButton onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.05)', py: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={previewUrl || user?.avatar}
                sx={{ width: 160, height: 160, border: '4px solid #1e293b', boxShadow: 4 }}
              />
              {previewUrl && (
                <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 800 }}>PREVIEW</Typography>
                </Box>
              )}
            </Box>
            
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: 3, px: 4, borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              Select New Image
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            
            {selectedFile && (
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: '#94a3b8' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpload} 
            disabled={!selectedFile}
            sx={{ borderRadius: 3, px: 4, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileUpdate;
