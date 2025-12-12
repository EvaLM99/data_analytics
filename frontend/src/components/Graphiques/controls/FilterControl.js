import React from 'react';

function FilterControl({ headers, filters, data, isOpen, onToggle, onUpdate }) {
  const addFilter = () => {
    onUpdate([...filters, { field: headers[0] || "", values: [] }]);
  };

  const removeFilter = (index) => {
    onUpdate(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index, updates) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], ...updates };
    onUpdate(newFilters);
  };

  const getUniqueValues = (field) => {
    return [...new Set(data.map(row => row[field]).filter(v => v !== "" && v != null))].sort();
  };

  const toggleFilterValue = (filterIndex, value) => {
    const filter = filters[filterIndex];
    const newValues = filter.values.includes(value)
      ? filter.values.filter(v => v !== value)
      : [...filter.values, value];
    updateFilter(filterIndex, { values: newValues });
  };

  const selectAllFilterValues = (filterIndex) => {
    const filter = filters[filterIndex];
    const allValues = getUniqueValues(filter.field);
    updateFilter(filterIndex, { values: allValues });
  };

  const deselectAllFilterValues = (filterIndex) => {
    updateFilter(filterIndex, { values: [] });
  };

  return (
    <div className="control-section">
      <div className="control-header" onClick={onToggle}>
        <span>🔍 Filtres {filters.length > 0 && `(${filters.length})`}</span>
        <span className={`control-arrow ${isOpen ? 'open' : ''}`}>▶</span>
      </div>

      {isOpen && filters.map((filter, idx) => {
        const uniqueValues = getUniqueValues(filter.field);
        const allSelected = filter.values.length === uniqueValues.length;
        
        return (
          <div key={idx} className="filter-item">
            <div className="filter-header">
              <select 
                value={filter.field} 
                onChange={e => updateFilter(idx, { field: e.target.value, values: [] })}
                className="filter-select"
              >
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <span className="filter-count">
                {filter.values.length} / {uniqueValues.length} sélectionnés
              </span>
              <button 
                onClick={() => removeFilter(idx)}
                className="btn-remove"
              >
                ✕
              </button>
            </div>
            
            <div className="filter-actions">
              <button
                onClick={() => allSelected ? deselectAllFilterValues(idx) : selectAllFilterValues(idx)}
                className="btn-toggle-all"
              >
                {allSelected ? '❌ Tout désélectionner' : '✅ Tout sélectionner'}
              </button>
            </div>

            <div className="filter-values">
              {uniqueValues.map(val => (
                <label 
                  key={val} 
                  className={`filter-value-item ${filter.values.includes(val) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={filter.values.includes(val)}
                    onChange={() => toggleFilterValue(idx, val)}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        );
      })}

      {isOpen && (
        <button 
          onClick={addFilter}
          className="btn-add-filter"
        >
          ➕ Ajouter un filtre
        </button>
      )}
    </div>
  );
}

export default FilterControl;