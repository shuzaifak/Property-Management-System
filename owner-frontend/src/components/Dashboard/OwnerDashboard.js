import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Box, 
  Stack,
  CircularProgress
} from '@mui/material';
import { 
  Home as HomeIcon, 
  AttachMoney as MoneyIcon, 
  People as PeopleIcon
} from '@mui/icons-material';
import api from '../../utils/api';

const StatCard = ({ icon, title, value, color }) => (
  <Card className="glass-card" sx={{ height: '100%', border: 'none' }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 2, 
            bgcolor: `${color}15`, 
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle1" color="textSecondary" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #f1f5f9, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    propertyCount: 0,
    totalValue: 0,
    occupiedProperties: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/properties/owner');
        const properties = res.data;
        
        const totalValue = properties.reduce((sum, property) => 
          sum + (property.price || 0), 0);
        
        const occupiedCount = properties.filter(p => !p.available).length;

        setStats({
          propertyCount: properties.length,
          totalValue: totalValue.toLocaleString(),
          occupiedProperties: occupiedCount
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress sx={{ color: '#3b82f6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box mb={4}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>Dashboard Overview</Typography>
        <Typography variant="body1" color="textSecondary">Welcome back to your property management console.</Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={<HomeIcon />} 
            title="Total Properties" 
            value={stats.propertyCount} 
            color="#3b82f6"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={<PeopleIcon />} 
            title="Occupied Units" 
            value={stats.occupiedProperties} 
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={<MoneyIcon />} 
            title="Monthly Revenue" 
            value={`Rs.${stats.totalValue}`} 
            color="#f59e0b"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;