import React from 'react';
import { AGGREGATION_TYPES } from '../utils/aggregation';

function PieChartControl({ 
  headers, 
  pieConfig = {}, 
  isValueOpen,
  isDetailsOpen,
  isLegendOpen,
  isTooltipsOpen,
  onToggleValue,
  onToggleDetails,
  onToggleLegend,
  onToggleTooltips,
  onUpdate 
}) {
  const {
    valueConfig = null,
    detailKeys = [],
    legendKeys = [],
    tooltipKeys = []
  } = pieConfig;

  const toggleKey = (keyArray, key, field) => {
    const newKeys = keyArray.includes(key) 
      ? keyArray.filter(k => k !== key)
      : [...keyArray, key];
    onUpdate({ [field]: newKeys });
  };

  const setValueConfig = (column) => {
    onUpdate({ 
      valueConfig: { 
        column, 
        agg: valueConfig?.agg || "Somme" 
      } 
    });
  };

  const updateValueAgg = (agg) => {
    if (valueConfig) {
      onUpdate({ 
        valueConfig: { 
          ...valueConfig, 
          agg 
        } 
      });
    }
  };

  const clearValueConfig = () => {
    onUpdate({ valueConfig: null });
  };

  return (
    <div className="pie-chart-controls">
      {/* VALEURS (obligatoire) */}
      <div className="control-section">
        <div className="control-header" onClick={onToggleValue}>
          <span>📊 Valeurs (obligatoire - un seul champ)</span>
          <span className={`control-arrow ${isValueOpen ? 'open' : ''}`}>▶</span>
        </div>
        {isValueOpen && (
          <div className="pie-value-config">
            {valueConfig ? (
              <div className="y-config-item">
                <select 
                  value={valueConfig.column} 
                  onChange={e => setValueConfig(e.target.value)}
                  className="y-config-select"
                >
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <select 
                  value={valueConfig.agg} 
                  onChange={e => updateValueAgg(e.target.value)}
                  className="y-config-agg-select"
                >
                  {AGGREGATION_TYPES.map(a => <option key={a}>{a}</option>)}
                </select>
                <button 
                  onClick={clearValueConfig}
                  className="btn-remove"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="pie-add-value">
                <select 
                  onChange={e => e.target.value && setValueConfig(e.target.value)}
                  className="y-config-select"
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner un champ...</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            )}
            <p className="control-hint">
              💡 Sans autres champs, affiche le total comme un cercle unique
            </p>
          </div>
        )}
      </div>

      {/* DÉTAILS (niveau 1 - grandes parts) */}
      <div className="control-section">
        <div className="control-header" onClick={onToggleDetails}>
          <span>🎯 Détails (grandes parts du camembert)</span>
          <span className={`control-arrow ${isDetailsOpen ? 'open' : ''}`}>▶</span>
        </div>
        {isDetailsOpen && (
          <>
            <div className="choices">
              {headers.map(h => (
                <label key={h} className="choice">
                  <input
                    type="checkbox"
                    checked={detailKeys.includes(h)}
                    onChange={() => toggleKey(detailKeys, h, 'detailKeys')}
                  />
                  {h}
                </label>
              ))}
            </div>
            <p className="control-hint">
              💡 Ex: Année → une couleur par année
            </p>
          </>
        )}
      </div>

      {/* LÉGENDE (niveau 2 - subdivisions) */}
      <div className="control-section">
        <div className="control-header" onClick={onToggleLegend}>
          <span>🏷️ Légende (subdivisions dans chaque part)</span>
          <span className={`control-arrow ${isLegendOpen ? 'open' : ''}`}>▶</span>
        </div>
        {isLegendOpen && (
          <>
            <div className="choices">
              {headers.map(h => (
                <label key={h} className="choice">
                  <input
                    type="checkbox"
                    checked={legendKeys.includes(h)}
                    onChange={() => toggleKey(legendKeys, h, 'legendKeys')}
                  />
                  {h}
                </label>
              ))}
            </div>
            <p className="control-hint">
              💡 Ex: Client → nuances de la même couleur pour chaque client dans l'année
            </p>
          </>
        )}
      </div>

      {/* INFO-BULLES supplémentaires */}
      <div className="control-section">
        <div className="control-header" onClick={onToggleTooltips}>
          <span>💬 Info-bulles (informations supplémentaires)</span>
          <span className={`control-arrow ${isTooltipsOpen ? 'open' : ''}`}>▶</span>
        </div>
        {isTooltipsOpen && (
          <div className="choices">
            {headers.map(h => (
              <label key={h} className="choice">
                <input
                  type="checkbox"
                  checked={tooltipKeys.includes(h)}
                  onChange={() => toggleKey(tooltipKeys, h, 'tooltipKeys')}
                />
                {h}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PieChartControl;