import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress
} from '@mui/material';
import axios from 'axios';
import MainLayout from '../layout/MainLayout';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';

const OwnerPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0
  });

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await axios.get('/api/properties/owner-payment-history', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        
        const paymentData = response.data;
        setPayments(paymentData);
        
        // Calculate stats
        setStats({
          totalPayments: paymentData.length,
          totalAmount: paymentData.reduce((sum, payment) => sum + payment.amount, 0)
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, []);

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
        <Typography variant="body2" align="center" sx={{ mt: 2 }}>
          Loading payment history...
        </Typography>
      </Box>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PaymentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Payments</Typography>
                    <Typography variant="h4" color="primary">
                      {stats.totalPayments}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ReceiptIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Total Amount</Typography>
                    <Typography variant="h4" color="success.main">
                      ${stats.totalAmount.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PaymentIcon sx={{ mr: 2 }} />
          Payment History
        </Typography>

        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Tenant</strong></TableCell>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Payment Method</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow 
                  key={payment._id} 
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    transition: 'background-color 0.2s',
                  }}
                >
                  <TableCell>
                    {new Date(payment.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {payment.lease.tenant.name}
                  </TableCell>
                  <TableCell>
                    {payment.lease.property.title}
                  </TableCell>
                  <TableCell>
                    <Typography color="primary" variant="body2">
                      ${payment.amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {payment.paymentMethod}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={payment.status} 
                      color={getStatusColor(payment.status)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {payments.length === 0 && (
          <Box 
            sx={{ 
              mt: 4, 
              p: 3, 
              textAlign: 'center', 
              backgroundColor: '#f5f5f5', 
              borderRadius: 2 
            }}
          >
            <Typography variant="h6" color="textSecondary">
              No payment history found.
            </Typography>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
};

export default OwnerPaymentHistory;