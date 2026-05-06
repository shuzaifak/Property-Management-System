import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Chip, Avatar, Dialog, DialogTitle, DialogContent,
  IconButton, CircularProgress, Alert, InputAdornment, TextField,
  Grid, Divider, Tooltip, Stack, Button, DialogActions
} from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import api from '../../utils/api';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/properties');
      setProperties(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError('Failed to load properties.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(properties.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.address?.toLowerCase().includes(q) ||
      p.ownerId?.email?.toLowerCase().includes(q) ||
      p.activeLease?.tenant?.name?.toLowerCase().includes(q) ||
      p.activeLease?.tenant?.email?.toLowerCase().includes(q)
    ));
  }, [search, properties]);

  const openDeleteDialog = (e, property) => {
    e.stopPropagation();
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!propertyToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/properties/${propertyToDelete._id}`);
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
      fetchProperties();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete property.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 0 } }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2, 
        mb: 4 
      }}>
        <Box sx={{ p: 1.5, borderRadius: 3, background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(37,99,235,0.3)' }}>
          <HomeWorkIcon sx={{ color: '#3b82f6', fontSize: { xs: 24, sm: 28 } }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 800, 
            fontSize: { xs: '1.5rem', sm: '2.125rem' } 
          }}>
            Property Oversight
          </Typography>
          <Typography variant="body2" color="textSecondary">{filtered.length} total properties monitored</Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search by title, address, owner or tenant..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' } }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'rgba(255,255,255,0.4)' }} /></InputAdornment> }}
      />

      {/* Properties Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#3b82f6' }} /></Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2.5 }}>
          {filtered.map((p) => (
            <Box key={p._id} className="glass-card" sx={{ overflow: 'hidden', cursor: 'pointer', '&:hover .prop-img': { transform: 'scale(1.05)' } }} onClick={() => setSelected(p)}>
              {/* Image */}
              <Box sx={{ height: 180, overflow: 'hidden', position: 'relative', bgcolor: 'rgba(255,255,255,0.03)' }}>
                {p.images?.[0] ? (
                  <Box component="img" className="prop-img" src={`http://localhost:5000${p.images[0]}`} alt={p.title}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
                ) : (
                  <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                    <HomeWorkIcon sx={{ fontSize: 64, color: 'rgba(255,255,255,0.1)' }} />
                  </Box>
                )}
                <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                  <Chip
                    icon={p.available ? <CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} /> : <CancelIcon sx={{ fontSize: '0.9rem !important' }} />}
                    label={p.available ? 'Available' : 'Occupied'}
                    size="small"
                    sx={{
                      bgcolor: p.available ? 'rgba(0,245,212,0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: p.available ? '#3b82f6' : '#f87171',
                      border: `1px solid ${p.available ? 'rgba(0,245,212,0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                      fontWeight: 600, backdropFilter: 'blur(4px)'
                    }}
                  />
                </Box>
              </Box>

              {/* Info */}
              <Box sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} noWrap mb={0.5}>{p.title}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                  <LocationOnIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
                  <Typography variant="body2" color="textSecondary" noWrap sx={{ fontSize: '0.8rem' }}>{p.address}</Typography>
                </Stack>

                <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AttachMoneyIcon sx={{ color: '#60a5fa', fontSize: 20 }} />
                    <Typography fontWeight={800} sx={{ fontSize: '1.1rem', color: '#60a5fa' }}>
                      {Number(p.price).toLocaleString()}
                      <Typography component="span" variant="caption" color="textSecondary"> /mo</Typography>
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="Delete Property">
                      <IconButton 
                        size="small" 
                        onClick={(e) => openDeleteDialog(e, p)}
                        sx={{ color: '#f87171', bgcolor: 'rgba(239, 68, 68, 0.1)', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Details">
                      <IconButton size="small" sx={{ color: '#3b82f6', bgcolor: 'rgba(59, 130, 246, 0.1)', '&:hover': { bgcolor: 'rgba(59, 130, 246, 0.2)' } }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {p.activeLease?.tenant ? (
                  <Box display="flex" alignItems="center" gap={1} mt={2} pt={2} sx={{ borderTop: '1px solid rgba(16, 185, 129, 0.1)' }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#10b981', fontSize: '0.7rem', fontWeight: 800 }}>
                      {p.activeLease.tenant.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="#10b981" fontWeight={700} display="block">Occupied by {p.activeLease.tenant.name}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap={1} mt={2} pt={2} sx={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: '#2563eb', fontSize: '0.7rem' }}>
                      {p.ownerId?.name?.[0]?.toUpperCase() || <PersonIcon sx={{ fontSize: 14 }} />}
                    </Avatar>
                    <Typography variant="caption" color="textSecondary" noWrap>Owned by {p.ownerId?.email}</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: 'rgba(12, 12, 18, 0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4 } }}>
        {selected && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 0 }}>
              <Typography variant="h5" fontWeight={800}>{selected.title}</Typography>
              <IconButton onClick={() => setSelected(null)} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ pt: '16px !important' }}>
              {/* Images row */}
              {selected.images?.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3, overflow: 'auto', pb: 1 }}>
                  {selected.images.map((img, i) => (
                    <Box key={i} component="img" src={`http://localhost:5000${img}`} alt={`img-${i}`}
                      sx={{ height: 180, minWidth: 280, borderRadius: 3, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }} />
                  ))}
                </Box>
              )}

              <Grid container spacing={3}>
                {/* Left column */}
                <Grid item xs={12} md={6}>
                  <Box className="glass-card" sx={{ p: 2.5, mb: 2, '&:hover': { transform: 'none' } }}>
                    <Typography variant="overline" color="textSecondary" sx={{ letterSpacing: 2 }}>Property Details</Typography>
                    <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="flex-start" gap={1.5}>
                        <LocationOnIcon sx={{ color: '#3b82f6', mt: 0.2 }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Address</Typography>
                          <Typography variant="body2" fontWeight={600}>{selected.address}</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <AttachMoneyIcon sx={{ color: '#60a5fa' }} />
                        <Box>
                          <Typography variant="caption" color="textSecondary">Monthly Rent</Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#60a5fa' }}>${Number(selected.price).toLocaleString()}</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        {selected.available
                          ? <CheckCircleIcon sx={{ color: '#60a5fa' }} />
                          : <CancelIcon sx={{ color: '#f87171' }} />}
                        <Box>
                          <Typography variant="caption" color="textSecondary">Status</Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ color: selected.available ? '#60a5fa' : '#f87171' }}>
                            {selected.available ? 'Available' : 'Occupied'}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>

                  {selected.activeLease && (
                    <Box className="glass-card" sx={{ p: 2.5, border: '1px solid rgba(16, 185, 129, 0.2)', '&:hover': { transform: 'none' } }}>
                      <Typography variant="overline" sx={{ color: '#10b981', letterSpacing: 2 }}>Current Tenant Info</Typography>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(16, 185, 129, 0.1)' }} />
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: '#10b981', fontWeight: 800 }}>
                          {selected.activeLease.tenant?.name?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={700}>{selected.activeLease.tenant?.name}</Typography>
                          <Typography variant="body2" color="textSecondary">{selected.activeLease.tenant?.email}</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1.5} mt={2}>
                        <CalendarMonthIcon sx={{ color: '#64748b', fontSize: 20 }} />
                        <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                          Lease active since {new Date(selected.activeLease.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Grid>

                {/* Right column */}
                <Grid item xs={12} md={6}>
                  {selected.ownerId && (
                    <Box className="glass-card" sx={{ p: 2.5, mb: 2, '&:hover': { transform: 'none' } }}>
                      <Typography variant="overline" color="textSecondary" sx={{ letterSpacing: 2 }}>Owner Info</Typography>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ width: 48, height: 48, bgcolor: '#2563eb', fontWeight: 700 }}>
                          {selected.ownerId.name?.[0]?.toUpperCase() || 'O'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={700}>{selected.ownerId.name}</Typography>
                          <Typography variant="body2" color="textSecondary">{selected.ownerId.email}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {selected.description && (
                    <Box className="glass-card" sx={{ p: 2.5, '&:hover': { transform: 'none' } }}>
                      <Typography variant="overline" color="textSecondary" sx={{ letterSpacing: 2 }}>Description</Typography>
                      <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
                      <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.8 }}>{selected.description}</Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { background: 'rgba(12, 12, 18, 0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, maxWidth: 450 } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#f87171', fontWeight: 800 }}>
          <WarningAmberIcon /> Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{propertyToDelete?.title}</strong>?
          </Typography>
          
          {!propertyToDelete?.available && (
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', mb: 2 }}>
              <Typography variant="body2" color="#fbbf24" fontWeight={600} display="flex" alignItems="center" gap={1}>
                <WarningAmberIcon fontSize="small" /> WARNING: OCCUPIED PROPERTY
              </Typography>
              <Typography variant="caption" color="rgba(255,255,255,0.6)" sx={{ mt: 1, display: 'block' }}>
                This property has an active lease. Deleting it will automatically terminate the lease and remove the tenant's current lease reference. This action cannot be undone.
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="textSecondary">
            This will permanently remove the property listing and all associated images from the server.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            disabled={deleting} 
            variant="contained" 
            color="error"
            sx={{ px: 3, background: 'linear-gradient(135deg, #ef4444, #f87171)' }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete Property'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Properties;
