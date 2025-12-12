import React from 'react';
import { AGGREGATION_TYPES } from '../utils/aggregation';

function YAxisControl({ headers, yConfigs, isOpen, onToggle, onUpdate }) {
  const addYConfig = (column) => {
    onUpdate([...yConfigs, { column, agg: "Somme" }]);
  };

  const removeYConfig = (index) => {
    onUpdate(yConfigs.filter((_, i) => i !== index));
  };

  const updateYConfig = (index, updates) => {
    const newConfigs = [...yConfigs];
    newConfigs[index] = { ...newConfigs[index], ...updates };
    onUpdate(newConfigs);
  };

  return (
    <div className="control-section">
      <div className="control-header" onClick={onToggle}>
        <span>📈 Valeurs (Axe Y)</span>
        <span className={`control-arrow ${isOpen ? 'open' : ''}`}>▶</span>
      </div>

      {isOpen && yConfigs.map((cfg, idx) => (
        <div key={idx} className="y-config-item">
          <select 
            value={cfg.column} 
            onChange={e => updateYConfig(idx, { column: e.target.value })}
            className="y-config-select"
          >
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select 
            value={cfg.agg} 
            onChange={e => updateYConfig(idx, { agg: e.target.value })}
            className="y-config-agg-select"
          >
            {AGGREGATION_TYPES.map(a => <option key={a}>{a}</option>)}
          </select>
          <button 
            onClick={() => removeYConfig(idx)}
            className="btn-remove"
          >
            ✕
          </button>
        </div>
      ))}

      {isOpen && (
        <button 
          onClick={() => addYConfig(headers[0] || "")}
          className="btn-add-value"
        >
          ➕ Ajouter une valeur
        </button>
      )}
    </div>
  );
}

export default YAxisControl;