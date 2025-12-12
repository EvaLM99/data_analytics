import React from 'react';

function XAxisControl({ headers, xKeys, isOpen, onToggle, onToggleKey }) {
  return (
    <div className="control-section">
      <div className="control-header" onClick={onToggle}>
        <span>📊 Lignes (Axe X)</span>
        <span className={`control-arrow ${isOpen ? 'open' : ''}`}>▶</span>
      </div>
      {isOpen && (
        <div className="choices">
          {headers.map(h => (
            <label key={h} className="choice">
              <input
                type="checkbox"
                checked={xKeys.includes(h)}
                onChange={() => onToggleKey(h)}
              />
              {h}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default XAxisControl;