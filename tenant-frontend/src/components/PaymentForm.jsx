import React, { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Paper,
  Container,
  Grid,
  styled,
} from '@mui/material';
import { CreditCard, AttachMoney } from '@mui/icons-material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../services/api';
import { toast } from 'react-toastify';

// Custom styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(4),
  background: 'linear-gradient(145deg, #f0f4f8 0%, #e6eaf3 100%)',
  boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    transform: 'rotate(45deg)',
  },
}));

const StyledCardElement = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  padding: theme.spacing(1.5),
  backgroundColor: 'white',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5),
  background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
  color: 'white',
  fontWeight: 'bold',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  },
  '&:disabled': {
    opacity: 0.7,
  },
}));

const PaymentForm = () => {
  const { user } = useContext(AuthContext);
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const formik = useFormik({
    initialValues: { amount: '' },
    validationSchema: Yup.object({
      amount: Yup.number().required('Amount is required').min(1, 'Minimum payment is $1'),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!stripe || !elements) {
        return;
      }

      setProcessing(true);

      try {
        // Step 1: Get client secret from backend
        const initiationResponse = await axios.post('/tenants/initiate-payment', {
          amount: values.amount
        });

        const { clientSecret } = initiationResponse.data;

        // Step 2: Confirm card payment
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
          toast.error(`Payment failed: ${result.error.message}`);
          setProcessing(false);
          return;
        }

        // Step 3: Confirm payment on backend
        await axios.post('/tenants/confirm-payment', {
          paymentIntentId: result.paymentIntent.id
        });

        toast.success('Payment successful!');
        resetForm();
      } catch (error) {
        toast.error('Payment processing failed');
        console.error(error);
      } finally {
        setProcessing(false);
      }
    },
  });

  if (!user?.currentLease) {
    return (
      <Container maxWidth="sm">
        <Typography 
          variant="h6" 
          color="error" 
          align="center" 
          sx={{ 
            mt: 4, 
            background: 'linear-gradient(45deg, #FF6B6B, #FFD93D)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          You do not have an active lease to make a payment.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <StyledPaper elevation={3}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12}>
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <AttachMoney sx={{ verticalAlign: 'middle', mr: 1 }} />
              Rent Payment
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <form onSubmit={formik.handleSubmit}>
              <Box mb={2}>
                <TextField
                  fullWidth
                  id="amount"
                  name="amount"
                  label="Payment Amount (USD)"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <AttachMoney />,
                  }}
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                />
              </Box>
              
              <Box mb={2}>
                <StyledCardElement>
                  <CardElement 
                    options={{
                      style: {
                        base: {
                          color: '#32325d',
                          fontFamily: '"Roboto", sans-serif',
                          fontSize: '16px',
                        },
                      },
                    }} 
                  />
                </StyledCardElement>
              </Box>
              
              <SubmitButton
                fullWidth
                type="submit"
                disabled={processing}
                startIcon={<CreditCard />}
              >
                {processing ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Pay Rent Now'
                )}
              </SubmitButton>
            </form>
          </Grid>
        </Grid>
      </StyledPaper>
    </Container>
  );
};

export default PaymentForm;