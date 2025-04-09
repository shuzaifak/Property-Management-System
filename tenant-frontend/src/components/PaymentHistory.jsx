import React, { useContext, useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  TableContainer, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Paper, 
  CircularProgress, 
  Box,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import axios from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { 
  AttachMoney as MoneyIcon, 
  Receipt as ReceiptIcon, 
  AccountBalance as BalanceIcon 
} from '@mui/icons-material';

const PaymentSummaryCard = ({ balance, totalPayments, paymentCount }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const cardStyle = {
    background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf3 100%)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
    borderRadius: '16px',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.02)'
    }
  };

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: '#2c3e50',
            fontWeight: 'bold' 
          }}
        >
          <ReceiptIcon sx={{ mr: 2, color: '#3498db' }} />
          Payment Overview
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BalanceIcon sx={{ mr: 2, color: '#2ecc71' }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                Current Balance
              </Typography>
              <Chip 
                label={formatCurrency(balance || 0)}
                color={balance >= 0 ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MoneyIcon sx={{ mr: 2, color: '#9b59b6' }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                Total Payments
              </Typography>
              <Typography variant="body1">
                {formatCurrency(totalPayments)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ReceiptIcon sx={{ mr: 2, color: '#f39c12' }} />
              <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                Number of Payments
              </Typography>
              <Chip 
                label={paymentCount} 
                color="primary" 
                size="small" 
                variant="outlined" 
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const PaymentHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaymentData = async () => {
      console.log('==== Frontend Debugging ====');
      console.log('Full User Object:', user);
      console.log('Current Lease:', user?.currentLease);

      // Comprehensive lease ID extraction with multiple fallback methods
      let leaseId = null;

      // Method 1: Direct string ID
      if (typeof user?.currentLease === 'string') {
        leaseId = user.currentLease;
      } 
      // Method 2: ObjectId-like object
      else if (user?.currentLease && typeof user.currentLease === 'object') {
        leaseId = user.currentLease._id || user.currentLease.id;
      }

      console.log('Extracted Lease ID:', leaseId);
      console.log('Lease ID Type:', typeof leaseId);

      if (!leaseId) {
        setLoading(false);
        setError('No valid lease ID found');
        toast.error('No active lease found. Please contact support.');
        return;
      }

      try {
        // Fetch payment history
        const historyResponse = await axios.get(`/tenants/payments/history/${leaseId}`);
        setPayments(historyResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('==== Full Error Details ====');
        console.error('Error Object:', error);
        console.error('Error Response:', error.response);
        
        const errorMessage = 
          error.response?.data?.message || 
          error.message ||
          'Failed to load payment history';
        
        toast.error(errorMessage);
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const tableStyle = {
    '& .MuiTableHead-root': {
      backgroundColor: '#f0f4f8',
    },
    '& .MuiTableRow-root:hover': {
      backgroundColor: '#f5f5f5',
      transition: 'background-color 0.3s ease',
    }
  };

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4, 
      background: 'linear-gradient(to right, #f9fafc 0%, #f0f4f8 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <PaymentSummaryCard 
            balance={payments.reduce((sum, payment) => sum + payment.amount, 0)}
            totalPayments={payments.reduce((sum, payment) => sum + payment.amount, 0)}
            paymentCount={payments.length}
          />
        </Grid>
        <Grid item xs={12} md={8}>
          <Card 
            sx={{
              boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <CardContent>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  color: '#2c3e50', 
                  fontWeight: 'bold',
                  borderBottom: '3px solid #3498db',
                  pb: 1
                }}
              >
                Payment History
              </Typography>
              {payments.length === 0 ? (
                <Alert 
                  severity="info" 
                  sx={{ mt: 2 }}
                >
                  No payment history found.
                </Alert>
              ) : (
                <TableContainer 
                  component={Paper} 
                  sx={tableStyle}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        {['Date', 'Amount', 'Payment Method', 'Status'].map((header) => (
                          <TableCell 
                            key={header} 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: '#2c3e50',
                              textTransform: 'uppercase'
                            }}
                          >
                            {header}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment._id}>
                          <TableCell>
                            {new Date(payment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(payment.amount)}
                          </TableCell>
                          <TableCell>
                            {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              color={
                                payment.status === 'completed' 
                                  ? 'success' 
                                  : payment.status === 'failed' 
                                  ? 'error' 
                                  : 'default'
                              }
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PaymentHistoryPage;