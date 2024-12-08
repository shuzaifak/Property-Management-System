// backend/controllers/userController.js
const User = require('../models/User');
const { generateToken } = require('../utils/tokenService');
const { sendEmail } = require('../utils/emailService');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password, role });
    await user.save();
    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  // A real app would implement a password reset token flow
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  
  // Placeholder: send a simple email. In a real scenario, send a password reset link.
  await sendEmail(email, 'Password Reset', 'Use this link to reset your password...');
  res.json({ message: 'Password reset email sent.' });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    // User should be attached to req.user by the auth middleware
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Allow both 'admin' and 'owner' roles to upload avatars
    if (user.role !== 'admin' && user.role !== 'owner') {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // req.file is provided by Multer
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct the avatar URL
    const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('currentLease');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

