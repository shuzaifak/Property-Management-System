import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Box, 
  Stack 
} from '@mui/material';
import { 
  Home as HomeIcon, 
  AttachMoney as MoneyIcon, 
} from '@mui/icons-material';
import api from '../../utils/api';

const StatCard = ({ icon, title, value, color }) => (
  <Card 
    sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'space-between',
      background: `linear-gradient(135deg, ${color}80, ${color}20)`,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}
  >
    <CardContent>
      <Stack 
        direction="row" 
        alignItems="center" 
        justifyContent="space-between" 
        spacing={2}
      >
        <Box 
          sx={{ 
            color: color, 
            fontSize: 44, 
            opacity: 0.7,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {icon}
        </Box>
        <Stack alignItems="end">
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

const OwnerDashboard = () => {
  const [stats, setStats] = useState({
    propertyCount: 0,
    totalValue: 0,
    occupiedProperties: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/properties/owner');
        const properties = res.data;
        
        const totalValue = properties.reduce((sum, property) => 
          sum + (property.price || 0), 0);
        
        const occupiedProperties = properties.filter(p => p.isOccupied).length;

        setStats({
          propertyCount: properties.length,
          totalValue: totalValue.toLocaleString(),
          occupiedProperties
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, padding: 3 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          marginBottom: 3,
          fontWeight: 600,
          background: 'linear-gradient(45deg, #3f51b5, #2196f3)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}
      >
        Owner Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={<HomeIcon />} 
            title="Total Properties" 
            value={stats.propertyCount} 
            color="#3f51b5"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            icon={<MoneyIcon />} 
            title="Total Property Value" 
            value={`Rs.${stats.totalValue}`} 
            color="#ff9800"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OwnerDashboard;