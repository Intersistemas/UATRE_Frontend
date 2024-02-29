/** !a */
export const not = (a) => !(typeof a === "function" ? a() : a);
/** Si todos los parámetros son iguales */
export const eq = (a, ...b) => b.findIndex((r) => r !== a) === -1;
/** Si se cumple algun parámetro */
export const or = (...a) => a.findIndex((r) => !not(r)) !== -1;
/** Si se cumplen todos los parámetros */
export const and = (...a) => a.findIndex((r) => not(r)) === -1;

/**
 * Compara a contra b.
 * @param {*} a
 * @param {*} b
 * @returns {number} Negativo cuando a < b
 *
 * Positivo cuando a > b
 *
 * 0 cuando a === b
 *
 * undefined cuando no se puede comparar
 */
export const comparator = (a, b) =>
	a < b ? -1 : a > b ? 1 : a === b ? 0 : undefined;

/** a > b */
export const gt = (a, b, c = comparator) => c(a, b) > 0;
/** a >= b */
export const gte = (a, b, c = comparator) => c(a, b) >= 0;
/** a < b */
export const lt = (a, b, c = comparator) => c(a, b) < 0;
/** a <= b */
export const lte = (a, b, c = comparator) => c(a, b) <= 0;

/**
 * Obtiene los elementos entre a y b en data
 * @param {array} data
 * @param {*} a Un elemento de data
 * @param {*} b Un elemento de data
 * @param {comparator} c Función de comparación
 * @param {gte?} low Condición de límite inferior. Por defecto ">=".
 * @param {lte?} high Condición de límite superior. Por defecto "<=".
 * @returns {array} Elementos de data entre a y b
 */
export const range = (data, a, b, c = comparator, low = gte, high = lte) => {
	let min = c(a, b) < 0 ? a : b;
	let max = c(a, b) > 0 ? a : b;
	return data.filter((r) => low(r, min, c) && high(r, max, c));
};
