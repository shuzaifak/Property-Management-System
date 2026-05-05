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
    <Card className="glass-card" sx={{ mt: 3, p: 1 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary.light">Monthly Rent Collection</Typography>
        <LineChart width={600} height={300} data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3"/>
          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
          <YAxis stroke="rgba(255,255,255,0.5)" />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,10,0.8)', borderColor: '#2563eb' }} itemStyle={{ color: '#60a5fa' }} />
          <Line type="monotone" dataKey="rent" stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#1d4ed8', strokeWidth: 2 }} activeDot={{ r: 8 }} />
        </LineChart>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
