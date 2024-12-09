import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Button, 
  Container, 
  Box, 
  Grid, 
  Snackbar, 
  Alert,
  Card,
  CardContent,
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
    <Container maxWidth="lg" sx={{ 
      py: 4,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <Card 
        elevation={6} 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 8px 40px -12px rgba(0,0,0,0.3)'
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {loading && <LinearProgress color="primary" />}
          
          <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Grid item>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'primary.main',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.1)' 
                }}
              >
                My Properties
              </Typography>
            </Grid>
            <Grid item>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />} 
                onClick={handleAddProperty}
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1
                }}
              >
                Add New Property
              </Button>
            </Grid>
          </Grid>

          {loading ? (
            <Box textAlign="center" my={4}>
              <Typography variant="h6" color="textSecondary">
                Loading your properties...
              </Typography>
            </Box>
          ) : properties.length === 0 ? (
            <Card 
              variant="outlined" 
              sx={{ 
                textAlign: 'center', 
                my: 4, 
                py: 4, 
                borderColor: 'primary.light',
                backgroundColor: 'grey.100'
              }}
            >
              <ErrorIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" color="textSecondary">
                You have no properties listed yet.
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Click "Add New Property" to get started
              </Typography>
            </Card>
          ) : (
            <PropertyTable 
              properties={properties} 
              setProperties={setProperties} 
            />
          )}
        </CardContent>
      </Card>

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
    </Container>
  );
};

export default OwnerProperties;