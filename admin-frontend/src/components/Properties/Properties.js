import React, { useEffect, useState } from 'react';
import { Typography, Paper } from '@mui/material';
import PropertyTable from './PropertyTable';
import api from '../../utils/api';

const Properties = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      const res = await api.get('/properties');
      setProperties(res.data);
    };
    fetchProperties();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>Properties</Typography>
      <Paper sx={{ p: 2 }}>
        <PropertyTable properties={properties} />
      </Paper>
    </>
  );
};

export default Properties;
