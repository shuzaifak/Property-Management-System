import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Container,
  Grid,
  styled,
  Divider,
} from '@mui/material';
import { CreditCard, AttachMoney, AccountBalanceWallet } from '@mui/icons-material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../services/api';
import { toast } from 'react-toastify';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  padding: theme.spacing(4),
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  color: '#f1f5f9',
}));

const AmountDisplay = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: 'rgba(37, 99, 235, 0.1)',
  border: '1px solid rgba(37, 99, 235, 0.2)',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
}));

const StyledCardElement = styled(Box)(({ theme }) => ({
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  padding: theme.spacing(2),
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  marginBottom: theme.spacing(3),
}));

const PayButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.8),
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  fontWeight: 800,
  fontSize: '1rem',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.6)',
  },
  '&:disabled': {
    opacity: 0.5,
    background: '#1e293b',
  },
}));

const PaymentForm = () => {
  const { user } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await axios.get('/tenants/payments/balance');
        setBalanceData(res.data);
      } catch (err) {
        console.error('Balance fetch failed', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.currentLease) {
      fetchBalance();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !balanceData?.pendingRent || balanceData.pendingRent <= 0) {
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Get client secret
      const res = await axios.post('/tenants/initiate-payment', {
        amount: balanceData.pendingRent
      });

      const { clientSecret } = res.data;

      // Step 2: Confirm Stripe payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email
          }
        }
      });

      if (result.error) {
        toast.error(result.error.message);
        setProcessing(false);
        return;
      }

      // Step 3: Confirm on backend
      await axios.post('/tenants/confirm-payment', {
        paymentIntentId: result.paymentIntent.id
      });

      toast.success('Payment completed successfully!');
      // Refresh balance
      const newBalanceRes = await axios.get('/tenants/payments/balance');
      setBalanceData(newBalanceRes.data);
    } catch (err) {
      toast.error('Payment failed. Please try again.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user?.currentLease) {
    return (
      <Container maxWidth="sm">
        <StyledPaper sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h5" color="error" gutterBottom fontWeight={700}>
            No Active Lease
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You don't have an active lease agreement to make payments at this time.
          </Typography>
        </StyledPaper>
      </Container>
    );
  }

  const isUpToDate = balanceData?.pendingRent <= 0;

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={0}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <AccountBalanceWallet sx={{ fontSize: 48, color: '#3b82f6', mb: 1 }} />
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Pay Rent
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Complete your monthly rent payment securely via Stripe.
          </Typography>
        </Box>

        <AmountDisplay>
          <Typography variant="caption" sx={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            Total Outstanding Balance
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 900, color: '#f1f5f9', mt: 1 }}>
            ${balanceData?.pendingRent?.toFixed(2)}
          </Typography>
          {isUpToDate && (
            <Typography variant="body2" sx={{ color: '#10b981', mt: 1, fontWeight: 600 }}>
              ✓ Your account is up to date!
            </Typography>
          )}
        </AmountDisplay>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="caption" color="textSecondary">Monthly Rent</Typography>
              <Typography variant="h6" fontWeight={700}>${balanceData?.monthlyRent}</Typography>
            </Grid>
            <Grid item xs={6} sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="textSecondary">Total Paid To Date</Typography>
              <Typography variant="h6" fontWeight={700}>${balanceData?.balance}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 4, borderColor: 'rgba(255,255,255,0.05)' }} />

        <form onSubmit={handlePayment}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#cbd5e1', fontWeight: 600 }}>
            Card Information
          </Typography>
          <StyledCardElement>
            <CardElement 
              options={{
                style: {
                  base: {
                    color: '#f1f5f9',
                    fontFamily: '"Outfit", sans-serif',
                    fontSize: '16px',
                    '::placeholder': { color: 'rgba(255,255,255,0.3)' },
                  },
                  invalid: { color: '#f87171' },
                },
              }} 
            />
          </StyledCardElement>

          <PayButton
            fullWidth
            type="submit"
            disabled={processing || isUpToDate || !stripe}
            startIcon={!processing && <CreditCard />}
          >
            {processing ? (
              <CircularProgress size={24} color="inherit" />
            ) : isUpToDate ? (
              'All Paid'
            ) : (
              `Pay $${balanceData?.pendingRent?.toFixed(2)} Now`
            )}
          </PayButton>
        </form>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <AttachMoney fontSize="inherit" /> Secure encryption by Stripe
          </Typography>
        </Box>
      </StyledPaper>
    </Container>
  );
};

export default PaymentForm;