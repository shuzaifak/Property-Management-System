import React, { useEffect, useState } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import api from '../../utils/api';

const OwnerDashboard = () => {
  const [stats, setStats] = useState({ propertyCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get('/properties?owner=true');
      const properties = res.data;
      setStats({ propertyCount: properties.length });
    };
    fetchStats();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Card>
        <CardContent>
          <Typography variant="subtitle1">Your Properties</Typography>
          <Typography variant="h5" fontWeight="bold">{stats.propertyCount}</Typography>
        </CardContent>
      </Card>
    </>
  );
};

export default OwnerDashboard;
