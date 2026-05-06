import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import SideBar from '../components/SideBar';
import Navbar from '../components/Layout/Navbar';
import PropertyList from '../components/PropertyList';
import PaymentForm from '../components/PaymentForm';
import PaymentHistory from '../components/PaymentHistory';
import NotFound from './NotFound';
import LeaseAgreementsPage from './LeaseAgreementsPage';

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar handleDrawerToggle={handleDrawerToggle} />
      <SideBar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 4 },
          width: { sm: `calc(100% - 256px)` },
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
        }}
      >
        <Toolbar /> {/* Spacing for fixed AppBar */}
        <Routes>
          <Route path="/" element={<PropertyList />} />
          <Route path="pay-rent" element={<PaymentForm />} />
          <Route path="payment-history" element={<PaymentHistory />} />
          <Route path="lease-agreements" element={<LeaseAgreementsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;