import React, { useMemo, useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import Chart from "./Chart";
import "./graphiques.css";

function Graphiques({ sheetData, projectId }) {
  const { accessToken: token, refreshAccessToken } = useContext(AuthContext);
  const isFirstLoad = useRef(true);
  const API_URL = process.env.REACT_APP_API_URL;


  // Transformation des données de la feuille
  const { data, headers } = useMemo(() => {
    if (!sheetData || Object.keys(sheetData).length === 0) {
      return { data: [], headers: [] };
    }

    const rowsObj = {};
    for (const [cell, value] of Object.entries(sheetData)) {
      const row = cell.match(/\d+/)[0];
      const col = cell.match(/[A-Z]+/)[0];
      if (!rowsObj[row]) rowsObj[row] = {};
      rowsObj[row][col] = value;
    }

    const headerRow = rowsObj["1"];
    if (!headerRow) return { data: [], headers: [] };

    const cols = Object.keys(headerRow).sort((a, b) => {
      const labelToNumber = (label) => {
        let num = 0;
        for (let i = 0; i < label.length; i++) {
          num = num * 26 + (label.charCodeAt(i) - 64);
        }
        return num;
      };
      return labelToNumber(a) - labelToNumber(b);
    });

    const headersOrdered = cols.map(c => headerRow[c]);
    const result = [];

    for (let r = 2; rowsObj[String(r)]; r++) {
      const obj = {};
      for (let c of cols) {
        const headerName = headerRow[c];
        const rawValue = rowsObj[String(r)][c] ?? "";
        const numeric = parseFloat(rawValue);
        obj[headerName] = isNaN(numeric) ? rawValue : numeric;
      }
      if (Object.values(obj).every(v => v === "" || v === null || v === undefined)) {
        continue;
      }
      result.push(obj);
    }

    return { data: result, headers: headersOrdered };
  }, [sheetData]);

  const [charts, setCharts] = useState([]);

  // Gestion de l'authentification avec refresh token
  const fetchWithRefresh = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
    
    if (res.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) throw new Error("Unable to refresh token");
      res = await fetch(url, {
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${newToken}` }
      });
    }
    
    return res;
  };

  // Chargement initial des graphiques
  useEffect(() => {
    let mounted = true;
    
    const load = async () => {
      if (!projectId) {
        setCharts([{ 
          id: 1, 
          xKeys: [], 
          yConfigs: [], 
          columnKeys: [], 
          filters: [], 
          chartType: "line",
          pieConfig: {
            valueConfig: null,
            detailKeys: [],
            legendKeys: [],
            tooltipKeys: []
          },
          scatterConfig: {
            xConfig: null,
            yConfig: null,
            seriesKeys: []
          }
        }]);
        return;
      }

      try {
        const res = await fetchWithRefresh(`${API_URL}/projects/${projectId}/`);
        if (!res.ok) throw new Error("Erreur chargement projet");
        const json = await res.json();
        
        if (mounted && json.charts && json.charts.length > 0) {
          // S'assurer que pieConfig et scatterConfig existent pour chaque graphique
          const chartsWithConfigs = json.charts.map(chart => ({
            ...chart,
            pieConfig: chart.pieConfig || {
              valueConfig: null,
              detailKeys: [],
              legendKeys: [],
              tooltipKeys: []
            },
            scatterConfig: chart.scatterConfig || {
              xConfig: null,
              yConfig: null,
              seriesKeys: []
            }
          }));
          setCharts(chartsWithConfigs);
        } else {
          setCharts([{ 
            id: 1, 
            xKeys: [], 
            yConfigs: [], 
            columnKeys: [], 
            filters: [], 
            chartType: "line",
            pieConfig: {
              legendKeys: [],
              valueConfig: null,
              detailKeys: [],
              tooltipKeys: []
            }
          }]);
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        if (mounted) {
          setCharts([{ 
            id: 1, 
            xKeys: [], 
            yConfigs: [], 
            columnKeys: [], 
            filters: [], 
            chartType: "line",
            pieConfig: {
              legendKeys: [],
              valueConfig: null,
              detailKeys: [],
              tooltipKeys: []
            }
          }]);
        }
      }
    };

    load();
    return () => { mounted = false; };
  }, [projectId, token]);

  // Sauvegarde des graphiques
  const saveCharts = async (chartsToSave) => {
    if (!projectId) return;
    
    try {
      const res = await fetchWithRefresh(`${API_URL}/projects/${projectId}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charts: chartsToSave }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Erreur saveCharts:", res.status, errorText);
        return;
      }
      
      console.log("✅ Graphiques sauvegardés !");
    } catch (error) {
      console.error("Erreur réseau saveCharts:", error);
    }
  };

  // Auto-sauvegarde avec debounce
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    
    if (!charts.length || !projectId || !token) return;

    const timeoutId = setTimeout(() => {
      saveCharts(charts).catch(err => console.error("Erreur sauvegarde:", err));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [charts, projectId, token]);

  // Actions sur les graphiques
  const addChart = () => {
    const newId = charts.length ? Math.max(...charts.map(c => c.id)) + 1 : 1;
    const newChart = { 
      id: newId, 
      xKeys: [], 
      yConfigs: [], 
      columnKeys: [], 
      filters: [], 
      chartType: "line",
      pieConfig: {
        legendKeys: [],
        valueConfig: null,
        detailKeys: [],
        tooltipKeys: []
      }
    };
    setCharts(prev => [...prev, newChart]);
  };

  const updateChart = (id, updates) => {
    setCharts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteChart = (id) => {
    if (charts.length === 1) {
      alert("Vous devez garder au moins un graphique !");
      return;
    }
    setCharts(prev => prev.filter(c => c.id !== id));
  };

  // Cas où il n'y a pas de données
  if (data.length === 0) {
    return (
      <div className="graphiques-container">
        <h2>📊 Tableau de bord interactif</h2>
        <p>Aucune donnée valide trouvée dans la feuille.</p>
      </div>
    );
  }

  return (
    <div className="graphiques-container">
      <h2>📊 Tableau de bord interactif</h2>
      {charts.map(chart => (
        <Chart 
          key={chart.id} 
          chart={chart} 
          data={data} 
          headers={headers} 
          updateChart={updateChart} 
          deleteChart={deleteChart} 
        />
      ))}
      <button onClick={addChart} className="btn-add-chart">
        ➕ Ajouter un graphique
      </button>
    </div>
  );
}

export default Graphiques;