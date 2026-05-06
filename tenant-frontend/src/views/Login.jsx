import React, { useState, useContext } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert
} from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await api.post('/users/login', { email, password });
      const { user, token } = res.data;
      if (user.role !== 'tenant') { setError('Not authorized as tenant'); return; }
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f1f5f9' }}>Tenant Portal</Typography>
            <Typography variant="body2" color="textSecondary">Sign in to find and manage your rental</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <TextField label="Email Address" variant="outlined" fullWidth sx={{ mb: 3 }} value={email} onChange={e => setEmail(e.target.value)} />
          <TextField label="Password" variant="outlined" type="password" fullWidth sx={{ mb: 1 }} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          
          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Button variant="text" size="small" onClick={() => navigate('/forgot-password')} sx={{ color: '#94a3b8', textTransform: 'none' }}>
              Forgot Password?
            </Button>
          </Box>

          <Button variant="contained" color="primary" fullWidth onClick={handleLogin}
            sx={{ mb: 2, py: 1.5, fontSize: '1rem', background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)' }}>
            Sign In
          </Button>
          <Button variant="text" fullWidth onClick={() => navigate('/register')} sx={{ color: '#60a5fa' }}>
            New here? Register for an account
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
