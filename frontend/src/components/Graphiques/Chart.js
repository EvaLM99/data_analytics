import React, { useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { Trash as DeleteIcon } from 'lucide-react';
import { 
  filterData, 
  aggregateForChart, 
  aggregateForTCD, 
  extractColumnValues, 
  extractSeriesNames,
  preparePieData,
  prepareScatterData
} from './utils/dataProcessing';
import LineChartView from './charts/LineChartView';
import BarChartView from './charts/BarChartView';
import PieChartView from './charts/PieChartView';
import ScatterChartView from './charts/ScatterChartView';
import TCDView from './charts/TCDView';
import XAxisControl from './controls/XAxisControl';
import ColumnControl from './controls/ColumnControl';
import YAxisControl from './controls/YAxisControl';
import FilterControl from './controls/FilterControl';
import ChartTypeSelector from './controls/ChartTypeSelector';
import PieChartControl from './controls/PieChartControl';
import ScatterChartControl from './controls/ScatterChartControl';

function Chart({ chart, data, headers, updateChart, deleteChart }) {
  const { 
    id, 
    xKeys = [], 
    yConfigs = [],
    columnKeys = [], 
    filters = [],
    chartType,
    pieConfig = {}, // Config pour PieChart
    scatterConfig = {} // Config pour ScatterChart
  } = chart;

  const [xOpen, setXOpen] = useState(false);
  const [yOpen, setYOpen] = useState(false);
  const [valuesOpen, setValuesOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // États spécifiques au PieChart
  const [pieValueOpen, setPieValueOpen] = useState(false);
  const [pieDetailsOpen, setPieDetailsOpen] = useState(false);
  const [pieLegendOpen, setPieLegendOpen] = useState(false);
  const [pieTooltipsOpen, setPieTooltipsOpen] = useState(false);

  // États spécifiques au ScatterChart
  const [scatterXOpen, setScatterXOpen] = useState(false);
  const [scatterYOpen, setScatterYOpen] = useState(false);
  const [scatterSeriesOpen, setScatterSeriesOpen] = useState(false);

  // Filtrage des données
  const filteredData = useMemo(() => {
    return filterData(data, filters);
  }, [data, filters]);

  // Agrégation pour graphiques Line/Bar
  const aggregatedForChart = useMemo(() => {
    if (chartType === "pie" || chartType === "scatter") return [];
    return aggregateForChart(filteredData, xKeys, yConfigs, columnKeys);
  }, [filteredData, xKeys, yConfigs, columnKeys, chartType]);

  // Agrégation pour TCD
  const tcdData = useMemo(() => {
    if (chartType !== "tcd") return null;
    return aggregateForTCD(filteredData, xKeys, yConfigs, columnKeys);
  }, [filteredData, xKeys, yConfigs, columnKeys, chartType]);

  // Valeurs des colonnes pour TCD
  const columnValues = useMemo(() => {
    if (chartType !== "tcd") return [];
    return extractColumnValues(tcdData, yConfigs);
  }, [tcdData, yConfigs, chartType]);

  // Noms des séries pour graphiques
  const seriesNames = useMemo(() => {
    return extractSeriesNames(aggregatedForChart, xKeys);
  }, [aggregatedForChart, xKeys]);

  // Données pour PieChart (nouvelle logique Power BI)
  const pieData = useMemo(() => {
    if (chartType !== "pie") return [];
    return preparePieData(
      filteredData,
      pieConfig.valueConfig || null,
      pieConfig.detailKeys || [],
      pieConfig.legendKeys || [],
      pieConfig.tooltipKeys || []
    );
  }, [filteredData, pieConfig, chartType]);

  // Données pour ScatterChart
  const scatterData = useMemo(() => {
    if (chartType !== "scatter") return [];
    return prepareScatterData(
      filteredData,
      scatterConfig.xConfig || null,
      scatterConfig.yConfig || null,
      scatterConfig.seriesKeys || []
    );
  }, [filteredData, scatterConfig, chartType]);

  const toggleKey = (keyArray, key, updateKey) => {
    const newKeys = keyArray.includes(key) 
      ? keyArray.filter(k => k !== key)
      : [...keyArray, key];
    updateChart(id, { [updateKey]: newKeys });
  };

  const updatePieConfig = (updates) => {
    updateChart(id, { 
      pieConfig: { 
        ...pieConfig, 
        ...updates 
      } 
    });
  };

  const updateScatterConfig = (updates) => {
    updateChart(id, { 
      scatterConfig: { 
        ...scatterConfig, 
        ...updates 
      } 
    });
  };

  const renderChart = () => {
    const xKeysCombined = xKeys.length > 0 ? xKeys.join(" - ") : "_label";

    switch (chartType) {
      case "tcd":
        return (
          <TCDView 
            tcdData={tcdData} 
            xKeys={xKeys} 
            yConfigs={yConfigs} 
            columnValues={columnValues} 
          />
        );
      
      case "bar":
        return (
          <BarChartView 
            data={aggregatedForChart} 
            xKeysCombined={xKeysCombined} 
            seriesNames={seriesNames} 
          />
        );
      
      case "pie":
        return <PieChartView data={pieData} />;
      
      case "scatter":
        return (
          <ScatterChartView 
            scatterData={scatterData}
            xAxisLabel={scatterConfig.xConfig?.column}
            yAxisLabel={scatterConfig.yConfig?.column}
          />
        );
      
      case "line":
      default:
        return (
          <LineChartView 
            data={aggregatedForChart} 
            xKeysCombined={xKeysCombined} 
            seriesNames={seriesNames} 
          />
        );
    }
  };

  const renderControls = () => {
    if (chartType === "pie") {
      return (
        <PieChartControl
          headers={headers}
          pieConfig={pieConfig}
          isValueOpen={pieValueOpen}
          isDetailsOpen={pieDetailsOpen}
          isLegendOpen={pieLegendOpen}
          isTooltipsOpen={pieTooltipsOpen}
          onToggleValue={() => setPieValueOpen(!pieValueOpen)}
          onToggleDetails={() => setPieDetailsOpen(!pieDetailsOpen)}
          onToggleLegend={() => setPieLegendOpen(!pieLegendOpen)}
          onToggleTooltips={() => setPieTooltipsOpen(!pieTooltipsOpen)}
          onUpdate={updatePieConfig}
        />
      );
    }

    if (chartType === "scatter") {
      return (
        <ScatterChartControl
          headers={headers}
          scatterConfig={scatterConfig}
          isXOpen={scatterXOpen}
          isYOpen={scatterYOpen}
          isSeriesOpen={scatterSeriesOpen}
          onToggleX={() => setScatterXOpen(!scatterXOpen)}
          onToggleY={() => setScatterYOpen(!scatterYOpen)}
          onToggleSeries={() => setScatterSeriesOpen(!scatterSeriesOpen)}
          onUpdate={updateScatterConfig}
        />
      );
    }

    return (
      <>
        <XAxisControl
          headers={headers}
          xKeys={xKeys}
          isOpen={xOpen}
          onToggle={() => setXOpen(!xOpen)}
          onToggleKey={(key) => toggleKey(xKeys, key, 'xKeys')}
        />

        {chartType === "tcd" && (
          <ColumnControl
            headers={headers}
            columnKeys={columnKeys}
            isOpen={yOpen}
            onToggle={() => setYOpen(!yOpen)}
            onToggleKey={(key) => toggleKey(columnKeys, key, 'columnKeys')}
          />
        )}

        <YAxisControl
          headers={headers}
          yConfigs={yConfigs}
          isOpen={valuesOpen}
          onToggle={() => setValuesOpen(!valuesOpen)}
          onUpdate={(newConfigs) => updateChart(id, { yConfigs: newConfigs })}
        />
      </>
    );
  };

  return (
    <div className="chart-card">
      <div className="graph-controls">
        {renderControls()}

        <FilterControl
          headers={headers}
          filters={filters}
          data={data}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
          onUpdate={(newFilters) => updateChart(id, { filters: newFilters })}
        />

        <ChartTypeSelector
          chartType={chartType}
          onChange={(type) => updateChart(id, { chartType: type })}
        />
        
        <Button 
          variant="outlined" 
          startIcon={<DeleteIcon />} 
          onClick={() => deleteChart(id)} 
          id="delete-chart"
        >
          Supprimer le graphique
        </Button>
      </div>
      
      <div className="chart-area">
        {renderChart()}
      </div>
    </div>
  );
}

export default Chart;