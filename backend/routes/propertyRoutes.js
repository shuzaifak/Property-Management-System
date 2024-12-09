// backend/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createProperty, 
  getProperties, 
  getOwnerProperties, 
  updateProperty, 
  deleteProperty 
}  = require('../controllers/propertyController');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/properties')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) // Unique filename
  }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => {
      console.log('Uploading File:', file.originalname);
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        console.error('Invalid File Type:', file.mimetype);
        cb(new Error('Invalid file type. Only JPEG, PNG and GIF are allowed.'));
      }
    }
  });

// Routes with image upload middleware
router.post('/', protect, requireRole(['admin', 'owner']), upload.array('images', 4), createProperty);
router.get('/', protect, requireRole(['admin', 'owner', 'tenant']), getProperties);
router.put('/:id', protect, requireRole(['admin', 'owner']), upload.array('images', 4), updateProperty);
router.delete('/:id', protect, requireRole(['admin', 'owner']), deleteProperty);
router.get('/owner', protect, requireRole(['owner']), getOwnerProperties);

module.exports = router;