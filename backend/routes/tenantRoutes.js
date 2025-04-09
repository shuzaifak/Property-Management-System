// backend/routes/tenantRoutes.js

const express = require('express');
const router = express.Router();
const {
  getProperties,
  rentProperty,
  makePayment,
  getPaymentHistory,
  getBalance,
  addTenantToProperty,
  initiateRentPayment,
  confirmRentPayment
} = require('../controllers/tenantController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

// Fetch available properties
router.get('/properties', protect, getProperties);

// Rent a property
router.post('/rent', protect, requireRole(['tenant']), rentProperty);

// Add a tenant to a property
router.post('/addTenantToProperty', protect, requireRole(['tenant', 'admin']), addTenantToProperty);

// Make a payment
router.post('/payments/pay', protect, requireRole(['tenant']), makePayment);

// Get payment history
router.get('/payments/history/:leaseId', protect, requireRole(['tenant']), getPaymentHistory);

// Get balance
router.get('/payments/balance', protect, requireRole(['tenant']), getBalance);
// backend/routes/tenantRoutes.js
router.post('/initiate-payment', protect, requireRole(['tenant']), initiateRentPayment);
router.post('/confirm-payment', protect, requireRole(['tenant']), confirmRentPayment);
module.exports = router;
