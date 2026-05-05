// backend/controllers/adminController.js
const Property = require('../models/Property');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res) => {
  try {
    const propertyCount = await Property.countDocuments({});
    const tenantCount = await User.countDocuments({ role: 'tenant' });
    const payments = await Payment.find({ status: 'completed' });
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
  try {
    const tenants = await User.find({ role: 'tenant' });
    const properties = await Property.find({}).populate('ownerId');
    const payments = await Payment.find({})
      .populate('tenant', 'name email')
      .populate({
        path: 'lease',
        populate: { path: 'property', select: 'title address' }
      });
    res.json({ tenants, properties, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('tenant', 'name email')
      .populate({
        path: 'lease',
        populate: { path: 'property', select: 'title address' }
      })
      .sort({ createdAt: -1 });

    // Map to the format the frontend expects (tenantId, propertyId, transactionId)
    const mappedPayments = payments.map(p => ({
      _id: p._id,
      tenantId: p.tenant,
      propertyId: p.lease?.property,
      amount: p.amount,
      status: p.status,
      transactionId: p.stripePaymentIntentId,
      createdAt: p.createdAt || p.date
    }));

    res.json(mappedPayments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
