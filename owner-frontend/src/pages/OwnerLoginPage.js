import React, { useState, useContext } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, Alert } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const OwnerLoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate(); // Initialize useNavigate
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await api.post('/users/login', { email, password });
      const { user, token } = res.data;
      if (user.role !== 'owner') {
        setError('Not authorized as owner');
        return;
      }
      login(user, token);
      navigate('/'); // Use navigate instead of window.location.href
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f4f6f8">
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>Owner Login</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField 
            label="Email" 
            variant="outlined" 
            fullWidth 
            sx={{ mb: 2 }} 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
          />
          <TextField 
            label="Password" 
            variant="outlined" 
            type="password" 
            fullWidth 
            sx={{ mb: 2 }} 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            onClick={handleLogin}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OwnerLoginPage;
