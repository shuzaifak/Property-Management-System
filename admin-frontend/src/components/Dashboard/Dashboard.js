import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import StatsCard from './StatsCard';
import ChartCard from './ChartCard';
import api from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ propertyCount: 0, tenantCount: 0, totalPayments: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    };
    fetchStats();
  }, []);

  return (
    <>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <StatsCard title="Properties" value={stats.propertyCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard title="Active Tenants" value={stats.tenantCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatsCard title="Total Payments" value={`$${stats.totalPayments}`} />
        </Grid>
        <Grid item xs={12}>
          <ChartCard />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
