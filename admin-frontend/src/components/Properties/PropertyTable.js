import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const PropertyTable = ({ properties }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Address</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Owner Email</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {properties.map((p) => (
          <TableRow key={p._id}>
            <TableCell>{p.title}</TableCell>
            <TableCell>{p.address}</TableCell>
            <TableCell>{p.price}</TableCell>
            <TableCell>{p.ownerId?.email || 'N/A'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PropertyTable;
