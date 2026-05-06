import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
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
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Snackbar,
  Alert,
  Divider,
  Avatar,
  IconButton
} from '@mui/material';
import { 
  Email as EmailIcon, 
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import AddTenantToProperty from '../components/AddTenanttoProperty';
import api from '../utils/api';

const ManageTenantsPage = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [openAddTenantDialog, setOpenAddTenantDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [detailTenant, setDetailTenant] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const fetchProperties = async () => {
    try {
      const response = await api.get('/properties/owner');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleAddTenantClick = (property) => {
    setSelectedProperty(property);
    setOpenAddTenantDialog(true);
  };

  const handleViewDetails = (property) => {
    if (property.activeLease) {
      setDetailTenant({
        ...property.activeLease.tenant,
        lease: property.activeLease,
        propertyTitle: property.title,
        address: property.address
      });
      setOpenDetailsDialog(true);
    }
  };

  const handleTenantAdded = (newTenant) => {
    fetchProperties();
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

  return (
    <MainLayout>
      <Box sx={{ px: { xs: 1, sm: 0 } }}>
        <Box sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" sx={{ 
              fontWeight: 900, 
              mb: 1, 
              background: 'linear-gradient(90deg, #f1f5f9 0%, #94a3b8 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.75rem', sm: '2.125rem' } 
            }}>
              Tenant Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Assign tenants to your properties and manage leases.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={9}>
            <Card className="glass-card" elevation={0} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 0 }}>
                <TableContainer sx={{ 
                  overflowX: 'auto',
                  width: '100%',
                  display: 'block'
                }}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                        <TableCell sx={{ fontWeight: 800, color: '#64748b', py: 2.5 }}>PROPERTY</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 800, color: '#64748b' }}>TENANT</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#64748b', pr: 4 }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {properties.map((property) => (
                        <TableRow key={property._id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                          <TableCell sx={{ py: 3 }}>
                            <Typography variant="subtitle1" fontWeight={700} color="#f1f5f9">{property.title}</Typography>
                            <Typography variant="caption" color="textSecondary">{property.address}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={property.available ? 'Available' : 'Occupied'}
                              sx={{ 
                                fontWeight: 700, 
                                bgcolor: property.available ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                color: property.available ? '#10b981' : '#3b82f6',
                                border: '1px solid',
                                borderColor: 'inherit'
                              }}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {property.activeLease?.tenant ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: '#3b82f6', fontSize: '0.9rem' }}>
                                  {property.activeLease.tenant.name.charAt(0)}
                                </Avatar>
                                <Typography variant="body2" sx={{ color: '#f1f5f9', fontWeight: 600 }}>
                                  {property.activeLease.tenant.name}
                                </Typography>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="textSecondary">No tenant assigned</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3 }}>
                            {property.available ? (
                              <Button 
                                variant="contained" 
                                size="small"
                                onClick={() => handleAddTenantClick(property)}
                                sx={{ borderRadius: 2, textTransform: 'none', px: 2, fontWeight: 700 }}
                              >
                                Add Tenant
                              </Button>
                            ) : (
                              <Button 
                                variant="outlined" 
                                size="small"
                                startIcon={<InfoIcon />}
                                onClick={() => handleViewDetails(property)}
                                sx={{ 
                                  borderRadius: 2, 
                                  textTransform: 'none', 
                                  px: 2, 
                                  borderColor: 'rgba(59, 130, 246, 0.5)',
                                  color: '#3b82f6',
                                  '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.05)', borderColor: '#3b82f6' }
                                }}
                              >
                                View Details
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={3}>
            <Card className="glass-card" elevation={0} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={800} gutterBottom sx={{ color: '#f1f5f9' }}>Quick Summary</Typography>
                <Divider sx={{ mb: 2, opacity: 0.1 }} />
                <Box sx={{ py: 1 }}>
                  <Typography variant="caption" color="textSecondary" display="block">Total Properties</Typography>
                  <Typography variant="h4" fontWeight={900} color="#f1f5f9" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{properties.length}</Typography>
                </Box>
                <Box sx={{ py: 1 }}>
                  <Typography variant="caption" color="textSecondary" display="block">Active Tenants</Typography>
                  <Typography variant="h4" fontWeight={900} color="#3b82f6" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{properties.filter(p => !p.available).length}</Typography>
                </Box>
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(59, 130, 246, 0.1)', borderRadius: 2, border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <Typography variant="body2" sx={{ color: '#93c5fd', lineHeight: 1.5 }}>
                    You can manage lease agreements and view payment history from the sidebar.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Details Dialog */}
        <Dialog 
          open={openDetailsDialog} 
          onClose={() => setOpenDetailsDialog(false)}
          PaperProps={{
            sx: { borderRadius: 4, bgcolor: '#0f172a', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }
          }}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Tenant Details
            <IconButton onClick={() => setOpenDetailsDialog(false)} sx={{ color: '#94a3b8' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pb: 4 }}>
            {detailTenant && (
              <Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ width: 80, height: 80, bgcolor: '#3b82f6', mb: 2, fontSize: '2rem' }}>
                    {detailTenant.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h5" fontWeight={800}>{detailTenant.name}</Typography>
                  <Typography variant="body2" color="textSecondary">Active Tenant</Typography>
                </Box>

                <Divider sx={{ mb: 3, opacity: 0.1 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <EmailIcon sx={{ color: '#64748b' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block">Email Address</Typography>
                      <Typography variant="body2" fontWeight={600}>{detailTenant.email}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <HomeIcon sx={{ color: '#64748b' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block">Resident At</Typography>
                      <Typography variant="body2" fontWeight={600}>{detailTenant.propertyTitle}</Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8' }}>{detailTenant.address}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <CalendarIcon sx={{ color: '#64748b' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block">Lease Term</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {new Date(detailTenant.lease.startDate).toLocaleDateString()} - {new Date(detailTenant.lease.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <MoneyIcon sx={{ color: '#64748b' }} />
                    <Box>
                      <Typography variant="caption" color="textSecondary" display="block">Monthly Rent</Typography>
                      <Typography variant="h6" fontWeight={800} sx={{ color: '#10b981' }}>
                        ${detailTenant.lease.rentAmount}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Tenant Dialog */}
        <Dialog 
          open={openAddTenantDialog} 
          onClose={() => setOpenAddTenantDialog(false)}
          PaperProps={{ sx: { borderRadius: 4, bgcolor: '#0f172a', color: '#f1f5f9' } }}
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
              />
            )}
          </DialogContent>
        </Dialog>

        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={6000} 
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity={snackbarSeverity} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
};

export default ManageTenantsPage;
