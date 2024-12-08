// backend/controllers/tenantController.js

const Property = require('../models/Property');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');

exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find({ available: true });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rentProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const property = await Property.findById(propertyId);
    if (!property || !property.available) {
      return res.status(400).json({ message: 'Property not available for rent.' });
    }

    // Create a new lease
    const lease = new Lease({
      tenant: req.user.id,
      property: propertyId,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1-year lease
      status: 'active',
    });

    await lease.save();

    // Update property availability
    property.available = false;
    await property.save();

    // Update user with current lease
    const user = await User.findById(req.user.id);
    user.currentLease = lease._id;
    await user.save();

    res.json({ message: 'Property rented successfully.', lease });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.makePayment = async (req, res) => {
  try {
    const { amount, paymentMethod, leaseId } = req.body;

    // Validate lease
    const lease = await Lease.findById(leaseId);
    if (!lease || lease.status !== 'active') {
      return res.status(400).json({ message: 'Invalid or inactive lease.' });
    }

    // Create payment record
    const payment = new Payment({
      lease: leaseId,
      amount,
      paymentMethod,
      date: new Date(),
      status: 'completed', // Or 'pending' based on your payment processing
    });

    await payment.save();

    // Optionally, update user's balance or other financial records

    res.json({ message: 'Payment made successfully.', payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { leaseId } = req.params;

    // Validate lease
    const lease = await Lease.findById(leaseId);
    if (!lease || lease.status !== 'active') {
      return res.status(400).json({ message: 'Invalid or inactive lease.' });
    }

    // Fetch payment history
    const payments = await Payment.find({ lease: leaseId }).sort({ date: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
    // Implement logic to calculate and return tenant's available balance
    // This is a placeholder implementation
    const payments = await Payment.find({ tenant: req.user.id, status: 'completed' });
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    // Assume rent per month is fixed or fetch from lease
    const currentLease = await Lease.findOne({ tenant: req.user.id, status: 'active' });
    const rentPerMonth = currentLease ? currentLease.monthlyRent : 0;
    const months = (new Date() - currentLease.startDate) / (1000 * 60 * 60 * 24 * 30);
    const totalDue = rentPerMonth * Math.floor(months);
    const balance = totalPaid - totalDue;

    res.json({ balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
