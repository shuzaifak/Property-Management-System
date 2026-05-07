import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Alert, 
  Card, 
  CardContent, 
  Button, 
  Grid,
  Chip,
  Paper,
  Stack,
  Divider,
  Avatar,
  CircularProgress
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Person as PersonIcon, 
  Description as DescriptionIcon,
  Verified as VerifiedIcon
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
        setLeaseAgreements(Array.isArray(response.data) ? response.data : []);
        setError(null);
      } catch (error) {
        console.error('Fetch Error:', error);
        setError('Failed to fetch lease agreements. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaseAgreements();
  }, []);

  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const handleDownloadAgreement = async (leaseId) => {
    try {
      setDownloadingIds(prev => new Set(prev).add(leaseId));
      const response = await api.get(`/leases/download-agreement/${leaseId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Lease_Agreement_${leaseId}.pdf`;
      link.click();
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download lease agreement');
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(leaseId);
        return next;
      });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'terminated': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ width: '100%', mt: 10, px: 3 }}>
          <LinearProgress sx={{ borderRadius: 5, height: 6 }} />
          <Typography variant="body2" align="center" sx={{ mt: 2, color: '#94a3b8' }}>
            Preparing legal documents...
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ p: { xs: 2, sm: 4 } }}>
        {/* Header Section */}
        <Box mb={4} sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'flex-end' },
          gap: 2
        }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              mb: 1, 
              background: 'linear-gradient(90deg, #f1f5f9 0%, #94a3b8 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.75rem', sm: '3rem' }
            }}>
              Lease Repository
            </Typography>
            <Typography variant="body1" sx={{ color: '#94a3b8', fontSize: { xs: '0.9rem', sm: '1rem' } }}>Access and manage all formal tenant-landlord agreements.</Typography>
          </Box>
          <Box className="glass-card" sx={{ p: 1, px: 2, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedIcon sx={{ color: '#10b981' }} />
            <Typography variant="caption" sx={{ color: '#f1f5f9', fontWeight: 700 }}>{leaseAgreements.length} SECURED CONTRACTS</Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>}

        {leaseAgreements.length === 0 && !loading && (
          <Paper className="glass-panel" sx={{ p: 10, textAlign: 'center', borderRadius: 5 }}>
            <DescriptionIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.05)', mb: 2 }} />
            <Typography variant="h5" sx={{ color: '#64748b', fontWeight: 700 }}>No agreements found</Typography>
            <Typography variant="body2" sx={{ color: '#475569', mt: 1 }}>Agreements will appear here once properties are occupied.</Typography>
          </Paper>
        )}

        <Grid container spacing={3}>
          {leaseAgreements.map((lease) => (
            <Grid item xs={12} md={6} lg={4} key={lease._id}>
              <Card 
                className="glass-card card-hover"
                sx={{ 
                  height: '100%', 
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'visible'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Status Badge */}
                  <Box sx={{ position: 'absolute', top: -12, right: 20 }}>
                    <Chip 
                      label={lease.status} 
                      size="small"
                      sx={{ 
                        bgcolor: getStatusColor(lease.status),
                        color: '#fff',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        fontSize: '0.65rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      }}
                    />
                  </Box>

                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700 }}>Property Address</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#f1f5f9', mt: 0.5, lineHeight: 1.3 }}>
                        {lease.property?.address}
                      </Typography>
                    </Box>

                    <Divider sx={{ opacity: 0.05 }} />

                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>TENANT</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#f1f5f9' }}>{lease.tenant?.name}</Typography>
                      </Box>
                    </Box>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>START DATE</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#cbd5e1' }}>{formatDate(lease.startDate)}</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>MONTHLY RENT</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#10b981' }}>${lease.rentAmount.toLocaleString()}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Button
                      fullWidth
                      variant="contained"
                      disabled={downloadingIds.has(lease._id)}
                      startIcon={downloadingIds.has(lease._id) ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                      onClick={() => handleDownloadAgreement(lease._id)}
                      sx={{
                        mt: 2,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      {downloadingIds.has(lease._id) ? 'Generating Document...' : 'Download PDF Agreement'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </MainLayout>
  );
};

const LinearProgress = ({ sx }) => (
  <Box sx={{ width: '100%', bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, overflow: 'hidden', ...sx }}>
    <Box sx={{ width: '30%', height: '100%', bgcolor: '#3b82f6', animation: 'loading 1.5s infinite ease-in-out' }} />
    <style>{`
      @keyframes loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(400%); }
      }
    `}</style>
  </Box>
);

export default LeaseAgreementsPage;