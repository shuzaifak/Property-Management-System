// src/views/NotFound.jsx

import React from 'react';
import { Typography, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Box textAlign="center" mt={5}>
      <Typography variant="h3" gutterBottom>
        404
      </Typography>
      <Typography variant="h6" gutterBottom>
        The page you're looking for doesn't exist.
      </Typography>
      <Typography variant="body1">
        <Link to="/dashboard">Go back to Dashboard</Link>
      </Typography>
    </Box>
  );
};

export default NotFound;
