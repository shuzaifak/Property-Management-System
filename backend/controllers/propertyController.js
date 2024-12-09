// backend/controllers/propertyController.js
const Property = require('../models/Property');
const fs = require('fs');
const path = require('path');

exports.createProperty = async (req, res) => {
  try {
    const { title, address, price, description } = req.body;
    
    // Handle image uploads
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
    res.json(property);
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
  try {
    const { id } = req.params;
    
    // Find property to get images before deletion
    const property = await Property.findOne({ _id: id, ownerId: req.user._id });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found or not authorized.' });
    }

    // Delete associated image files
    property.images.forEach(imagePath => {
      const fullPath = path.join(__dirname, '../public', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    // Delete property from database
    await Property.findOneAndDelete({ _id: id, ownerId: req.user._id });
    
    res.json({ message: 'Property deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOwnerProperties = async (req, res) => {
  try {
    // Fetch properties for the currently logged-in owner
    const properties = await Property.find({ ownerId: req.user._id })
      .populate('ownerId', 'name email');
    
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};