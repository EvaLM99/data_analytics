const sum = values => values.reduce((acc, el) => acc + el, 0);
const average = values => sum(values) / values.length;
const abs = value => Math.abs(value);

export const spreadsheetFunctions = {
    sum,
    average,
    abs
}