import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const data = [
  { month: 'Jan', rent: 4000 },
  { month: 'Feb', rent: 3000 },
  { month: 'Mar', rent: 5000 },
  { month: 'Apr', rent: 7000 },
  { month: 'May', rent: 6000 },
];

const ChartCard = () => {
  return (
    <Card sx={{ bgcolor: 'white' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Monthly Rent Collection</Typography>
        <LineChart width={600} height={300} data={data}>
          <CartesianGrid stroke="#ccc"/>
          <XAxis dataKey="month"/>
          <YAxis/>
          <Tooltip />
          <Line type="monotone" dataKey="rent" stroke="#8884d8"/>
        </LineChart>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
