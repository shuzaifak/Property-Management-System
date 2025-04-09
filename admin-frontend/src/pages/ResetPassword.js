// ResetPasswordPage.js
import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Alert 
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
  
    try {
      await api.post(`/users/reset-password/${token}`, { password });
      setSuccess('Password reset successful');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    }
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
            Reset Password
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <TextField 
            label="New Password" 
            type="password"
            variant="outlined" 
            fullWidth 
            sx={{ mb: 2 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField 
            label="Confirm New Password" 
            type="password"
            variant="outlined" 
            fullWidth 
            sx={{ mb: 2 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPasswordPage;