// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, getAllUsers, uploadAvatar, getMe } = require('../controllers/userController');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);

// Protected routes
router.get('/all', protect, requireRole(['admin']), getAllUsers);

// New route to get authenticated user's details
router.get('/me', protect, getMe);

// Avatar upload route - Allow 'admin' and 'owner' roles
router.post('/upload-avatar', protect, requireRole(['admin', 'owner']), upload.single('avatar'), uploadAvatar);

module.exports = router;
