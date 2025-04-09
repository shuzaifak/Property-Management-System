import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  CircularProgress,
  Alert,
  Box
} from '@mui/material';
import { 
  Download, 
  HomeWork, 
  DateRange, 
  MonetizationOn 
} from '@mui/icons-material';
import api from '../services/api';

const LeaseAgreementsPage = () => {
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadInProgress, setDownloadInProgress] = useState(false);

  useEffect(() => {
    fetchCurrentLease();
  }, []);

  const fetchCurrentLease = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/leases/current');
      setLease(response.data);
    } catch (error) {
      console.error('Error fetching lease:', error);
      
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError('Unauthorized. Please log in again.');
            break;
          case 403:
            setError('You do not have permission to view this lease.');
            break;
          case 404:
            setError('No active lease found.');
            break;
          case 500:
            setError('Server error. Please try again later.');
            break;
          default:
            setError(error.response.data.message || 'Failed to fetch lease');
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

  const handleDownloadAgreement = async () => {
    try {
      setDownloadInProgress(true);
      setError(null);

      // First, generate the lease agreement
      await api.post(`/leases/create-agreement/${lease._id}`);
      
      // Then download the generated agreement
      const response = await api.get(`/leases/download-agreement/${lease._id}`, {
        responseType: 'blob'
      });

      // Create a blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `lease-agreement-${lease._id}.pdf`;
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download lease agreement');
    } finally {
      setDownloadInProgress(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={fetchCurrentLease}
        >
          Retry Loading
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Current Lease Agreement
      </Typography>

      {lease ? (
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <HomeWork sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="subtitle1" color="text.secondary">
                    Property Address
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {lease.property?.address || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <DateRange sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="subtitle1" color="text.secondary">
                    Lease Period
                  </Typography>
                </Box>
                <Typography variant="body1">
                  {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <MonetizationOn sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="subtitle1" color="text.secondary">
                    Monthly Rent
                  </Typography>
                </Box>
                <Typography variant="body1">
                  £{lease.rentAmount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="text.secondary">
                  Lease Status
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 
                      lease.status === 'active' ? 'success.main' : 
                      lease.status === 'pending' ? 'warning.main' : 
                      'error.main'
                  }}
                >
                  {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleDownloadAgreement}
                  disabled={downloadInProgress}
                  startIcon={downloadInProgress ? <CircularProgress size={20} /> : <Download />}
                  fullWidth
                >
                  {downloadInProgress ? 'Downloading...' : 'Download Lease Agreement'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="info">No active lease found.</Alert>
      )}
    </Container>
  );
};

export default LeaseAgreementsPage;