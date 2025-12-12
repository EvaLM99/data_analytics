import React from 'react';

function ColumnControl({ headers, columnKeys, isOpen, onToggle, onToggleKey }) {
  return (
    <div className="control-section">
      <div className="control-header" onClick={onToggle}>
        <span>📑 Colonnes</span>
        <span className={`control-arrow ${isOpen ? 'open' : ''}`}>▶</span>
      </div>
      {isOpen && (
        <div className="choices columns-choices">
          {headers.map(h => (
            <label key={h} className="choice">
              <input
                type="checkbox"
                checked={columnKeys.includes(h)}
                onChange={() => onToggleKey(h)}
              />
              <span>{h}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default ColumnControl;