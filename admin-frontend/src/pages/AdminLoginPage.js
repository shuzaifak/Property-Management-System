import React, { useState, useContext } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/users/login', { email, password });
      const { user, token } = res.data;
      if (user.role !== 'admin') { setError('Not authorized as admin'); return; }
      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    try {
      setForgotPasswordError(''); setForgotPasswordSuccess('');
      if (!forgotPasswordEmail) { setForgotPasswordError('Please enter your email'); return; }
      await api.post('/users/forgot-password', { email: forgotPasswordEmail });
      setForgotPasswordSuccess('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setForgotPasswordError(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  const openForgotPasswordModal = () => { setIsForgotPasswordOpen(true); setForgotPasswordEmail(''); setForgotPasswordError(''); setForgotPasswordSuccess(''); };
  const closeForgotPasswordModal = () => setIsForgotPasswordOpen(false);

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Card className="glass-card" sx={{ width: 420, p: 2 }}>
        <CardContent>
          {/* Logo */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 2, boxShadow: '0 8px 24px rgba(37,99,235,0.4)'
            }}>
              <Typography variant="h4" color="white" fontWeight="bold">P</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Welcome Admin</Typography>
            <Typography variant="body2" color="textSecondary">Sign in to Property Sync</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <TextField label="Email Address" variant="outlined" fullWidth sx={{ mb: 3 }} value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Password" variant="outlined" type="password" fullWidth sx={{ mb: 4 }} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />

          <Button variant="contained" color="primary" fullWidth onClick={handleLogin}
            sx={{ mb: 2, py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
            Access Dashboard
          </Button>
          <Button variant="text" fullWidth onClick={openForgotPasswordModal} sx={{ color: '#60a5fa' }}>
            Forgot Password?
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isForgotPasswordOpen} onClose={closeForgotPasswordModal} PaperProps={{ className: 'glass-card' }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Recover Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>Enter your email to receive a reset link.</Typography>
          {forgotPasswordError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{forgotPasswordError}</Alert>}
          {forgotPasswordSuccess && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>{forgotPasswordSuccess}</Alert>}
          <TextField label="Email Address" variant="outlined" fullWidth value={forgotPasswordEmail} onChange={e => setForgotPasswordEmail(e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={closeForgotPasswordModal} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button onClick={handleForgotPassword} variant="contained" color="primary">Send Reset Link</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLoginPage;