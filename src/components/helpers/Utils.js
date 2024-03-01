/**
 * @returns {boolean} Identidad de a.
 *
 * Si a es una función, la ejecuta.
 */
export const id = (a) => !!(typeof a === "function" ? a() : a);

/** Sobreescrive array[index] con la identidad de value y la retorna
 * @param {*} value
 * @param {number} index
 * @param {array} array
 * @returns Identidad de value
 * */
const overrideId = (value, index, array) => {
	if (typeof value !== "function") return value;
	const r = id(value);
	array[index] = r;
	return r;
};

/** Sobreescrive array[index] con la identidad de value y retorna la negación
 * @param {*} value
 * @param {number} index
 * @param {array} array
 * @returns Negacion de value
 * */
const overrideNot = (value, index, array) => !overrideId(value, index, array);

/**
 * @returns {boolean} Negación de a. (&not;a)
 *
 * Si a es una función, la ejecuta.
 */
export const not = (a) => !(typeof a === "function" ? a() : a);
/**
 * @returns {boolean} Si se cumple algun parámetro. (&or;)
 *
 * Si un parámetro es función, lo ejecuta.
 * */
export const or = (...a) => a.findIndex((r) => id(r)) !== -1;
/**
 * @returns {boolean} Si se cumplen todos los parámetros. (&and;)
 *
 * Si un parámetro es función, lo ejecuta.
 * */
export const and = (...a) => a.findIndex((r) => not(r)) === -1;
/**
 * @returns {boolean} Si se cumple algun parámetro pero no todos. (&veebar;)
 *
 * Si un parámetro es función, lo ejecuta.
 */
export const xor = (...a) =>
	// or(...a) && !and(...a); Lo hago de otra forma, para ejecutar los params fn solo una vez
	a.findIndex(overrideId) !== -1 && a.findIndex(overrideNot) !== -1;
/**
 * @returns {boolean} Si se cumplen todos lo parámetros o ninguno. (&hArr;)
 *
 * Si un parámetro es función, lo ejecuta.
 * */
export const iff = (...a) =>
	// and(...a) || !or(...a); Lo hago de otra forma, para ejecutar los params fn solo una vez
	a.findIndex(overrideNot) === -1 || a.findIndex(overrideId) === -1;
/**
 * @returns {boolean} Si el primer parametro implica el resto. (&rArr;)
 *
 * Recursivo con mas de 2 parámetros.
 *
 * Si un parámetro es función, lo ejecuta.
 * */
export const then = (...a) => {
	switch (a.length) {
		case 0:
			return true;
		case 1:
			return id(a[0]);
		case 2:
			return not(a[0]) || id(a[1]);
		default:
			return not(a.shift()) || then(...a);
	}
};

/**
 * @returns {boolean} Si todos los parámetros son débilmente iguales. (`==`)
 * */ //eslint-disable-next-line eqeqeq
export const looselyEqual = (a, ...b) => b.findIndex((r) => r != a) === -1;
/**
 * @returns {boolean} Si todos los parámetros son estrictamente iguales. (`===`)
 * */
export const strictlyEqual = (a, ...b) => b.findIndex((r) => r !== a) === -1;
/**
 * @returns {boolean} Si todos los parámetros son iguales. (`Object.is`)
 * */
export const same = (a, ...b) => b.findIndex((r) => !Object.is(r, a)) === -1;
/**
 * @returns {boolean} Si todos los parámetros son iguales. (`same` pero `+0` y `-0` son iguales)
 * */
export const same0 = (a, ...b) =>
	b.findIndex(
		(r) =>
			r !== a && //eslint-disable-next-line no-self-compare
			(typeof r !== "number" || typeof a !== "number" || r === r || a === a) // r y a son iguales (tal vez -0 y 0) o ambos son NaN (NaN === NaN es false)
	) === -1;

/**
 * Compara a contra b.
 * @param {*} a
 * @param {*} b
 * @returns {number} Negativo cuando `a < b`
 *
 * Positivo cuando `a > b`
 *
 * `0` cuando `a === b`
 *
 * `undefined` cuando no se puede comparar
 */
export const comparator = (a, b) =>
	a < b ? -1 : a > b ? 1 : a === b ? 0 : undefined;

/** a = b */
export const eq = (a, b, c = comparator) => c(a, b) === 0;
/** a &ne; b */
export const ne = (a, b, c = comparator) => c(a, b) !== 0;
/** a > b */
export const gt = (a, b, c = comparator) => c(a, b) > 0;
/** a &ge; b */
export const ge = (a, b, c = comparator) => c(a, b) >= 0;
/** a < b */
export const lt = (a, b, c = comparator) => c(a, b) < 0;
/** a &le; b */
export const le = (a, b, c = comparator) => c(a, b) <= 0;

/**
 * Obtiene los elementos entre a y b en data
 * @param {array} data
 * @param {*} a Un elemento de data
 * @param {*} b Un elemento de data
 * @param {comparator} c Función de comparación
 * @param {ge?} low Condición de límite inferior. Por defecto &ge;.
 * @param {le?} high Condición de límite superior. Por defecto &le;.
 * @returns {array} Elementos de data entre a y b
 */
export const range = (data, a, b, c = comparator, low = ge, high = le) => {
	let min = c(a, b) < 0 ? a : b;
	let max = c(a, b) > 0 ? a : b;
	return data.filter((r) => low(r, min, c) && high(r, max, c));
};
