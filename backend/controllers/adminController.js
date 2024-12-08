// backend/controllers/adminController.js
const Property = require('../models/Property');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res) => {
  try {
    const propertyCount = await Property.countDocuments({});
    const tenantCount = await User.countDocuments({ role: 'tenant' });
    const payments = await Payment.find({});
    const totalPayments = payments.reduce((sum, pay) => sum + pay.amount, 0);

    res.json({
      propertyCount,
      tenantCount,
      totalPayments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.generateReport = async (req, res) => {
  // Implement logic for generating PDF/Excel reports
  // For example, send a JSON with aggregated data
  try {
    const tenants = await User.find({ role: 'tenant' });
    const properties = await Property.find({}).populate('ownerId');
    const payments = await Payment.find({}).populate('tenantId propertyId');
    res.json({ tenants, properties, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
