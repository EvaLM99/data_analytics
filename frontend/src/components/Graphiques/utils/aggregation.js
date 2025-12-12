/**
 * Agrège un tableau de valeurs selon le type d'agrégation spécifié
 * @param {number[]} values - Tableau de valeurs numériques
 * @param {string} type - Type d'agrégation (Somme, Moyenne, Max, Min, Count, Count Distinct)
 * @returns {number} - Résultat de l'agrégation
 */
export const aggregate = (values, type) => {
  if (!values.length) return 0;
  
  switch (type) {
    case "Somme":
      return values.reduce((a, b) => a + b, 0);
    
    case "Moyenne":
      return values.reduce((a, b) => a + b, 0) / values.length;
    
    case "Max":
      return Math.max(...values);
    
    case "Min":
      return Math.min(...values);
    
    case "Count":
      return values.length;
    
    case "Count Distinct":
      return new Set(values).size;
    
    default:
      return values[values.length - 1];
  }
};

export const AGGREGATION_TYPES = [
  "Somme",
  "Moyenne",
  "Max",
  "Min",
  "Count",
  "Count Distinct"
];