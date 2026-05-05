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
  LinearProgress,
  Stack,
  Divider,
  Alert
} from '@mui/material';
import api from '../utils/api';
import MainLayout from '../layout/MainLayout';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const OwnerPaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    totalOutstanding: 0
  });

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await api.get('/properties/owner-payment-history');
        
        const { payments: paymentData, dues: dueData } = response.data;
        
        const safePayments = paymentData || [];
        const safeDues = dueData || [];

        setPayments(safePayments);
        setDues(safeDues);
        
        // Calculate stats
        setStats({
          totalPayments: safePayments.length,
          totalAmount: safePayments.reduce((sum, payment) => 
            sum + (payment.status === 'completed' ? payment.amount : 0), 0),
          totalOutstanding: safeDues.reduce((sum, due) => sum + due.outstanding, 0)
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
      <MainLayout>
        <Box sx={{ width: '100%', mt: 10, px: 3 }}>
          <LinearProgress />
          <Typography variant="body2" align="center" sx={{ mt: 2, color: '#94a3b8' }}>
            Synchronizing financial records...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* Header Section */}
        <Box mb={4}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, background: 'linear-gradient(90deg, #f1f5f9 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Financial Overview
          </Typography>
          <Typography variant="body1" sx={{ color: '#94a3b8' }}>Monitor payments, revenue, and outstanding tenant balances.</Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card className="glass-card" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2.5}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                    <PaymentIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Total Transactions</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#f1f5f9' }}>{stats.totalPayments}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="glass-card" sx={{ borderRadius: 4 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2.5}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                    <ReceiptIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Total Revenue</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#10b981' }}>${stats.totalAmount.toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card className="glass-card" sx={{ borderRadius: 4, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2.5}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <ErrorOutlineIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>Total Outstanding</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#ef4444' }}>${stats.totalOutstanding.toLocaleString()}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Outstanding Dues Section */}
        <Box mb={6}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ErrorOutlineIcon color="error" /> Outstanding Tenant Dues
          </Typography>
          <TableContainer component={Paper} className="glass-panel" elevation={0} sx={{ borderRadius: 4 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>TENANT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>PROPERTY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>MONTHLY RENT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>TOTAL PAID</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>OUTSTANDING</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dues.filter(due => due.outstanding > 0).map((due) => (
                  <TableRow key={due.leaseId} hover>
                    <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>{due.tenantName}</TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>{due.propertyTitle}</TableCell>
                    <TableCell sx={{ color: '#f1f5f9' }}>${due.monthlyRent}</TableCell>
                    <TableCell sx={{ color: '#10b981' }}>${due.totalPaid}</TableCell>
                    <TableCell sx={{ color: '#ef4444', fontWeight: 700 }}>${due.outstanding}</TableCell>
                    <TableCell>
                      <Chip label="Overdue" color="error" size="small" sx={{ fontWeight: 700, fontSize: '0.65rem' }} />
                    </TableCell>
                  </TableRow>
                ))}
                {dues.filter(due => due.outstanding > 0).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Alert severity="success" variant="outlined" sx={{ border: 'none', color: '#10b981' }}>
                        All tenants are up to date with their payments!
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 6, opacity: 0.1 }} />

        {/* Transaction History Section */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, color: '#f1f5f9' }}>Transaction History</Typography>
          <TableContainer component={Paper} className="glass-panel" elevation={0} sx={{ borderRadius: 4 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>TENANT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>PROPERTY</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>AMOUNT</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>METHOD</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment._id} hover sx={{ transition: 'background-color 0.2s' }}>
                    <TableCell sx={{ color: '#f1f5f9' }}>
                      {new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </TableCell>
                    <TableCell sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                      {payment.lease.tenant.name}
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8' }}>
                      {payment.lease.property.title}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: '#3b82f6', fontWeight: 700 }}>
                        ${payment.amount.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', textTransform: 'capitalize' }}>
                      {payment.paymentMethod}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={payment.status} 
                        color={getStatusColor(payment.status)}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {payments.length === 0 && (
            <Box sx={{ mt: 4, p: 6, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
              <Typography variant="h6" sx={{ color: '#64748b' }}>
                No transaction history recorded yet.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </MainLayout>
  );
};

export default OwnerPaymentHistory;