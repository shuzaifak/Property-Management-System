import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Container, 
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

// Custom theme (reusing the theme from login page)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Deep blue
      light: '#42a5f5',
      dark: '#1565c0',
    },
    background: {
      default: '#f0f2f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& label.Mui-focused': {
            color: '#1976d2',
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            },
          },
        },
      },
    },
  },
});

const OwnerRegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async () => {
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const { data } = await api.post('/users/register', { 
        name, 
        email, 
        password, 
        role: 'owner' // Hardcoded role as owner
      });
      
      // Clear any previous errors
      setError('');
      
      // Set success message with user info from response
      setSuccess(`Registration successful for ${data.user.name}. Redirecting to login...`);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      // More detailed error handling
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      setSuccess('');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="xs">
          <Paper 
            elevation={6} 
            sx={{ 
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: 4,
              borderRadius: 3,
            }}
          >
            <Box 
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <PersonAddOutlinedIcon 
                sx={{ 
                  fontSize: 60, 
                  color: theme.palette.primary.main,
                  marginBottom: 2,
                }} 
              />
              <Typography 
                component="h1" 
                variant="h5" 
                sx={{ 
                  marginBottom: 2,
                  fontWeight: 600,
                }}
              >
                Owner Registration
              </Typography>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    width: '100%', 
                    marginBottom: 2,
                  }}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    width: '100%', 
                    marginBottom: 2,
                  }}
                >
                  {success}
                </Alert>
              )}

              <Box component="form" sx={{ width: '100%' }}>
                <TextField 
                  label="Full Name" 
                  variant="outlined" 
                  fullWidth 
                  margin="normal"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required
                />
                <TextField 
                  label="Email" 
                  variant="outlined" 
                  fullWidth 
                  margin="normal"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  type="email"
                />
                <TextField 
                  label="Password" 
                  variant="outlined" 
                  type="password" 
                  fullWidth 
                  margin="normal"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ 
                    marginTop: 2,
                    padding: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                  onClick={handleRegister}
                >
                  Register
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  fullWidth 
                  sx={{ 
                    marginTop: 2,
                    padding: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default OwnerRegisterPage;