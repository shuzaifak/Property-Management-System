// src/components/PaymentHistory.jsx

import React, { useContext, useEffect, useState } from 'react';
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
} from '@mui/material';
import axios from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const PaymentHistory = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user?.currentLease) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`/api/tenants/payments/history/${user.currentLease}`); // Updated endpoint
        setPayments(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching payment history:', error.response ? error.response.data : error.message);
        toast.error('Failed to load payment history.');
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  // If tenant does not have an active lease, inform them
  if (!user?.currentLease) {
    return (
      <Typography variant="h6" color="error">
        You do not have an active lease to view payment history.
      </Typography>
    );
  }

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Payment History
      </Typography>
      {payments.length === 0 ? (
        <Typography variant="body1">No payments found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label="payment history table">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Amount ($)</TableCell>
                <TableCell>Payment Method</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.amount.toFixed(2)}</TableCell>
                  <TableCell>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</TableCell>
                  <TableCell>{payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  );
};

export default PaymentHistory;
