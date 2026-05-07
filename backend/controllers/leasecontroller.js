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

// Helper function to generate PDF content
const generatePDFFile = (lease, filePath) => {
  return new Promise((resolve, reject) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              color: #1e293b; 
              line-height: 1.6; 
              margin: 0; 
              padding: 40px; 
            }
            .header { 
              border-bottom: 4px solid #3b82f6; 
              padding-bottom: 20px; 
              margin-bottom: 40px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
            }
            .logo { 
              font-size: 28px; 
              font-weight: 800; 
              color: #1d4ed8; 
              letter-spacing: -1px; 
            }
            .agreement-title { 
              text-align: right; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
              font-size: 14px; 
              color: #64748b; 
            }
            h1 { font-size: 32px; font-weight: 800; margin: 0; }
            .section { margin-bottom: 30px; }
            .section-title { 
              font-size: 16px; 
              font-weight: 700; 
              color: #3b82f6; 
              text-transform: uppercase; 
              margin-bottom: 15px; 
              border-bottom: 1px solid #e2e8f0; 
              padding-bottom: 5px; 
            }
            .grid { display: flex; flex-wrap: wrap; gap: 20px; }
            .grid-item { flex: 1; min-width: 200px; }
            .label { font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
            .value { font-size: 16px; font-weight: 600; color: #0f172a; }
            .footer { 
              margin-top: 60px; 
              padding-top: 20px; 
              border-top: 1px solid #e2e8f0; 
              font-size: 12px; 
              color: #94a3b8; 
              text-align: center; 
            }
            .signature-box { 
              margin-top: 50px; 
              display: flex; 
              justify-content: space-between; 
              gap: 100px; 
            }
            .sig-line { 
              border-top: 2px solid #0f172a; 
              padding-top: 10px; 
              width: 200px; 
              text-align: center; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PropertySync</div>
            <div class="agreement-title">Residential Lease Agreement</div>
          </div>

          <div class="section">
            <h1>Agreement Details</h1>
            <p>This Residential Lease Agreement is entered into on this day <strong>${new Date().toLocaleDateString()}</strong> between the Landlord and the Tenant named below.</p>
          </div>

          <div class="section">
            <div class="section-title">Parties & Property</div>
            <div class="grid">
              <div class="grid-item">
                <div class="label">Tenant Name</div>
                <div class="value">${lease.tenant.name}</div>
              </div>
              <div class="grid-item">
                <div class="label">Email Address</div>
                <div class="value">${lease.tenant.email}</div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <div class="label">Property Address</div>
              <div class="value" style="font-size: 20px;">${lease.property.address}</div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Lease Terms</div>
            <div class="grid">
              <div class="grid-item">
                <div class="label">Start Date</div>
                <div class="value">${new Date(lease.startDate).toLocaleDateString()}</div>
              </div>
              <div class="grid-item">
                <div class="label">End Date</div>
                <div class="value">${new Date(lease.endDate).toLocaleDateString()}</div>
              </div>
              <div class="grid-item">
                <div class="label">Monthly Rent</div>
                <div class="value" style="color: #10b981;">$${lease.rentAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Terms & Conditions</div>
            <p>1. <strong>Rent Payment:</strong> Rent is due on the 1st of every month.</p>
            <p>2. <strong>Security Deposit:</strong> A deposit equivalent to one month's rent is required.</p>
            <p>3. <strong>Maintenance:</strong> The tenant agrees to keep the premises in a clean and sanitary condition.</p>
            <p>4. <strong>Occupancy:</strong> The premises shall be used only as a private residence.</p>
          </div>

          <div class="signature-box">
            <div class="sig-line">
              <div class="label">Landlord Signature</div>
              <div style="margin-top: 20px;">Date: ____________</div>
            </div>
            <div class="sig-line">
              <div class="label">Tenant Signature</div>
              <div style="margin-top: 20px;">Date: ____________</div>
            </div>
          </div>

          <div class="footer">
            Generated by PropertySync • ${new Date().getFullYear()}
          </div>
        </body>
      </html>
    `;

    const options = { 
      format: 'A4',
      border: { top: "0in", right: "0in", bottom: "0in", left: "0in" }
    };

    pdf.create(htmlContent, options).toFile(filePath, (err, file) => {
      if (err) reject(err);
      else resolve(file);
    });
  });
};

// Function to create lease agreement
exports.generateLeaseAgreement = async (req, res) => {
  const { leaseId } = req.params;
  const filePath = path.join(__dirname, '../public/uploads/lease-agreements', `lease-agreement-${leaseId}.pdf`);
  const dir = path.join(__dirname, '../public/uploads/lease-agreements');

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(filePath)) {
      return res.json({ 
        message: 'Lease agreement already exists', 
        filePath: `/uploads/lease-agreements/lease-agreement-${leaseId}.pdf`,
        cached: true 
      });
    }

    const lease = await Lease.findById(leaseId).populate('tenant').populate('property');
    if (!lease) return res.status(404).json({ message: 'Lease not found' });

    await generatePDFFile(lease, filePath);
    res.json({ message: 'Lease agreement created', filePath: `/uploads/lease-agreements/lease-agreement-${leaseId}.pdf` });
  } catch (err) {
    console.error('Agreement Generation Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Function to download lease agreement
exports.downloadLeaseAgreement = async (req, res) => {
  const { leaseId } = req.params;
  const filePath = path.join(__dirname, '../public/uploads/lease-agreements', `lease-agreement-${leaseId}.pdf`);
  const dir = path.join(__dirname, '../public/uploads/lease-agreements');

  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(filePath)) {
      return res.download(filePath, `lease-agreement-${leaseId}.pdf`);
    }

    // If file doesn't exist, generate it on the fly
    const lease = await Lease.findById(leaseId).populate('tenant').populate('property');
    if (!lease) return res.status(404).json({ message: 'Lease not found' });

    await generatePDFFile(lease, filePath);
    res.download(filePath, `lease-agreement-${leaseId}.pdf`);
  } catch (err) {
    console.error('Download/Generation Error:', err);
    res.status(500).json({ message: 'Error processing download' });
  }
};
