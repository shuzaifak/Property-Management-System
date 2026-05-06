// backend/controllers/propertyController.js
const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Lease = require('../models/Lease');
const Payment = require('../models/Payment');
const { sendEmail } = require('../utils/emailService');
const mongoose = require('mongoose');
const crypto = require('crypto');

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
        `
          <h3>New Property Listing</h3>
          <p>Dear ${tenant.name},</p>
          <p>A stunning new property has just been added to the Property Sync collection that matches your interest.</p>
          
          <div class="info-box">
            <h4>Property Details:</h4>
            <ul>
              <li><strong>Title:</strong> ${title}</li>
              <li><strong>Address:</strong> ${address}</li>
              <li><strong>Monthly Rent:</strong> $${price}</li>
            </ul>
          </div>

          <p><strong>Description:</strong><br/>${description}</p>
          
          <p>Sign in to your portal to view photos and contact the owner.</p>
          <a href="${process.env.FRONTEND_URL}/dashboard" class="button">View Listing</a>
        `
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

    // Check if user exists by email
    let tenant = await User.findOne({ email });

    if (tenant) {
      // If user exists but is not a tenant, we cannot assign them as one
      if (tenant.role !== 'tenant') {
        return res.status(400).json({
          message: 'This email is already registered with a different role (Owner/Admin).'
        });
      }
    } else {
      // Create new tenant if they don't exist
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
      `
        <h3>Welcome to Your New Home!</h3>
        <p>Dear ${tenant.name},</p>
        <p>Congratulations! You have been successfully assigned to the property at <strong>${property.address}</strong>.</p>
        
        <div class="info-box">
          <h4>Lease Summary & Terms:</h4>
          <ul>
            <li><strong>Rent Due:</strong> 1st of each month</li>
            <li><strong>Late Fee:</strong> 5% after the 5th</li>
            <li><strong>Security Deposit:</strong> Equal to one month's rent</li>
            <li><strong>Utilities:</strong> Tenant responsibility</li>
          </ul>
        </div>

        <p>Please log in to your tenant portal to review and download your full lease agreement.</p>
        <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
        
        <hr />
        <p><small>Emergency repairs should be reported immediately through the portal maintenance system.</small></p>
      `
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

    // Check for active leases to determine availability and fetch tenant details
    const propertiesWithStatus = await Promise.all(properties.map(async (property) => {
      const activeLease = await Lease.findOne({
        property: property._id,
        status: 'active'
      }).populate('tenant', 'name email role');

      // Convert to plain object to add custom fields
      const propertyObj = property.toObject();

      // If there is an active lease, the property is occupied
      propertyObj.available = !activeLease;
      propertyObj.activeLease = activeLease;

      return propertyObj;
    }));

    res.json(propertiesWithStatus);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProperties = async (req, res) => {
  try {
    const { id } = req.query;

    let properties;
    if (id) {
      properties = await Property.find({ _id: id }).populate('ownerId', 'name email');
    } else {
      properties = await Property.find({}).populate('ownerId', 'name email');
    }

    // Enhance properties with active lease and tenant info
    const enrichedProperties = await Promise.all(properties.map(async (p) => {
      const activeLease = await Lease.findOne({
        property: p._id,
        status: 'active'
      }).populate('tenant', 'name email');

      const pObj = p.toObject();
      pObj.available = !activeLease;
      pObj.activeLease = activeLease;
      return pObj;
    }));

    res.json(enrichedProperties);
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
        const fullPath = path.join(__dirname, '..', 'public', imagePath);
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
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    await session.startTransaction();

    let query = { _id: id };
    if (req.user.role !== 'admin') {
      query.ownerId = req.user._id;
    }

    const property = await Property.findOne(query).session(session);
    if (!property) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Property not found or you are not authorized.' });
    }

    // Prepare file deletions (async)
    const fileDeletions = property.images.map(imagePath => {
      const fullPath = path.join(__dirname, '..', 'public', imagePath);
      return fs.promises.unlink(fullPath).catch(() => { }); // Ignore errors if file not found
    });

    // Run DB updates in parallel where possible within the transaction
    const dbUpdates = [
      // Terminate active leases
      Lease.updateMany(
        { property: id, status: 'active' },
        {
          status: 'terminated',
          endDate: new Date(),
          terminationReason: req.user.role === 'admin' ? 'Property deleted by Admin' : 'Property deleted by owner'
        }
      ).session(session),

      // Remove currentLease reference from users
      Lease.find({ property: id }).select('_id').session(session).then(leases => {
        const leaseIds = leases.map(l => l._id);
        return User.updateMany(
          { currentLease: { $in: leaseIds } },
          { $unset: { currentLease: 1 } }
        ).session(session);
      }),

      // Delete property record
      Property.findOneAndDelete({ _id: id }).session(session)
    ];

    // Wait for all DB operations and file deletions
    await Promise.all([...dbUpdates, ...fileDeletions]);

    await session.commitTransaction();
    res.json({ message: 'Property deleted successfully.' });
  } catch (err) {
    if (session.inTransaction()) await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

exports.getOwnerPaymentHistory = async (req, res) => {
  try {
    // Find all properties owned by the current user
    const properties = await Property.find({ ownerId: req.user._id });
    const propertyIds = properties.map(prop => prop._id);

    // Find all active leases for these properties to calculate dues
    const activeLeases = await Lease.find({
      property: { $in: propertyIds },
      status: 'active'
    }).populate('tenant', 'name email').populate('property', 'title address');

    const leaseIds = activeLeases.map(lease => lease._id);

    // Fetch all payments for these leases
    const payments = await Payment.find({ lease: { $in: leaseIds } })
      .populate({
        path: 'lease',
        populate: [
          { path: 'tenant', select: 'name email' },
          { path: 'property', select: 'title address' }
        ]
      })
      .sort({ date: -1 });

    // Calculate dues for each active lease
    const dues = await Promise.all(activeLeases.map(async (lease) => {
      const leasePayments = await Payment.find({
        lease: lease._id,
        status: 'completed'
      });

      const totalPaid = leasePayments.reduce((sum, p) => sum + p.amount, 0);

      // Calculate total expected rent since lease started
      const startDate = new Date(lease.startDate);
      const today = new Date();

      const yearsDiff = today.getFullYear() - startDate.getFullYear();
      const monthsDiff = today.getMonth() - startDate.getMonth();
      const totalMonths = (yearsDiff * 12) + monthsDiff + 1; // Including current month

      const totalExpected = (lease.rentAmount || 0) * totalMonths;
      const outstanding = Math.max(0, totalExpected - totalPaid);

      return {
        leaseId: lease._id,
        tenantName: lease.tenant?.name,
        propertyTitle: lease.property?.title,
        monthlyRent: lease.rentAmount,
        totalPaid,
        totalExpected,
        outstanding
      };
    }));

    res.json({ payments, dues });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.contactOwner = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const property = await Property.findById(propertyId).populate("ownerId", "name email");

    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }

    const tenant = req.user;
    const owner = property.ownerId;

    if (!owner || !owner.email) {
      return res.status(400).json({ message: "Owner contact information is missing." });
    }

    // Send email to owner
    await sendEmail(
      owner.email,
      `New Interest in your property: ${property.title}`,
      `
      <h3>New Inquiry Received</h3>
      <p>Hello <strong>${owner.name}</strong>,</p>
      <p>A potential tenant has expressed interest in your property <strong>"${property.title}"</strong>.</p>
      <hr />
      <h4>Tenant Details:</h4>
      <ul>
        <li><strong>Name:</strong> ${tenant.name}</li>
        <li><strong>Email:</strong> ${tenant.email}</li>
      </ul>
      <p>They are viewing your property on the Property Sync portal and would like to learn more or schedule a viewing.</p>
      <br />
      <p>Best regards,<br />Property Sync System</p>
      `
    );

    res.json({ message: "Inquiry sent successfully to the owner!" });
  } catch (err) {
    console.error("Contact owner error:", err);
    res.status(500).json({ message: "Failed to send inquiry. Please try again later." });
  }
};
