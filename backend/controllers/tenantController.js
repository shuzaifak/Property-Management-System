const Property = require('../models/Property');
const Lease = require('../models/Lease');
const User = require('../models/User');
const Payment = require('../models/Payment');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
exports.getProperties = async (req, res) => {
  try {
    let query = { available: true };

    // If tenant has an active lease, also include their current property in the results
    if (req.user.currentLease) {
      const lease = await Lease.findById(req.user.currentLease);
      if (lease) {
        query = {
          $or: [
            { available: true },
            { _id: lease.property }
          ]
        };
      }
    }

    const properties = await Property.find(query);
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

// Function to add a new tenant to a property
exports.addTenantToProperty = async (req, res) => {
  try {
    const { propertyId, tenantId, startDate, endDate, rentAmount } = req.body;

    // Check if the tenant exists
    const tenant = await User.findById(tenantId);
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant is not registered.' });
    }

    // Check if the property is available
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found.' });
    }

    // Check if the property is already occupied
    if (property.tenants.length > 0) {
      return res.status(400).json({ error: 'Property is already occupied.' });
    }

    // Create a new lease for the tenant
    const newLease = new Lease({
      property: propertyId,
      tenant: tenantId,
      startDate,
      endDate,
      rentAmount,
      status: 'active',
    });

    await newLease.save();

    // Update the property with tenant details
    property.tenants.push(tenantId);
    await property.save();

    res.status(200).json({ message: 'Tenant added successfully!', lease: newLease });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred. Please try again later.' });
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

    res.json({ message: 'Payment made successfully.', payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    // Validate that leaseId is a valid string
    if (!req.params.leaseId || typeof req.params.leaseId !== 'string') {
      console.error('Invalid lease ID');
      return res.status(400).json({
        message: 'Invalid lease ID',
        details: {
          user: req.user ? req.user._id : 'No user found',
        }
      });
    }

    // Trim and validate the lease ID
    const leaseId = req.params.leaseId.trim();

    // Check if the lease ID is a valid 24-character hex string
    if (!/^[0-9a-fA-F]{24}$/.test(leaseId)) {
      console.error('Lease ID is not a valid ObjectId');
      return res.status(400).json({
        message: 'Invalid lease ID format',
        receivedId: leaseId
      });
    }

    // Convert to ObjectId
    const objectId = new mongoose.Types.ObjectId(leaseId);

    // Find the lease with detailed logging
    const lease = await Lease.findById(objectId);

    if (!lease) {
      console.error('Lease Not Found', {
        leaseId: objectId.toString(),
        searchParams: { _id: objectId }
      });
      return res.status(404).json({
        message: 'Lease not found',
        leaseId: objectId.toString()
      });
    }

    // Fetch payment history
    const payments = await Payment.find({ lease: objectId }).sort({ date: -1 });

    res.json(payments);
  } catch (err) {
    console.error('Full Payment History Error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
      stack: err.stack
    });
  }
};

exports.getBalance = async (req, res) => {
  try {
    const currentLease = await Lease.findOne({
      tenant: req.user.id || req.user._id,
      status: 'active'
    });

    if (!currentLease) {
      return res.json({ balance: 0, pendingRent: 0, totalDue: 0 });
    }

    // Get all successful payments
    const payments = await Payment.find({
      tenant: req.user.id || req.user._id,
      status: 'completed'
    });

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate months passed since lease started
    const startDate = new Date(currentLease.startDate);
    const today = new Date();

    const yearsDiff = today.getFullYear() - startDate.getFullYear();
    const monthsDiff = today.getMonth() - startDate.getMonth();
    const totalMonths = (yearsDiff * 12) + monthsDiff + 1; // +1 to include the current month

    const rentPerMonth = currentLease.rentAmount || 0;
    const totalDue = rentPerMonth * totalMonths;
    const pendingRent = Math.max(0, totalDue - totalPaid);

    res.json({
      balance: totalPaid,
      pendingRent,
      totalDue,
      monthlyRent: rentPerMonth
    });
  } catch (err) {
    console.error('Get balance error:', err);
    res.status(500).json({ message: err.message });
  }
};
exports.initiateRentPayment = async (req, res) => {
  try {
    const { amount } = req.body;
    const lease = await Lease.findOne({
      tenant: req.user.id,
      status: 'active'
    });

    if (!lease) {
      return res.status(400).json({ message: 'No active lease found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method_types: ['card'],
      metadata: {
        leaseId: lease._id.toString(),
        userId: req.user.id || req.user._id
      }
    });

    // Create a pending payment record in the database
    const pendingPayment = new Payment({
      lease: lease._id,
      tenant: req.user.id || req.user._id,
      amount: amount,
      paymentMethod: 'stripe',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id
    });
    await pendingPayment.save();

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Payment initiation failed', error: error.message });
  }
};

exports.confirmRentPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve the PaymentIntent to verify details
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Find the existing pending payment record
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });

    if (payment) {
      payment.status = paymentIntent.status === 'succeeded' ? 'completed' : 'failed';
      await payment.save();
    } else {
      // Fallback: Create new if for some reason not found
      const newPayment = new Payment({
        lease: paymentIntent.metadata.leaseId,
        tenant: paymentIntent.metadata.userId,
        amount: paymentIntent.amount / 100,
        paymentMethod: 'stripe',
        status: paymentIntent.status === 'succeeded' ? 'completed' : 'failed',
        stripePaymentIntentId: paymentIntentId
      });
      await newPayment.save();
    }

    res.json({
      message: 'Payment processed',
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Payment confirmation failed', error: error.message });
  }
};