import { aggregate } from './aggregation';

/**
 * Filtre les données selon les filtres spécifiés
 */
export const filterData = (data, filters) => {
  return data.filter(row => {
    return filters.every(filter => {
      if (!filter.field || filter.values.length === 0) return true;
      return filter.values.includes(row[filter.field]);
    });
  });
};

/**
 * Agrège les données pour les graphiques Line et Bar
 */
export const aggregateForChart = (filteredData, xKeys, yConfigs, columnKeys) => {
  if (yConfigs.length === 0) return [];
  
  // Cas 1: Pas de X → Ligne "Total"
  if (xKeys.length === 0) {
    const grouped = {};
    
    filteredData.forEach(row => {
      const columnVal = columnKeys.length > 0 
        ? columnKeys.map(k => row[k]).filter(v => v !== "" && v != null).join(" - ")
        : "Total";
      
      if (!grouped[columnVal]) {
        grouped[columnVal] = {};
        yConfigs.forEach(cfg => {
          grouped[columnVal][`${cfg.column}_${cfg.agg}`] = [];
        });
      }
      
      yConfigs.forEach(cfg => {
        if (typeof row[cfg.column] === "number") {
          grouped[columnVal][`${cfg.column}_${cfg.agg}`].push(row[cfg.column]);
        }
      });
    });
    
    return [{
      _label: "Total",
      ...Object.fromEntries(
        Object.entries(grouped).flatMap(([columnVal, yData]) =>
          yConfigs.map(cfg => {
            const seriesName = columnKeys.length > 0 
              ? `${cfg.column} (${cfg.agg}) - ${columnVal}`
              : `${cfg.column} (${cfg.agg})`;
            return [seriesName, aggregate(yData[`${cfg.column}_${cfg.agg}`] || [], cfg.agg)];
          })
        )
      )
    }];
  }
  
  // Cas 2: X présent
  const grouped = {};
  
  filteredData.forEach(row => {
    const xVal = xKeys.map(k => row[k]).filter(v => v !== "" && v != null).join(" - ");
    if (!xVal) return;
    
    const columnVal = columnKeys.length > 0 
      ? columnKeys.map(k => row[k]).filter(v => v !== "" && v != null).join(" - ")
      : "Total";
    
    if (!grouped[xVal]) grouped[xVal] = {};
    if (!grouped[xVal][columnVal]) {
      grouped[xVal][columnVal] = {};
      yConfigs.forEach(cfg => {
        grouped[xVal][columnVal][`${cfg.column}_${cfg.agg}`] = [];
      });
    }
    
    yConfigs.forEach(cfg => {
      if (typeof row[cfg.column] === "number") {
        grouped[xVal][columnVal][`${cfg.column}_${cfg.agg}`].push(row[cfg.column]);
      }
    });
  });

  const xKeysCombined = xKeys.join(" - ");
  const result = Object.entries(grouped).map(([xVal, columns]) => {
    const obj = { [xKeysCombined]: xVal };
    Object.entries(columns).forEach(([columnVal, yData]) => {
      yConfigs.forEach(cfg => {
        const seriesName = columnKeys.length > 0 
          ? `${cfg.column} (${cfg.agg}) - ${columnVal}`
          : `${cfg.column} (${cfg.agg})`;
        obj[seriesName] = aggregate(yData[`${cfg.column}_${cfg.agg}`] || [], cfg.agg);
      });
    });
    return obj;
  });

  return result.sort((a, b) => {
    const aVal = a[xKeysCombined];
    const bVal = b[xKeysCombined];
    const numeric = !isNaN(parseFloat(aVal)) && !isNaN(parseFloat(bVal));
    return numeric ? (parseFloat(aVal) - parseFloat(bVal)) : (aVal > bVal ? 1 : -1);
  });
};

/**
 * Agrège les données pour le tableau croisé dynamique
 */
export const aggregateForTCD = (filteredData, xKeys, yConfigs, columnKeys) => {
  if (yConfigs.length === 0) return null;
  
  // Cas 1: Pas de X → Une seule ligne "Total"
  if (xKeys.length === 0) {
    const totals = {};
    
    filteredData.forEach(row => {
      const columnVal = columnKeys.length > 0 
        ? columnKeys.map(k => row[k]).filter(v => v !== "" && v != null).join(" | ")
        : "Total";
      
      if (!totals[columnVal]) {
        totals[columnVal] = {};
        yConfigs.forEach(cfg => {
          totals[columnVal][`${cfg.column}_${cfg.agg}`] = [];
        });
      }
      
      yConfigs.forEach(cfg => {
        if (typeof row[cfg.column] === "number") {
          totals[columnVal][`${cfg.column}_${cfg.agg}`].push(row[cfg.column]);
        }
      });
    });
    
    return { "Total": totals };
  }
  
  // Cas 2: X présent → Structure hiérarchique
  const grouped = {};
  
  filteredData.forEach(row => {
    let current = grouped;
    xKeys.forEach((xKey, idx) => {
      const val = row[xKey];
      if (val === "" || val == null) return;
      
      if (!current[val]) {
        current[val] = idx === xKeys.length - 1 ? {} : { _children: {} };
      }
      current = idx === xKeys.length - 1 ? current[val] : current[val]._children;
    });
    
    const columnVal = columnKeys.length > 0 
      ? columnKeys.map(k => row[k]).filter(v => v !== "" && v != null).join(" | ")
      : "Total";
    
    if (!current[columnVal]) {
      current[columnVal] = {};
      yConfigs.forEach(cfg => {
        current[columnVal][`${cfg.column}_${cfg.agg}`] = [];
      });
    }
    
    yConfigs.forEach(cfg => {
      if (typeof row[cfg.column] === "number") {
        current[columnVal][`${cfg.column}_${cfg.agg}`].push(row[cfg.column]);
      }
    });
  });
  
  return grouped;
};

/**
 * Extrait les valeurs de colonnes du TCD
 */
export const extractColumnValues = (tcdData, yConfigs) => {
  const cols = new Set();
  
  const traverse = (obj) => {
    Object.entries(obj).forEach(([key, val]) => {
      if (key === "_children") {
        traverse(val);
      } else if (typeof val === "object" && val !== null) {
        if (yConfigs.length > 0 && Array.isArray(val[`${yConfigs[0].column}_${yConfigs[0].agg}`])) {
          cols.add(key);
        } else if (val._children) {
          traverse(val._children);
        } else {
          Object.keys(val).forEach(subKey => {
            if (yConfigs.length > 0 && Array.isArray(val[subKey][`${yConfigs[0].column}_${yConfigs[0].agg}`])) {
              cols.add(subKey);
            }
          });
        }
      }
    });
  };
  
  if (tcdData) traverse(tcdData);
  return Array.from(cols).sort();
};

/**
 * Extrait les noms des séries pour les graphiques
 */
export const extractSeriesNames = (aggregatedData, xKeys) => {
  if (aggregatedData.length === 0) return [];
  const xKeysCombined = xKeys.length > 0 ? xKeys.join(" - ") : "_label";
  return Object.keys(aggregatedData[0]).filter(k => k !== xKeysCombined);
};

/**
 * Génère des nuances de couleur pour les sous-divisions
 */
const generateColorShades = (baseColor, count) => {
  // Convertir hex en RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const shades = [];
  for (let i = 0; i < count; i++) {
    // Créer des nuances en variant la luminosité
    const factor = 1 - (i * 0.3 / count); // De plus clair à plus foncé
    const newR = Math.round(r + (255 - r) * (1 - factor));
    const newG = Math.round(g + (255 - g) * (1 - factor));
    const newB = Math.round(b + (255 - b) * (1 - factor));
    shades.push(`rgb(${newR}, ${newG}, ${newB})`);
  }
  return shades;
};

/**
 * Prépare les données pour le PieChart selon la logique Power BI
 * @param {Array} filteredData - Données filtrées
 * @param {Object} valueConfig - Configuration de la valeur {column, agg}
 * @param {Array} detailKeys - Champs pour les grandes parts (niveau 1)
 * @param {Array} legendKeys - Champs pour les subdivisions (niveau 2)
 * @param {Array} tooltipKeys - Champs supplémentaires pour l'info-bulle
 */
export const preparePieData = (filteredData, valueConfig = null, detailKeys = [], legendKeys = [], tooltipKeys = []) => {
  if (!filteredData || filteredData.length === 0 || !valueConfig) return [];
  
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA33FF", "#8884d8", "#82ca9d", "#ffc658"];
  
  // Cas 1: Valeurs uniquement → Un seul cercle avec le total
  if (detailKeys.length === 0) {
    const values = filteredData
      .map(row => row[valueConfig.column])
      .filter(v => typeof v === "number");
    
    const totalValue = aggregate(values, valueConfig.agg);
    
    return [{
      name: "Total",
      value: totalValue,
      color: COLORS[0],
      isTotal: true
    }];
  }
  
  // Cas 2: Valeurs + Détails (sans légende) → Une part par détail
  if (legendKeys.length === 0) {
    const grouped = {};
    
    filteredData.forEach(row => {
      const detailValue = detailKeys
        .map(k => row[k])
        .filter(v => v !== "" && v != null)
        .join(" - ");
      
      if (!detailValue) return;
      
      if (!grouped[detailValue]) {
        grouped[detailValue] = {
          values: [],
          tooltips: {}
        };
        
        tooltipKeys.forEach(tk => {
          grouped[detailValue].tooltips[tk] = [];
        });
      }
      
      if (typeof row[valueConfig.column] === "number") {
        grouped[detailValue].values.push(row[valueConfig.column]);
      }
      
      tooltipKeys.forEach(tk => {
        if (row[tk] !== "" && row[tk] != null) {
          grouped[detailValue].tooltips[tk].push(row[tk]);
        }
      });
    });
    
    return Object.entries(grouped).map(([detailValue, data], index) => ({
      name: detailValue,
      value: aggregate(data.values, valueConfig.agg),
      color: COLORS[index % COLORS.length],
      count: data.values.length,
      tooltips: Object.entries(data.tooltips).reduce((acc, [key, values]) => {
        if (values.length > 0 && typeof values[0] === "number") {
          acc[key] = `${valueConfig.agg}: ${aggregate(values, valueConfig.agg)}`;
        } else {
          acc[key] = [...new Set(values)].join(", ");
        }
        return acc;
      }, {})
    })).sort((a, b) => b.value - a.value);
  }
  
  // Cas 3: Valeurs + Détails + Légende → Parts avec subdivisions
  const grouped = {};
  
  filteredData.forEach(row => {
    const detailValue = detailKeys
      .map(k => row[k])
      .filter(v => v !== "" && v != null)
      .join(" - ");
    
    if (!detailValue) return;
    
    const legendValue = legendKeys
      .map(k => row[k])
      .filter(v => v !== "" && v != null)
      .join(" - ");
    
    if (!legendValue) return;
    
    if (!grouped[detailValue]) {
      grouped[detailValue] = {
        legends: {},
        total: 0
      };
    }
    
    if (!grouped[detailValue].legends[legendValue]) {
      grouped[detailValue].legends[legendValue] = {
        values: [],
        tooltips: {}
      };
      
      tooltipKeys.forEach(tk => {
        grouped[detailValue].legends[legendValue].tooltips[tk] = [];
      });
    }
    
    if (typeof row[valueConfig.column] === "number") {
      grouped[detailValue].legends[legendValue].values.push(row[valueConfig.column]);
    }
    
    tooltipKeys.forEach(tk => {
      if (row[tk] !== "" && row[tk] != null) {
        grouped[detailValue].legends[legendValue].tooltips[tk].push(row[tk]);
      }
    });
  });
  
  // Transformer en format pour Recharts avec subdivisions
  const result = [];
  let colorIndex = 0;
  
  Object.entries(grouped).forEach(([detailValue, detailData]) => {
    const baseColor = COLORS[colorIndex % COLORS.length];
    const legends = Object.entries(detailData.legends);
    const shades = generateColorShades(baseColor, legends.length);
    
    legends.forEach(([legendValue, legendData], subIndex) => {
      const value = aggregate(legendData.values, valueConfig.agg);
      
      result.push({
        name: `${detailValue} - ${legendValue}`,
        detailName: detailValue,
        legendName: legendValue,
        value: value,
        color: shades[subIndex],
        baseColor: baseColor,
        count: legendData.values.length,
        tooltips: Object.entries(legendData.tooltips).reduce((acc, [key, values]) => {
          if (values.length > 0 && typeof values[0] === "number") {
            acc[key] = `${valueConfig.agg}: ${aggregate(values, valueConfig.agg)}`;
          } else {
            acc[key] = [...new Set(values)].join(", ");
          }
          return acc;
        }, {})
      });
    });
    
    colorIndex++;
  });
  
  return result.sort((a, b) => {
    // Trier par détail d'abord, puis par valeur dans chaque détail
    if (a.detailName !== b.detailName) {
      return a.detailName.localeCompare(b.detailName);
    }
    return b.value - a.value;
  });
};

/**
 * Prépare les données pour le ScatterChart
 * @param {Array} filteredData - Données filtrées
 * @param {Object} xConfig - Configuration de l'axe X {column, agg}
 * @param {Object} yConfig - Configuration de l'axe Y {column, agg}
 * @param {Array} seriesKeys - Champs pour séparer en plusieurs séries (optionnel)
 */
export const prepareScatterData = (filteredData, xConfig = null, yConfig = null, seriesKeys = []) => {
  if (!filteredData || filteredData.length === 0 || !xConfig || !yConfig) return [];
  
  // Cas 1: Pas de séries → Tous les points dans une seule série
  if (seriesKeys.length === 0) {
    const points = filteredData
      .filter(row => 
        typeof row[xConfig.column] === "number" && 
        typeof row[yConfig.column] === "number"
      )
      .map(row => ({
        x: row[xConfig.column],
        y: row[yConfig.column],
        name: `Point (${row[xConfig.column]}, ${row[yConfig.column]})`
      }));
    
    return [{
      name: "Tous les points",
      data: points
    }];
  }
  
  // Cas 2: Avec séries → Grouper par série
  const grouped = {};
  
  filteredData.forEach(row => {
    // Vérifier que X et Y sont numériques
    if (typeof row[xConfig.column] !== "number" || typeof row[yConfig.column] !== "number") {
      return;
    }
    
    const seriesValue = seriesKeys
      .map(k => row[k])
      .filter(v => v !== "" && v != null)
      .join(" - ");
    
    if (!seriesValue) return;
    
    if (!grouped[seriesValue]) {
      grouped[seriesValue] = [];
    }
    
    grouped[seriesValue].push({
      x: row[xConfig.column],
      y: row[yConfig.column],
      name: seriesValue
    });
  });
  
  return Object.entries(grouped).map(([seriesName, points]) => ({
    name: seriesName,
    data: points
  }));
};