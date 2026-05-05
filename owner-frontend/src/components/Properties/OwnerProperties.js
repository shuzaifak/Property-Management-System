import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Button, 
  Box, 
  Snackbar, 
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  ErrorOutline as ErrorIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PropertyTable from './PropertyTable';
import api from '../../utils/api';

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const res = await api.get('/properties/owner');
        
        // Validate response data
        if (!Array.isArray(res.data)) {
          throw new Error('Invalid data format');
        }

        setProperties(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        setError(error.message || 'Failed to load properties');
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleAddProperty = () => {
    navigate('/add-property');
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>My Properties</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleAddProperty}
          sx={{ 
            background: 'linear-gradient(135deg, #2563eb, #3b82f6)', 
            boxShadow: '0 4px 20px rgba(37,99,235,0.4)', 
            borderRadius: 3, 
            px: 3 
          }}
        >
          Add New Property
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><LinearProgress sx={{ width: '100%', borderRadius: 2 }} /></Box>
      ) : properties.length === 0 ? (
        <Box className="glass-card" sx={{ textAlign: 'center', py: 8 }}>
          <ErrorIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            You have no properties listed yet.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Click "Add New Property" to get started
          </Typography>
        </Box>
      ) : (
        <PropertyTable 
          properties={properties} 
          setProperties={setProperties} 
        />
      )}

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseError} 
          severity="error" 
          sx={{ width: '100%' }}
          icon={<ErrorIcon />}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OwnerProperties;