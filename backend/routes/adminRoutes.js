// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getDashboardStats, generateReport } = require('../controllers/adminController');
const { protect, requireRole } = require('../middlewares/authMiddleware');

router.get('/dashboard', protect, requireRole(['admin']), getDashboardStats);
router.get('/report', protect, requireRole(['admin']), generateReport);

module.exports = router;
