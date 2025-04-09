// backend/controllers/propertyController.js
const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Lease = require('../models/Lease');
const { sendEmail } = require('../utils/emailService');
const mongoose = require('mongoose');



exports.createProperty = async (req, res) => {
  try {
    const { title, address, price, description } = req.body;
    const images = req.files ? req.files.map(file => `/uploads/properties/${file.filename}`) : [];

    const property = new Property({ 
      ownerId: req.user._id, 
      title, 
      address, 
      price: Number(price), 
      description,
      images 
    });
    await property.save();

    // Find all registered tenants
    const tenants = await User.find({ role: 'tenant' });

    // Send email to all tenants about the new property
    const emailPromises = tenants.map(tenant => 
      sendEmail(
        tenant.email, 
        'New Property Added to Property Sync', 
        `Dear ${tenant.name},

A new property has been added to Property Sync:

Property Details:
- Title: ${title}
- Address: ${address}
- Monthly Rent: $${price}

Description:
${description}

Check out the available properties in your tenant portal.

Best regards,
Property Sync Management`
      )
    );

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addTenantToProperty = async (req, res) => {
  try {
    const { propertyId, email } = req.body;

    // Verify if property exists and belongs to the current owner
    const property = await Property.findOne({ 
      _id: propertyId, 
      ownerId: req.user._id 
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found or you are not authorized to modify it.' });
    }

    // Check if tenant exists or create a new one
    let tenant = await User.findOne({ email, role: 'tenant' });

    if (!tenant) {
      tenant = new User({
        email,
        role: 'tenant',
        name: email.split('@')[0], 
        password: crypto.randomBytes(20).toString('hex')
      });
      await tenant.save();
    }

    // Ensure the tenant doesn't already have an active lease
    const existingTenantLease = await Lease.findOne({ 
      tenant: tenant._id, 
      status: 'active' 
    });

    if (existingTenantLease) {
      return res.status(400).json({ message: 'This tenant already has an active lease.' });
    }

    // Check for active lease on the property
    const existingLease = await Lease.findOne({ 
      property: propertyId, 
      status: 'active' 
    });

    if (existingLease) {
      return res.status(400).json({ message: 'This property already has an active lease.' });
    }

    // Create a new lease for the tenant
    const lease = new Lease({
      tenant: tenant._id,
      property: propertyId,
      startDate: new Date(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1-year lease
      status: 'active',
      rentAmount: property.price || 0
    });

    await lease.save();

    // Update property availability and tenant's current lease
    property.available = false;
    await property.save();

    tenant.currentLease = lease._id;
    await tenant.save();

    // Populate lease with tenant data and send confirmation email
    await lease.populate('tenant', 'name email');

    await sendEmail(
      tenant.email, 
      'New Property Lease Assigned', 
      `Dear ${tenant.name},
  
  You have been assigned to a new property at ${property.address}.
  
  Please review the following terms and conditions:
  
  1. Lease Term and Rent
     - Monthly rent payment is due on the 1st of each month
     - Late payments will incur a 5% fee after the 5th
  
  2. Security Deposit
     - Equal to one month's rent
     - Returned within 30 days of move-out, less damages
  
  3. Maintenance
     - Report all maintenance issues promptly
     - Emergency repairs should be reported immediately
  
  4. Property Use
     - Residential use only
     - No subletting without permission
  
  5. Utilities
     - Tenant responsible for all utilities
     - Must maintain active status
  
  Please sign into your tenant portal to complete the process.
  
  Best regards,
  Property Sync Management`
  );

    res.status(201).json({ 
      message: 'Tenant added successfully.',
      tenant: { id: tenant._id, name: tenant.name, email: tenant.email },
      lease
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred while assigning tenant to property: ' + err.message });
  }
};


// Controller to fetch properties for owner with their availability status
exports.getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id });

    // Check for active leases to determine availability
    const propertiesWithStatus = await Promise.all(properties.map(async (property) => {
      const activeLease = await Lease.findOne({
        property: property._id,
        status: 'active'
      });

      // If there is an active lease, the property is occupied
      property.available = !activeLease;

      // Return the updated property
      return property;
    }));

    res.json(propertiesWithStatus);  // Send updated properties with availability status
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    // Check if there's a specific ID query
    const { id } = req.query;
    
    let properties;
    if (id) {
      // If ID is provided, find specific property
      properties = await Property.find({ _id: id }).populate('ownerId', 'name email');
    } else {
      // Otherwise, get all properties
      properties = await Property.find({}).populate('ownerId', 'name email');
    }
    
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, address, price, description } = req.body;

    // Find existing property
    const existingProperty = await Property.findOne({ _id: id, ownerId: req.user._id });
    
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found or not authorized.' });
    }

    // Handle image uploads
    const newImages = req.files 
      ? req.files.map(file => `/uploads/properties/${file.filename}`) 
      : [];

    // Remove old images if new images are uploaded
    if (newImages.length > 0) {
      // Delete old image files
      existingProperty.images.forEach(imagePath => {
        const fullPath = path.join(__dirname, '../public', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      });
    }

    // Prepare update data
    const updateData = {
      title,
      address,
      price: Number(price),
      description,
      images: newImages.length > 0 ? newImages : existingProperty.images
    };

    // Update property
    const property = await Property.findOneAndUpdate(
      { _id: id, ownerId: req.user._id },
      updateData,
      { new: true }
    );

    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  const session = await mongoose.startSession(); // Assuming you're using mongoose transactions
  try {
    const { id } = req.params;
    
    // Start a transaction
    await session.startTransaction();

    // Find property to get images before deletion
    const property = await Property.findOne({ _id: id, ownerId: req.user._id }).session(session);
    
    if (!property) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Property not found or not authorized.' });
    }

    // Delete associated image files
    property.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '../public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    // Find and terminate any active leases for this property
    await Lease.updateMany(
      { property: id, status: 'active' }, 
      { 
        status: 'terminated', 
        endDate: new Date(), 
        terminationReason: 'Property deleted by owner' 
      }
    ).session(session);

    // Update tenant's current lease reference
    await User.updateMany(
      { currentLease: { $in: await Lease.find({ property: id }).select('_id') } },
      { $unset: { currentLease: 1 } }
    ).session(session);

    // Delete property from database
    await Property.findOneAndDelete({ _id: id, ownerId: req.user._id }).session(session);
    
    // Commit the transaction
    await session.commitTransaction();
    
    res.json({ message: 'Property and associated leases deleted.' });
  } catch (err) {
    // Abort transaction if there's an error
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    // End the session
    session.endSession();
  }
};
exports.getOwnerPaymentHistory = async (req, res) => {
  try {
    // Find all properties owned by the current user
    const properties = await Property.find({ ownerId: req.user._id });

    // Get property IDs
    const propertyIds = properties.map(prop => prop._id);

    // Find all active leases for these properties
    const activeLeases = await Lease.find({ 
      property: { $in: propertyIds },
      status: 'active'
    });

    // Get lease IDs
    const leaseIds = activeLeases.map(lease => lease._id);

    // Fetch all payments for these leases with tenant details
    const payments = await Payment.find({ lease: { $in: leaseIds } })
      .populate({
        path: 'lease',
        populate: [
          { path: 'tenant', select: 'name email' },
          { path: 'property', select: 'title address' }
        ]
      })
      .sort({ date: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};