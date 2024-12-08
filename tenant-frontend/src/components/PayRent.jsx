// src/components/PayRent.jsx

import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from '../services/api';
import {
  Typography,
  CircularProgress,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { toast } from 'react-toastify';

const PayRent = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [renting, setRenting] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user?.currentLease) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/tenants/payments/balance/${user.currentLease}`);
        setBalance(res.data.balance);
      } catch (error) {
        console.error('Error fetching balance:', error.response ? error.response.data : error.message);
        toast.error('Failed to fetch balance.');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  const handlePayRent = () => {
    setPaymentDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    setRenting(true);
    try {
      const res = await axios.post(`/tenants/payments/pay`, {
        leaseId: user.currentLease,
      });
      console.log('Payment response:', res.data);
      toast.success('Rent paid successfully!');
      setBalance(res.data.newBalance);
      setPaymentDialogOpen(false);
    } catch (error) {
      console.error('Error paying rent:', error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || 'Failed to pay rent.');
    } finally {
      setRenting(false);
    }
  };

  const handleCloseDialog = () => {
    setPaymentDialogOpen(false);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!user?.currentLease) {
    return (
      <Typography variant="h6" color="error">
        You do not have an active lease to make a payment.
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Pay Rent
      </Typography>
      <Typography variant="body1" gutterBottom>
        Current Balance: ${balance}
      </Typography>
      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handlePayRent}>
          Pay Rent
        </Button>
      </Box>

      {/* Payment Confirmation Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="payment-dialog-title"
      >
        <DialogTitle id="payment-dialog-title">Confirm Rent Payment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to pay ${balance} in rent?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={renting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPayment}
            color="primary"
            variant="contained"
            disabled={renting}
          >
            {renting ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PayRent;
