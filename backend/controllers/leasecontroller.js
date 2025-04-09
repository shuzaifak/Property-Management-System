// backend/controllers/leaseController.js

const Lease = require('../models/Lease');
const Property = require('../models/Property');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const pdf = require('html-pdf');  // using html-pdf to generate the PDF

exports.getCurrentLease = async (req, res) => {
    try {
      const lease = await Lease.findOne({ 
        tenant: req.user._id, 
        status: { $in: ['active', 'pending'] } 
      }).populate('property');
  
      if (!lease) {
        return res.status(404).json({ message: 'No active lease found' });
      }
  
      res.json(lease);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching lease', error: error.message });
    }
  };

exports.getLeaseAgreementsForOwner = async (req, res) => {
    try {
      // Extensive logging
      console.log('User requesting lease agreements:', req.user);
  
      // Validate user exists
      if (!req.user || !req.user._id) {
        return res.status(401).json({ 
          message: 'Unauthorized: User not found or invalid' 
        });
      }
  
      // Find leases for the owner's properties
      const leases = await Lease.find({})
        .populate({
          path: 'property',
          match: { ownerId: req.user._id }
        })
        .populate('tenant')
        .exec();
  
      // Filter leases where property belongs to the user
      const filteredLeases = leases.filter(lease => 
        lease.property && lease.property.ownerId.toString() === req.user._id.toString()
      );
  
      console.log('Filtered Leases:', filteredLeases);
  
      // Send response
      res.json(filteredLeases);
    } catch (error) {
      console.error('Lease Agreements Fetch Error:', error);
      res.status(500).json({ 
        message: 'Error fetching lease agreements', 
        error: error.message 
      });
    }
  };

exports.updateLeaseStatus = async (req, res) => {
  try {
    const { leaseId, status } = req.body;

    const lease = await Lease.findById(leaseId);
    if (!lease) return res.status(404).json({ message: 'Lease not found.' });

    lease.status = status;
    await lease.save();

    // If lease is terminated or completed, make property available again
    if (status === 'completed' || status === 'terminated') {
      const property = await Property.findById(lease.property);
      property.available = true;
      await property.save();
    }

    res.json({ message: 'Lease status updated successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to create lease agreement
exports.generateLeaseAgreement = async (req, res) => {
  const { leaseId } = req.params;

  try {
    // Fetch the lease details
    const lease = await Lease.findById(leaseId).populate('tenant').populate('property');
    if (!lease) return res.status(404).json({ message: 'Lease not found' });

    // Prepare HTML content for the lease agreement
    const htmlContent = `
      <html>
        <head>
          <title>Lease Agreement</title>
        </head>
        <body>
          <h1>Lease Agreement</h1>
          <p><strong>Tenant:</strong> ${lease.tenant.name}</p>
          <p><strong>Property:</strong> ${lease.property.address}</p>
          <p><strong>Start Date:</strong> ${new Date(lease.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(lease.endDate).toLocaleDateString()}</p>
          <p><strong>Rent Amount:</strong> £${lease.rentAmount}</p>
          <p><strong>Status:</strong> ${lease.status}</p>
        </body>
      </html>
    `;

    // Options for PDF generation
    const options = { format: 'A4' };

    // Generate the PDF
    pdf.create(htmlContent, options).toFile(path.join(__dirname, '../public/uploads/lease-agreements', `lease-agreement-${leaseId}.pdf`), (err, file) => {
      if (err) {
        return res.status(500).json({ message: 'Error generating PDF', error: err });
      }
      res.json({ message: 'Lease agreement created', filePath: `/uploads/lease-agreements/lease-agreement-${leaseId}.pdf` });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Function to download lease agreement
exports.downloadLeaseAgreement = async (req, res) => {
  const { leaseId } = req.params;
  const filePath = path.join(__dirname, '../public/uploads/lease-agreements', `lease-agreement-${leaseId}.pdf`);

  if (fs.existsSync(filePath)) {
    res.download(filePath, `lease-agreement-${leaseId}.pdf`);
  } else {
    res.status(404).json({ message: 'Lease agreement not found' });
  }
};
