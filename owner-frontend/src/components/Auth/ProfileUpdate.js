import React, { useContext, useState } from 'react';
import { Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const ProfileUpdate = () => {
  const { ownerUser, updateUser } = useContext(AuthContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => setSelectedFile(e.target.files[0]);

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
    } catch (err) {
      console.error('Upload failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <img src={ownerUser?.avatar || 'https://via.placeholder.com/150'} alt="Owner Avatar" width="100" height="100" />
        <Typography variant="h6">{ownerUser?.name}</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>Change Avatar</Button>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload}>Upload</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProfileUpdate;
