import React, { useEffect, useState } from 'react';
import { Typography, Paper, Button } from '@mui/material';
import PropertyTable from './PropertyTable';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const OwnerProperties = () => {
  const [properties, setProperties] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      const res = await api.get('/properties?owner=true');
      setProperties(res.data);
    };
    fetchProperties();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>My Properties</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => navigate('/add-property')}>
        Add New Property
      </Button>
      <Paper sx={{ p: 2 }}>
        <PropertyTable properties={properties} setProperties={setProperties} />
      </Paper>
    </>
  );
};

export default OwnerProperties;
