import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', rent: 4000 },
  { month: 'Feb', rent: 3000 },
  { month: 'Mar', rent: 5000 },
  { month: 'Apr', rent: 7000 },
  { month: 'May', rent: 6000 },
];

const ChartCard = () => {
  return (
    <Card className="glass-card" sx={{ mt: 3, p: { xs: 1, sm: 2 } }}>
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary.light" sx={{ fontWeight: 700, mb: 3 }}>Monthly Rent Collection</Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3"/>
              <XAxis 
                dataKey="month" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                }} 
                itemStyle={{ color: '#60a5fa' }} 
              />
              <Line 
                type="monotone" 
                dataKey="rent" 
                stroke="#3b82f6" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartCard;
