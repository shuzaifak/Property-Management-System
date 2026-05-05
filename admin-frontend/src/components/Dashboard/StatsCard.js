import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatsCard = ({ title, value }) => {
  return (
    <Card className="glass-card">
      <CardContent>
        <Typography variant="subtitle1" color="textSecondary">{title}</Typography>
        <Box mt={1}>
          <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(45deg, #3b82f6, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
