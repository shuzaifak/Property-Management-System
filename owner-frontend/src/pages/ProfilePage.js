import React from 'react';
import { Box } from '@mui/material';
import MainLayout from '../layout/MainLayout';
import ProfileUpdate from '../components/Auth/ProfileUpdate';

const ProfilePage = () => (
  <MainLayout>
    <Box sx={{ p: { xs: 2, sm: 4 } }}>
      <ProfileUpdate />
    </Box>
  </MainLayout>
);

export default ProfilePage;
