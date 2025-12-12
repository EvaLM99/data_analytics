import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA33FF", "#8884d8", "#82ca9d", "#ffc658"];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const RADIAN = Math.PI / 180;
  
  if (cx == null || cy == null || innerRadius == null || outerRadius == null) {
    return null;
  }
  
  // N'afficher que si le pourcentage est significatif (> 3%)
  if ((percent ?? 0) < 0.03) return null;
  
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const ncx = Number(cx);
  const ncy = Number(cy);
  const x = ncx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = ncy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > ncx ? 'start' : 'end'} 
      dominantBaseline="central"
      style={{ fontSize: '14px', fontWeight: 'bold' }}
    >
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom Tooltip pour afficher les détails et tooltips supplémentaires
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="pie-custom-tooltip">
      {data.isTotal ? (
        <>
          <p className="tooltip-label">Total</p>
          <p className="tooltip-value">
            <strong>Valeur:</strong> {data.value.toLocaleString()}
          </p>
        </>
      ) : (
        <>
          <p className="tooltip-label">{data.detailName || data.name}</p>
          {data.legendName && (
            <p className="tooltip-legend">
              <strong>└─</strong> {data.legendName}
            </p>
          )}
          <p className="tooltip-value">
            <strong>Valeur:</strong> {data.value.toLocaleString()}
          </p>
          {data.count && (
            <p className="tooltip-count">
              <strong>Lignes:</strong> {data.count}
            </p>
          )}
          
          {/* Afficher les tooltips supplémentaires */}
          {data.tooltips && Object.keys(data.tooltips).length > 0 && (
            <div className="tooltip-section">
              {Object.entries(data.tooltips).map(([key, value]) => (
                <p key={key} className="tooltip-info">
                  <strong>{key}:</strong> {value}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

function PieChartView({ data }) {
  if (!data || data.length === 0) {
    return <p>Configurez les valeurs pour afficher le camembert</p>;
  }

  return (
    <PieChart width={700} height={400}>
      <Pie
        data={data}
        label={renderCustomizedLabel}
        labelLine={false}
        fill="#8884d8"
        dataKey="value"
        nameKey="name"
        isAnimationActive={true}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend
        layout="vertical"
        verticalAlign="middle"
        align="right"
      />
    </PieChart>
  );
}

export default PieChartView;