// backend/routes/leaseRoutes.js

const express = require('express');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const { getLeaseAgreementsForOwner, updateLeaseStatus, generateLeaseAgreement, downloadLeaseAgreement,getCurrentLease } = require('../controllers/leaseController');

const router = express.Router();

// Routes for lease management
router.get('/lease-agreements', protect, getLeaseAgreementsForOwner);
router.put('/update-status', protect, updateLeaseStatus);  // Protected route for updating lease status
router.post('/create-agreement/:leaseId', protect, generateLeaseAgreement);  // Protected route for generating lease agreement
router.get('/download-agreement/:leaseId', protect, downloadLeaseAgreement);  // Protected route for downloading lease agreement
router.get('/current', protect, getCurrentLease);
module.exports = router;
