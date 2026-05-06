import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert
} from '@mui/material';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

const OwnerRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'owner'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    try {
      await api.post('/users/register', formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Card className="glass-card" sx={{ width: '100%', maxWidth: 420, mx: 2, p: 2 }}>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box sx={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 2, boxShadow: '0 8px 24px rgba(37,99,235,0.4)'
            }}>
              <Typography variant="h4" color="white" fontWeight="bold">P</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Owner Registration</Typography>
            <Typography variant="body2" color="textSecondary">Create an account to list your properties</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>}

          <TextField label="Full Name" name="name" variant="outlined" fullWidth sx={{ mb: 3 }} value={formData.name} onChange={handleChange} />
          <TextField label="Email Address" name="email" variant="outlined" fullWidth sx={{ mb: 3 }} value={formData.email} onChange={handleChange} />
          <TextField label="Password" name="password" variant="outlined" type="password" fullWidth sx={{ mb: 4 }} value={formData.password} onChange={handleChange} />

          <Button variant="contained" color="primary" fullWidth onClick={handleRegister}
            sx={{ mb: 2, py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
            Register Now
          </Button>
          <Button variant="text" fullWidth onClick={() => navigate('/login')} sx={{ color: '#60a5fa' }}>
            Already have an account? Sign In
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OwnerRegisterPage;