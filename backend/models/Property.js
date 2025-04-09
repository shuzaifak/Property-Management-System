// backend/models/Property.js
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  address: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  images: [String],
  tenants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  available: { type: Boolean, default: true }  // Add this field to track availability
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
