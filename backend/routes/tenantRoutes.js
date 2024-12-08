// backend/routes/tenantRoutes.js

const express = require('express');
const router = express.Router();
const {
  getProperties,
  rentProperty,
  makePayment,
  getPaymentHistory,
  getBalance,
} = require('../controllers/tenantController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// Fetch available properties
router.get('/properties', protect, getProperties);

// Rent a property
router.post('/rent', protect, requireRole(['tenant']), rentProperty);

// Make a payment
router.post('/payments/pay', protect, requireRole(['tenant']), makePayment);

// Get payment history
router.get('/payments/history/:leaseId', protect, requireRole(['tenant']), getPaymentHistory);

// Get balance
router.get('/payments/balance', protect, requireRole(['tenant']), getBalance);

module.exports = router;
