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
  DialogContentText,
  DialogActions,
  Button,
  TableContainer,
  Paper,
  Tooltip
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  WarningAmber as WarningIcon
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
    <TableContainer component={Paper} elevation={0} sx={{ 
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'grey.300'
    }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ 
          backgroundColor: 'grey.100',
          borderBottom: '2px solid',
          borderBottomColor: 'primary.main'
        }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Address</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Price</TableCell>
            <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {properties.map((property) => (
            <TableRow 
              key={property._id} 
              hover 
              sx={{ 
                '&:last-child td, &:last-child th': { border: 0 },
                transition: 'background-color 0.2s',
                '&:hover': { 
                  backgroundColor: 'grey.50',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
                }
              }}
            >
              <TableCell>{property.title}</TableCell>
              <TableCell>{property.address}</TableCell>
              <TableCell align="right">
                ${property.price?.toLocaleString() || 'N/A'}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="Edit Property">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleEditProperty(property._id)}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Property">
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeletePrompt(property)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!deleteConfirmation}
        onClose={handleCancelDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningIcon color="error" sx={{ mr: 2 }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you absolutely sure you want to delete the property "{deleteConfirmation?.title}"? 
            This action cannot be undone and will permanently remove the property from your listings.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCancelDelete} 
            color="primary" 
            variant="outlined"
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Delete Property
          </Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default PropertyTable;