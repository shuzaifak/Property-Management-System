import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Chip, CircularProgress, Alert, InputAdornment, TextField,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  Avatar, Tooltip
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt';
import api from '../../utils/api';

const STATUS_COLORS = {
  completed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#10b981', border: 'rgba(16, 185, 129, 0.4)' },
  pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' },
  failed: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.4)' }
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payments');
      setPayments(res.data);
      setFiltered(res.data);
    } catch (err) {
      setError('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(payments.filter(p =>
      p.tenantId?.name?.toLowerCase().includes(q) ||
      p.tenantId?.email?.toLowerCase().includes(q) ||
      p.propertyId?.title?.toLowerCase().includes(q) ||
      p.transactionId?.toLowerCase().includes(q)
    ));
  }, [search, payments]);

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
          <PaymentsIcon sx={{ color: '#3b82f6', fontSize: { xs: 24, sm: 28 } }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ 
            fontWeight: 800, 
            fontSize: { xs: '1.5rem', sm: '2.125rem' } 
          }}>
            Payment History
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {filtered.length} total transaction{filtered.length !== 1 && 's'}
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search payments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ 
          mb: 3, 
          '& .MuiOutlinedInput-root': { 
            borderRadius: 3, 
            bgcolor: 'rgba(255,255,255,0.04)', 
            border: '1px solid rgba(255,255,255,0.08)' 
          } 
        }}
        InputProps={{ 
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'rgba(255,255,255,0.4)' }} />
            </InputAdornment>
          ) 
        }}
      />

      {/* Table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress sx={{ color: '#2563eb' }} /></Box>
      ) : (
        <TableContainer 
          component={Paper} 
          className="glass-card" 
          sx={{ 
            borderRadius: 4, 
            overflowX: 'auto',
            width: '100%',
            display: 'block'
          }}
        >
          <Table sx={{ minWidth: 800, tableLayout: 'auto' }}>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.2)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Tenant</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Property</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', borderBottom: '1px solid rgba(255,255,255,0.05)' }} align="right">Trx ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((p) => {
                const style = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
                return (
                  <TableRow key={p._id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1d4ed8', fontSize: '0.8rem', fontWeight: 600 }}>
                          {p.tenantId?.name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{p.tenantId?.name || 'Unknown'}</Typography>
                          <Typography variant="caption" color="textSecondary">{p.tenantId?.email}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="body2" fontWeight={600}>{p.propertyId?.title || 'Unknown Property'}</Typography>
                      <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: { xs: 100, sm: 150 }, display: 'block' }}>
                        {p.propertyId?.address}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Typography variant="body1" fontWeight={800} color="#60a5fa">
                        ${Number(p.amount).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{
                          bgcolor: style.bg, color: style.text, border: `1px solid ${style.border}`,
                          fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem'
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {p.transactionId ? (
                        <Tooltip title={`Transaction ID: ${p.transactionId}`}>
                          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                            <ReceiptIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                              ...{p.transactionId.slice(-6)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="textSecondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 'none' }}>
                    <Typography color="textSecondary">No payments found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Payments;
