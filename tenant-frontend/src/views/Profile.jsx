import React from 'react';
import { Box } from '@mui/material';
import ProfileUpdate from '../components/ProfileUpdate';

const Profile = () => {
  return (
    <Box sx={{ p: { xs: 1, sm: 0 } }}>
      <ProfileUpdate />
    </Box>
  );
};

export default Profile;
