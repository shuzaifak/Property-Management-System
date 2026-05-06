import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from '../components/Sidebar/Sidebar';
import Topbar from '../components/Topbar/Topbar';

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box display="flex">
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box flexGrow={1} sx={{ width: { sm: `calc(100% - 256px)` } }}>
        <Topbar handleDrawerToggle={handleDrawerToggle} />
        <Toolbar />
        <Box padding={{ xs: 2, sm: 4 }} sx={{ position: 'relative', zIndex: 1 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
