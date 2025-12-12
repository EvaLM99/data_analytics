import React from 'react';

function ScatterChartControl({ 
  headers, 
  scatterConfig = {}, 
  isXOpen,
  isYOpen,
  isSeriesOpen,
  onToggleX,
  onToggleY,
  onToggleSeries,
  onUpdate 
}) {
  const {
    xConfig = null,
    yConfig = null,
    seriesKeys = []
  } = scatterConfig;

  const setXConfig = (column) => {
    onUpdate({ 
      xConfig: { column } 
    });
  };

  const setYConfig = (column) => {
    onUpdate({ 
      yConfig: { column } 
    });
  };

  const clearXConfig = () => {
    onUpdate({ xConfig: null });
  };

  const clearYConfig = () => {
    onUpdate({ yConfig: null });
  };

  const toggleSeriesKey = (key) => {
    const newKeys = seriesKeys.includes(key) 
      ? seriesKeys.filter(k => k !== key)
      : [...seriesKeys, key];
    onUpdate({ seriesKeys: newKeys });
  };

  return (
    <div className="scatter-chart-controls">
      {/* AXE X */}
      <div className="control-section">
        <div className="control-header" onClick={onToggleX}>
          <span>📊 Axe X (obligatoire - valeurs numériques)</span>
          <span className={`control-arrow ${isXOpen ? 'open' : ''}`}>▶</span>
        </div>
        {isXOpen && (
          <div className="scatter-axis-config">
            {xConfig ? (
              <div className="y-config-item">
                <select 
                  value={xConfig.column} 
                  onChange={e => setXConfig(e.target.value)}
                  className="y-config-select"
                >
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <button 
                  onClick={clearXConfig}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="scatter-add-axis">
                <select 
                  onChange={e => e.target.value && setXConfig(e.target.value)}
                  className="y-config-select"
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner un champ...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            )}
            <p className="control-hint">
              💡 Choisir une colonne avec des valeurs numériques (ex: Prix, Quantité)
            </p>
          </div>
        )}
      </div>

      {/* AXE Y */}
      <div className="control-section">
        <div className="control-header" onClick={onToggleY}>
          <span>📈 Axe Y (obligatoire - valeurs numériques)</span>
          <span className={`control-arrow ${isYOpen ? 'open' : ''}`}>▶</span>
        </div>
        {isYOpen && (
          <div className="scatter-axis-config">
            {yConfig ? (
              <div className="y-config-item">
                <select 
                  value={yConfig.column} 
                  onChange={e => setYConfig(e.target.value)}
                  className="y-config-select"
                >
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <button 
                  onClick={clearYConfig}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="scatter-add-axis">
                <select 
                  onChange={e => e.target.value && setYConfig(e.target.value)}
                  className="y-config-select"
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner un champ...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            )}
            <p className="control-hint">
              💡 Choisir une colonne avec des valeurs numériques (ex: Chiffre d'affaires, Score)
            </p>
          </div>
        )}
      </div>

      {/* SÉRIES (optionnel) */}
      <div className="control-section">
        <div className="control-header" onClick={onToggleSeries}>
          <span>🎨 Séries (optionnel - séparer les points par couleur)</span>
          <span className={`control-arrow ${isSeriesOpen ? 'open' : ''}`}>▶</span>
        </div>
        {isSeriesOpen && (
          <>
            <div className="choices">
              {headers.map(h => (
                <label key={h} className="choice">
                  <input
                    type="checkbox"
                    checked={seriesKeys.includes(h)}
                    onChange={() => toggleSeriesKey(h)}
                  />
                  {h}
                </label>
              ))}
            </div>
            <p className="control-hint">
              💡 Ex: Région → une couleur par région, Catégorie → une couleur par catégorie
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ScatterChartControl;