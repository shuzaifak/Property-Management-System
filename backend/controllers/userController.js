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
    // Find user and populate lease info for immediate UI feedback
    const populatedUser = await User.findById(user._id).populate({
      path: 'currentLease',
      populate: { path: 'property' }
    });

    const token = generateToken(user);
    res.json({ 
      user: { 
        id: populatedUser._id, 
        name: populatedUser.name, 
        email: populatedUser.email, 
        role: populatedUser.role, 
        avatar: populatedUser.avatar, 
        currentLease: populatedUser.currentLease 
      }, 
      token 
    });
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
    
    // Populate user info for frontend
    const populatedUser = await User.findById(user._id).populate({
      path: 'currentLease',
      populate: { path: 'property' }
    });

    res.json({ 
      user: { 
        id: populatedUser._id, 
        name: populatedUser.name, 
        email: populatedUser.email, 
        role: populatedUser.role, 
        avatar: populatedUser.avatar, 
        currentLease: populatedUser.currentLease 
      }, 
      token 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Create reset URL
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    const emailHtml = `
      <h3>Password Reset Request</h3>
      <p>Hello ${user.name},</p>
      <p>You are receiving this email because you (or someone else) has requested a password reset for your Property Sync account.</p>
      <div class="info-box">
        <p>Please click on the following link to reset your password:</p>
        <a href="${resetURL}" class="button">Reset Password</a>
      </div>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link will expire in 10 minutes for your security.</p>
    `;

    await sendEmail(
      user.email, 
      'Password Reset Request', 
      emailHtml
    );

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // Hash the token from the URL
    const resetToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with the token and check if token is still valid
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    const { password } = req.body;
    
    // You might want to add password validation here
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Update user's password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
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

    // The requireRole middleware already handles role-based access
    // But we can keep a safety check or just remove it.
    // Let's ensure 'tenant' is included if we keep it.
    if (user.role !== 'admin' && user.role !== 'owner' && user.role !== 'tenant') {
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
    const user = await User.findById(req.user._id).populate({
      path: 'currentLease',
      populate: { path: 'property' }
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Create a new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update a user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
