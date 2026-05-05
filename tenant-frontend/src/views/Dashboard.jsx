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
  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <SideBar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
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