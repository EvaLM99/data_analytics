import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA33FF", "#8884d8", "#82ca9d", "#ffc658"];

function LineChartView({ data, xKeysCombined, seriesNames }) {
  return (
    <LineChart width={700} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKeysCombined} />
      <YAxis />
      <Tooltip />
      <Legend />
      {seriesNames.map((name, i) => (
        <Line 
          key={`${name}-${i}`} 
          type="monotone" 
          dataKey={name} 
          stroke={COLORS[i % COLORS.length]} 
          strokeWidth={2} 
        />
      ))}
    </LineChart>
  );
}

export default LineChartView;