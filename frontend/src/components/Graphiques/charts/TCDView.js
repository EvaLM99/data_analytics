import React from 'react';
import { aggregate } from '../utils/aggregation';

function TCDView({ tcdData, xKeys, yConfigs, columnValues }) {
  if (!tcdData) {
    return <p>Configurez les axes pour voir le tableau</p>;
  }

  const renderRows = (obj, level = 0, parentKeys = []) => {
    return Object.entries(obj).map(([key, val]) => {
      if (key === "_children") return null;
      
      const currentKeys = [...parentKeys, key];
      const hasChildren = val._children && Object.keys(val._children).length > 0;
      
      if (hasChildren) {
        return (
          <React.Fragment key={currentKeys.join("-")}>
            <tr className={`tcd-row-level-${level}`}>
              <td className={`tcd-cell-indent-${level}`}>{key}</td>
              {columnValues.map(col => 
                yConfigs.map((cfg, cfgIdx) => <td key={`${col}-${cfgIdx}`}>-</td>)
              )}
            </tr>
            {renderRows(val._children, level + 1, currentKeys)}
          </React.Fragment>
        );
      }
      
      return (
        <tr key={currentKeys.join("-")}>
          <td className={`tcd-cell-indent-${level}`}>{key}</td>
          {columnValues.map(col => 
            yConfigs.map((cfg, cfgIdx) => {
              const values = val[col]?.[`${cfg.column}_${cfg.agg}`] || [];
              const result = aggregate(values, cfg.agg);
              return <td key={`${col}-${cfgIdx}`}>{result || 0}</td>;
            })
          )}
        </tr>
      );
    });
  };

  return (
    <div className="tcd-wrapper">
      <table className="tcd-table">
        <thead>
          <tr>
            <th rowSpan={2}>{xKeys.length > 0 ? xKeys.join(" / ") : "Total"}</th>
            {columnValues.map((col, i) => (
              <th key={`${col}-${i}`} colSpan={yConfigs.length}>{col}</th>
            ))}
          </tr>
          <tr>
            {columnValues.map(col => 
              yConfigs.map((cfg, i) => (
                <th key={`${col}-${i}`}>{cfg.column} ({cfg.agg})</th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {renderRows(tcdData)}
        </tbody>
      </table>
    </div>
  );
}

export default TCDView;