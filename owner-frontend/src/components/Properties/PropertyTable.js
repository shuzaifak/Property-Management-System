import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PropertyTable = ({ properties, setProperties }) => {
  const navigate = useNavigate();

  const handleDelete = async (id) => {
    try {
      await api.delete(`/properties/${id}`);
      setProperties(props => props.filter(p => p._id !== id));
    } catch (err) {
      console.error('Delete failed', err.message);
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Address</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {properties.map((p) => (
          <TableRow key={p._id}>
            <TableCell>{p.title}</TableCell>
            <TableCell>{p.address}</TableCell>
            <TableCell>{p.price}</TableCell>
            <TableCell>
              <IconButton onClick={() => navigate(`/add-property?id=${p._id}`)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(p._id)} color="error">
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PropertyTable;
