// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, getAllUsers, uploadAvatar, getMe, resetPassword, createUser, updateUser, deleteUser} = require('../controllers/userController');
const { protect, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/all', protect, requireRole(['admin']), getAllUsers);

// New route to get authenticated user's details
router.get('/me', protect, getMe);

// Avatar upload route - Allow 'admin', 'owner', and 'tenant' roles
router.post('/upload-avatar', protect, requireRole(['admin', 'owner', 'tenant']), upload.single('avatar'), uploadAvatar);

// Admin-only user management routes
router.post('/admin/create', protect, requireRole(['admin']), createUser);
router.put('/admin/:id', protect, requireRole(['admin']), updateUser);
router.delete('/admin/:id', protect, requireRole(['admin']), deleteUser);

module.exports = router;
