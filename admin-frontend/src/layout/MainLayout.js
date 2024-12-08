import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';

const MainLayout = ({ children }) => {
  return (
    <Box display="flex">
      <Sidebar />
      <Box flexGrow={1} bgcolor="#f4f6f8">
        <Topbar />
        <Toolbar />
        <Box padding={3}>{children}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
