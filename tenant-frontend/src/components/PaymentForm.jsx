// src/components/PaymentForm.jsx

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
} from '@mui/material';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from '../services/api';
import { toast } from 'react-toastify';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Roboto", sans-serif',
      fontSize: '16px',
    },
  },
};

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
      try {
        const res = await axios.post('/tenants/pay-rent', {
          amount: values.amount,
        });

        const paymentIntent = res.data.clientSecret;
        const paymentResult = await stripe.confirmCardPayment(paymentIntent, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name: user.name },
          },
        });

        if (paymentResult.error) {
          toast.error(`Payment failed: ${paymentResult.error.message}`);
        } else {
          toast.success('Payment successful!');
          resetForm();
        }
      } catch (error) {
        toast.error('Payment failed. Try again.');
      } finally {
        setProcessing(false);
      }
    },
  });

  if (!user?.currentLease) {
    return (
      <Typography variant="h6" color="error">
        You do not have an active lease to make a payment.
      </Typography>
    );
  }

  return (
    <Paper sx={{ padding: 4, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h5">Make a Rent Payment</Typography>
      <form onSubmit={formik.handleSubmit}>
        <Box mb={2}>
          <TextField
            fullWidth
            id="amount"
            name="amount"
            label="Amount (USD)"
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
          />
        </Box>
        <Box mb={2}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </Box>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={processing}
        >
          {processing ? <CircularProgress size={24} /> : 'Pay Rent'}
        </Button>
      </form>
    </Paper>
  );
};

export default PaymentForm;
