import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout'; // Adjust the import path as needed
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  CircularProgress,
  Snackbar
} from '@mui/material';
import AddTenantToProperty from '../components/AddTenanttoProperty'; // Adjust path as needed
import api from '../utils/api'; // Adjust path as needed

const ManageTenantsPage = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [openAddTenantDialog, setOpenAddTenantDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Fetch properties on page load
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/properties/owner');
        setProperties(response.data);
      } catch (error) {
        console.error('Error fetching properties:', error);
      }
    };

    fetchProperties();
  }, []);

  const handleAddTenantClick = (property) => {
    setSelectedProperty(property);
    setOpenAddTenantDialog(true);
  };

  const handleTenantAdded = (newTenant) => {
    // Update the properties list to reflect the new tenant
    const updatedProperties = properties.map(prop => 
      prop._id === selectedProperty._id 
        ? { ...prop, available: false, currentTenant: newTenant }  // Update availability to false
        : prop
    );
    setProperties(updatedProperties);  // Reflect the update in the state
    setOpenAddTenantDialog(false);
    setSnackbarMessage('Tenant added successfully!');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const handleTenantAddError = (error) => {
    setSnackbarMessage(error || 'An error occurred while adding the tenant');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    setOpenAddTenantDialog(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <MainLayout>
      <Box>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            marginBottom: 3,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Tenant Management
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Properties
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Property Title</TableCell>
                        <TableCell>Address</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property._id} hover>
                          <TableCell>{property.title}</TableCell>
                          <TableCell>{property.address}</TableCell>
                          <TableCell>
                            <Chip 
                              label={property.available ? 'Available' : 'Occupied'}
                              color={property.available ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Button 
                              variant="contained" 
                              color="primary"
                              disabled={!property.available}
                              onClick={() => handleAddTenantClick(property)}
                              size="small"
                            >
                              {loading ? <CircularProgress size={24} /> : 'Add Tenant'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tenant Management Guidelines
                </Typography>
                <Box sx={{ backgroundColor: 'background.default', p: 2, borderRadius: 2 }}>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, listStyleType: 'disc' }}>
                    <li>Only add tenants to available properties</li>
                    <li>Ensure all property details are complete</li>
                    <li>Each property supports one active tenant</li>
                    <li>Tenant details can be modified later</li>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Tenant Dialog */}
        <Dialog 
          open={openAddTenantDialog} 
          onClose={() => setOpenAddTenantDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Tenant to {selectedProperty?.title}</DialogTitle>
          <DialogContent>
            {selectedProperty && (
              <AddTenantToProperty 
                propertyId={selectedProperty._id} 
                onTenantAdded={handleTenantAdded} 
                onError={handleTenantAddError}
                setLoading={setLoading}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Snackbar for Success/Error Message */}
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={handleSnackbarClose}
          message={snackbarMessage}
          severity={snackbarSeverity}
        />
      </Box>
    </MainLayout>
  );
};

export default ManageTenantsPage;
