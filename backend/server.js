// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const { port, mongoUri } = require('./config/config');
const connectDB = require('./config/db');
// Add this before app.listen in server.js
const fs = require('fs');

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const tenantRoutes = require('./routes/tenantRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from multiple directories
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads/properties')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
connectDB(mongoUri);

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/tenants', tenantRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => console.log(`Server running on port ${port}`));
