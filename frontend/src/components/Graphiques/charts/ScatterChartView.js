import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA33FF", "#8884d8", "#82ca9d", "#ffc658"];

function ScatterChartView({ scatterData, xAxisLabel, yAxisLabel }) {
  if (!scatterData || scatterData.length === 0) {
    return <p>Configurez les axes X et Y pour afficher le nuage de points</p>;
  }

  return (
    <ScatterChart width={700} height={400} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis 
        type="number" 
        dataKey="x" 
        name={xAxisLabel || "Axe X"}
        label={{ value: xAxisLabel || "Axe X", position: 'insideBottom', offset: -10 }}
      />
      <YAxis 
        type="number" 
        dataKey="y" 
        name={yAxisLabel || "Axe Y"}
        label={{ value: yAxisLabel || "Axe Y", angle: -90, position: 'insideLeft' }}
      />
      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
      <Legend />
      {scatterData.map((series, index) => (
        <Scatter 
          key={series.name} 
          name={series.name} 
          data={series.data} 
          fill={COLORS[index % COLORS.length]}
        />
      ))}
    </ScatterChart>
  );
}

export default ScatterChartView;