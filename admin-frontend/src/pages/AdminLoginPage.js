import React, { useState, useContext } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions 
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
      if (user.role !== 'admin') {
        setError('Not authorized as admin');
        return;
      }

      login(user, token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = async () => {
    try {
      setForgotPasswordError('');
      setForgotPasswordSuccess('');
  
      // Validate email
      if (!forgotPasswordEmail) {
        setForgotPasswordError('Please enter your email');
        return;
      }
  
      // Use an underscore to explicitly ignore the response
      await api.post('/users/forgot-password', { email: forgotPasswordEmail });
      
      setForgotPasswordSuccess('Password reset email sent. Please check your inbox.');
    } catch (err) {
      setForgotPasswordError(err.response?.data?.message || 'Failed to send reset email');
    }
  };

  const openForgotPasswordModal = () => {
    setIsForgotPasswordOpen(true);
    setForgotPasswordEmail('');
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
  };

  const closeForgotPasswordModal = () => {
    setIsForgotPasswordOpen(false);
  };

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      height="100vh" 
      bgcolor="#f4f6f8"
    >
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Admin Login
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField 
            label="Email" 
            variant="outlined" 
            fullWidth 
            sx={{ mb: 2 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField 
            label="Password" 
            variant="outlined" 
            type="password" 
            fullWidth 
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleLogin}
            sx={{ mb: 1 }}
          >
            Login
          </Button>
          <Button 
            variant="text" 
            color="secondary" 
            fullWidth 
            onClick={openForgotPasswordModal}
          >
            Forgot Password?
          </Button>
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={isForgotPasswordOpen} onClose={closeForgotPasswordModal}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter your email to receive a password reset link
          </Typography>
          {forgotPasswordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Alert>
          )}
          {forgotPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotPasswordSuccess}
            </Alert>
          )}
          <TextField 
            label="Email" 
            variant="outlined" 
            fullWidth 
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForgotPasswordModal}>Cancel</Button>
          <Button 
            onClick={handleForgotPassword} 
            color="primary" 
            variant="contained"
          >
            Send Reset Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLoginPage;