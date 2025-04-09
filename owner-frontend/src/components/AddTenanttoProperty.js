import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Alert, 
  Avatar 
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import api from '../utils/api';

const AddTenantToProperty = ({ propertyId, onTenantAdded }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tenant, setTenant] = useState(null);

  const handleAddTenant = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/properties/add-tenant', { 
        propertyId, 
        email 
      });
      
      setTenant(response.data.tenant);
      onTenantAdded && onTenantAdded(response.data.tenant);
      
      // Reset form
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 500, 
        m: 'auto', 
        boxShadow: 3,
        borderRadius: 2 
      }}
    >
      <CardContent>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main', 
              width: 60, 
              height: 60,
              mb: 2 
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography 
            variant="h5" 
            color="primary" 
            sx={{ fontWeight: 600 }}
          >
            Add Tenant to Property
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {tenant && (
          <Alert 
            severity="success" 
            sx={{ mb: 2 }}
          >
            Tenant Added: {tenant.name} ({tenant.email})
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tenant Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleAddTenant}
              disabled={loading || !email}
              sx={{ 
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              {loading ? 'Adding Tenant...' : 'Add Tenant'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AddTenantToProperty;