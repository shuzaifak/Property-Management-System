import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, IconButton, InputAdornment
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import api from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    setError('');
    try {
      await api.post(`/users/reset-password/${token}`, { password });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Card className="glass-card" sx={{ width: '100%', maxWidth: 420, mx: 2, p: 2 }}>
        <CardContent>
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Reset Password</Typography>
            <Typography variant="body2" color="textSecondary">Please enter your new password below.</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <form onSubmit={handleReset}>
            <TextField
              label="New Password"
              variant="outlined"
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <LockIcon sx={{ color: '#64748b', mr: 1 }} fontSize="small" />,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#64748b' }}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              variant="outlined"
              fullWidth
              required
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 4 }}
              InputProps={{
                startAdornment: <LockIcon sx={{ color: '#64748b', mr: 1 }} fontSize="small" />,
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
