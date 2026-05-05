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
  CircularProgress, 
  Box,
  Alert,
  Card,
  CardContent,
  Grid,
  Chip,
  styled
} from '@mui/material';
import axios from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { 
  AttachMoney as MoneyIcon, 
  Receipt as ReceiptIcon, 
  AccountBalance as BalanceIcon,
  Timer as PendingIcon
} from '@mui/icons-material';

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(15, 23, 42, 0.55)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  borderRadius: '20px',
  color: '#f1f5f9',
}));

const SummaryBox = ({ title, value, icon: Icon, color, subtext }) => (
  <GlassCard sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, color: '#f1f5f9' }}>
            {value}
          </Typography>
          {subtext && (
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
              {subtext}
            </Typography>
          )}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, background: `${color}15`, color: color }}>
          <Icon />
        </Box>
      </Box>
    </CardContent>
  </GlassCard>
);

const PaymentHistoryPage = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      let leaseId = null;
      if (typeof user?.currentLease === 'string') leaseId = user.currentLease;
      else if (user?.currentLease) leaseId = user.currentLease._id;

      if (!leaseId) {
        setLoading(false);
        return;
      }

      try {
        const [historyRes, balanceRes] = await Promise.all([
          axios.get(`/tenants/payments/history/${leaseId}`),
          axios.get('/tenants/payments/balance')
        ]);
        setPayments(historyRes.data);
        setBalanceData(balanceRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" variant="filled" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!user?.currentLease) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info" variant="filled" sx={{ borderRadius: 3 }}>
          No active lease found. Payment history will appear once a lease is assigned.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, background: 'linear-gradient(90deg, #f1f5f9 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Payment History
        </Typography>
        <Typography variant="body1" sx={{ color: '#94a3b8' }}>
          Track your transactions and outstanding balance.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox 
            title="Total Paid" 
            value={formatCurrency(balanceData?.balance)} 
            icon={MoneyIcon} 
            color="#10b981"
            subtext={`${payments.filter(p => p.status === 'completed').length} completed transactions`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox 
            title="Outstanding" 
            value={formatCurrency(balanceData?.pendingRent)} 
            icon={PendingIcon} 
            color="#ef4444"
            subtext="Unpaid dues"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox 
            title="Monthly Rent" 
            value={formatCurrency(balanceData?.monthlyRent)} 
            icon={BalanceIcon} 
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryBox 
            title="Total Due" 
            value={formatCurrency(balanceData?.totalDue)} 
            icon={ReceiptIcon} 
            color="#f59e0b"
          />
        </Grid>
      </Grid>

      <GlassCard elevation={0}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Box}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                <TableRow>
                  {['Date', 'Amount', 'Method', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ color: '#94a3b8', fontWeight: 700, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#64748b' }}>
                      No transactions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                      <TableCell sx={{ color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {new Date(payment.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#f1f5f9', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="body2" sx={{ color: '#94a3b8', textTransform: 'capitalize' }}>
                          {payment.paymentMethod}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <Chip 
                          label={payment.status}
                          size="small"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            bgcolor: 
                              payment.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 
                              payment.status === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 
                              'rgba(245, 158, 11, 0.1)',
                            color: 
                              payment.status === 'completed' ? '#10b981' : 
                              payment.status === 'failed' ? '#ef4444' : 
                              '#f59e0b',
                            border: '1px solid',
                            borderColor: 'inherit'
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </GlassCard>
    </Container>
  );
};

export default PaymentHistoryPage;