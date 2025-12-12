import React from 'react';

function ChartTypeSelector({ chartType, onChange }) {
  return (
    <label className="chart-type-label">
      Type :
      <select value={chartType} onChange={e => onChange(e.target.value)}>
        <option value="line">Courbes</option>
        <option value="bar">Barres</option>
        <option value="pie">Camembert</option>
        <option value="tcd">Tableau croisé dynamique</option>
      </select>
    </label>
  );
}

export default ChartTypeSelector;