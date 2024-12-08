import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value }) => {
  return (
    <Card sx={{ bgcolor: 'white' }}>
      <CardContent>
        <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
        <Box mt={1}>
          <Typography variant="h5" fontWeight="bold">{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
