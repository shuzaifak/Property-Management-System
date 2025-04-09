import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  CircularProgress, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Chip,
  Paper
} from '@mui/material';
import { 
  Download, 
  HomeWork, 
  Person, 
  DateRange, 
  MonetizationOn 
} from '@mui/icons-material';
import api from '../utils/api';
import MainLayout from '../layout/MainLayout';

const LeaseAgreementsPage = () => {
  const [leaseAgreements, setLeaseAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaseAgreements = async () => {
      try {
        setLoading(true);
        const response = await api.get('/leases/lease-agreements');
        
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid response format');
        }
        
        setLeaseAgreements(response.data);
        setError(null);
      } catch (error) {
        console.error('Detailed Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response) {
          switch (error.response.status) {
            case 401:
              setError('Unauthorized. Please log in again.');
              break;
            case 403:
              setError('You do not have permission to view lease agreements.');
              break;
            case 404:
              setError('No lease agreements found.');
              break;
            case 500:
              setError('Server error. Please try again later.');
              break;
            default:
              setError(error.response.data.message || 'Failed to fetch lease agreements');
          }
        } else if (error.request) {
          setError('No response from server. Please check your network connection.');
        } else {
          setError('Error setting up the request: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseAgreements();
  }, []);

  const handleDownloadAgreement = async (leaseId) => {
    try {
      // Generate lease agreement first
      await api.post(`/leases/create-agreement/${leaseId}`);
      
      // Then download the generated agreement
      const response = await api.get(`/leases/download-agreement/${leaseId}`, {
        responseType: 'blob'
      });

      // Create a blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `lease-agreement-${leaseId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download lease agreement');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'terminated': return 'error';
      case 'completed': return 'default';
      default: return 'primary';
    }
  };

  return (
    <MainLayout>
      <Box 
        sx={{ 
          p: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          minHeight: '100vh'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
           <Typography 
          variant="h3" 
          gutterBottom 
          sx={{ 
            marginBottom: 3,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Lease Agreements
        </Typography>

          {loading && (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress size={60} thickness={4} />
            </Box>
          )}

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2, 
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
              }}
            >
              {error}
            </Alert>
          )}

          {!loading && !error && leaseAgreements.length === 0 && (
            <Typography 
              variant="h6" 
              color="textSecondary" 
              align="center"
              sx={{ mt: 4 }}
            >
              No lease agreements found.
            </Typography>
          )}

          <Grid container spacing={4}>
            {leaseAgreements.map((lease) => (
              <Grid item xs={12} md={6} lg={4} key={lease._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    },
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)'
                  }}
                  elevation={6}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <HomeWork sx={{ color: '#3f51b5', mr: 1 }} />
                      <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        {lease.property?.address || 'Property Address'}
                      </Typography>
                      <Chip 
                        label={lease.status} 
                        color={getStatusVariant(lease.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}
                      />
                    </Box>

                    <Box display="flex" alignItems="center" mb={1}>
                      <Person sx={{ color: '#4caf50', mr: 1 }} />
                      <Typography variant="body1">
                        {lease.tenant?.name || 'Tenant Name'}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={1}>
                      <DateRange sx={{ color: '#ff9800', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <MonetizationOn sx={{ color: '#2196f3', mr: 1 }} />
                      <Typography variant="h6" color="primary">
                        Rs.{lease.rentAmount.toLocaleString()} / month
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      startIcon={<Download />}
                      onClick={() => handleDownloadAgreement(lease._id)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 8px rgba(0,0,0,0.3)'
                        }
                      }}
                    >
                      Download Agreement
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </MainLayout>
  );
};

export default LeaseAgreementsPage;