// src/components/Auth/LoginForm.jsx

import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup'; // Ensure Yup is installed
import {
  TextField,
  Button,
  Typography,
  Box,
  Container,
} from '@mui/material';
import { toast } from 'react-toastify';

const LoginForm = () => {
  const { login, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      console.log('Submitting login form with:', values);
      const response = await login(values.email, values.password);
      console.log('Login response:', response);
      setSubmitting(false);
      if (response.success) {
        navigate('/dashboard');
      } else {
        toast.error(`Login failed: ${response.message}`);
      }
    },
  });

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        <Typography variant="h4" align="center" gutterBottom>
          Tenant Login
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email"
            margin="normal"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            margin="normal"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <Box mt={2}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              type="submit"
              disabled={formik.isSubmitting || loading}
            >
              {formik.isSubmitting || loading ? 'Logging in...' : 'Login'}
            </Button>
          </Box>
        </form>
        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Don't have an account?{' '}
            <Button variant="text" color="primary" onClick={handleNavigateToRegister}>
              Register Here
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
