import React, { useState } from 'react';
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  IconButton, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TableContainer,
  Paper,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PropertyTable = ({ properties, setProperties }) => {
  const navigate = useNavigate();
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);

  const handleEditProperty = (id) => {
    if (!id) {
      console.error('Invalid property ID');
      return;
    }
    navigate(`/add-property?id=${id}`);
  };

  const handleDeletePrompt = (property) => {
    if (!property || !property._id) {
      console.error('Invalid property');
      return;
    }
    setDeleteConfirmation(property);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation?._id) {
      console.error('No property selected for deletion');
      return;
    }

    try {
      await api.delete(`/properties/${deleteConfirmation._id}`);
      setProperties(props => props.filter(p => p._id !== deleteConfirmation._id));
      setDeleteConfirmation(null);
    } catch (err) {
      console.error('Delete failed', err.message);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation(null);
  };

  return (
    <TableContainer component={Paper} className="glass-panel" elevation={0} sx={{ border: 'none', overflowX: 'auto' }}>
      <Table sx={{ minWidth: { xs: 500, sm: 650 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Address</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Price</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 1 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {properties.map((property) => (
            <TableRow 
              key={property._id} 
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.02)' },
                transition: 'background-color 0.2s'
              }}
            >
              <TableCell sx={{ fontWeight: 600 }}>{property.title}</TableCell>
              <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>{property.address}</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#60a5fa' }}>
                Rs.{property.price?.toLocaleString() || 'N/A'}
              </TableCell>
              <TableCell align="center">
                <Box display="flex" justifyContent="center" gap={1}>
                  <Tooltip title="Edit Property">
                    <IconButton 
                      onClick={() => handleEditProperty(property._id)}
                      sx={{ color: '#00b4d8', bgcolor: 'rgba(0,180,216,0.1)', '&:hover': { bgcolor: 'rgba(0,180,216,0.2)' } }}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Property">
                    <IconButton 
                      onClick={() => handleDeletePrompt(property)}
                      sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' } }}
                      size="small"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!deleteConfirmation}
        onClose={handleCancelDelete}
        PaperProps={{ sx: { background: 'rgba(18, 18, 24, 0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 4 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>⚠ Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#f1f5f9' }}>
            Are you sure you want to delete <strong>{deleteConfirmation?.title}</strong>? 
            This will permanently remove the property from your listings.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCancelDelete} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained"
            color="error"
            sx={{ px: 3 }}
          >
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default PropertyTable;