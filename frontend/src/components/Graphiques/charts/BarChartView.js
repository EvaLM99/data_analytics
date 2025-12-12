import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA33FF", "#8884d8", "#82ca9d", "#ffc658"];

function BarChartView({ data, xKeysCombined, seriesNames }) {
  return (
    <BarChart width={700} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKeysCombined} />
      <YAxis />
      <Tooltip />
      <Legend />
      {seriesNames.map((name, i) => (
        <Bar 
          key={`${name}-${i}`} 
          dataKey={name} 
          fill={COLORS[i % COLORS.length]} 
        />
      ))}
    </BarChart>
  );
}

export default BarChartView;