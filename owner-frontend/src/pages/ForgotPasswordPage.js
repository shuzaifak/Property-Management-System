import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, IconButton
} from '@mui/material';
import { ArrowBack as BackIcon, Email as EmailIcon } from '@mui/icons-material';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/users/forgot-password', { email });
      setSuccess('If an account exists with this email, you will receive a reset link shortly.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ bgcolor: '#080c14' }}>
      <Card className="glass-card" sx={{ width: '100%', maxWidth: 420, mx: 2, p: 2 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <IconButton onClick={() => navigate('/login')} sx={{ color: '#94a3b8', mb: 1 }}>
              <BackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#f1f5f9' }}>Forgot Password?</Typography>
            <Typography variant="body2" color="textSecondary">Enter your email and we'll send you a link to reset your password.</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <form onSubmit={handleForgot}>
            <TextField
              label="Email Address"
              variant="outlined"
              fullWidth
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: '#64748b', mr: 1 }} fontSize="small" />,
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
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordPage;
