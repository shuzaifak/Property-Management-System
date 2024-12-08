import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from '../components/SideBar';
import Navbar from '../components/Layout/Navbar';
import PropertyList from '../components/PropertyList';
import PaymentForm from '../components/PaymentForm';
import PaymentHistory from '../components/PaymentHistory';
import NotFound from './NotFound';

const drawerWidth = 280;

const Dashboard = () => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Navbar */}
      <Navbar />
      
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          marginLeft: { sm: `${drawerWidth}px` },
          backgroundColor: '#f4f6f8',
          minHeight: '100vh',
          marginTop: '64px',
        }}
      >
        <Routes>
          <Route path="/" element={<PropertyList />} />
          <Route path="pay-rent" element={<PaymentForm />} />
          <Route path="payment-history" element={<PaymentHistory />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default Dashboard;