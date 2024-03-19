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

/**
 * Evalua si algún `pass` en los parametros es `false`.
 * De existir alguno, `pass` en el objeto devuelto es `false`, en caso contrario es `true`.
 * @param {{ pass: boolean }} test Conjunto de evaluaciones.
 * @returns {{ pass: boolean, test: { pass: boolean }[]}} Evaluación resultado
 * con las siguientes propiedades:
 * * `pass`: `true` si se cumplen todas las evaluaciones.
 * * `test`: Conjunto de evaluaciones origen.
 */
export const pass = (...test) => ({
	pass: test.findIndex((v) => v && !v?.pass) === -1,
	test,
});

/**
 * Obtiene el tipo y subtipo de type
 * @param {string} type Tipo con separador de subtipo
 * @param {string} separator Cadena separadora de tipo y subtipo.
 * 
 * Por defecto: `":"`
 * @returns {{ type: string, subtype?: string }} Descripcion de tipo y subtipo
 * 
 * @example
 * // returns { type: "datetime" }
 * getType("datetime")
 * @example
 * // returns { type: "datetime", subtype: "minutes" }
 * getType("datetime:minutes")
 * @example
 * // returns { type: "datetime", subtype: "minutes:otro" }
 * getType("datetime:minutes:otro")
 * @example
 * // returns { type: "datetime:minutes", subtype: "otro" }
 * getType("datetime:minutes|otro", "|")
 */
export const getType = (type, separator = ":") => {
	const types = type.split(separator);
	const r = { type: types.shift() };
	if (types.length) r.subtype = types.join(separator);
	return r;
}

/**
 * Separa data en páginas.
 * @param {object} params
 * @param {array} params.data Datos a paginar.
 * @param {number} params.size Tamaño de página. Por defecto 10.
 * @returns 
 */
export const paginate = ({ data, size = 10, detailed = false }) => {
	data = [...data];
	const pages = [];
	const pagination = { index: 1, size, pages: 1, count: data.length, data };

	if (pagination.count > pagination.size) {
		pagination.pages = Math.ceil(pagination.count / pagination.size);
		for (let index = 0; index < pagination.pages; index++) {
			pagination.index = index + 1;
			pagination.data = data.splice(0, pagination.size);
			pages.push(detailed ? { ...pagination } : pagination.data);
		}
		return pages;
	}

	pages.push(detailed ? pagination : pagination.data);
	return pages;
};

/**
 * Selecciona de `obj` propiedades presentes en `select`
 * @param {object} obj Objeto desde el que obtener las propiedades
 * @param {string[] | object} select Propiedades a obtener de `obj`
 * @param {boolean} keep Mantener propiedades presentes en `select`
 */
export const pick = (obj, select, keep = false) => {
	const keys = Array.isArray(select) ? select : Object.keys(select);
	return Object.fromEntries(keys.filter((k) => keep || (k in obj)).map((k) => [k, obj[k]]));
};

/**
 * "Aplana" `value`. Esto es, si value es un objeto, transforma todas sus propiedades en tipos simples.
 * @param {object} params
 * @param {any} params.value Valor a aplanar.
 * @param {string?} params.key Clave identificadora de `value`.
 * @param {object?} params.target Objeto destino donde se acumularán las propiedades.
 * @param {(context: { key: string, parent: { key: string, value: any } }) => string?} params.keyFormat Funcion de formateo de claves `destino`.
 * @param {(context: { key: string, target: object, child: { key: string, value: any }, parent: { key: string, value: any } }) => void?} params.valueFormat Función de formateo de valores `destino`.
 * @returns {object} Objeto destino (`target` o nuevo objeto).
 */
export const flatten = ({
	value,
	key = null,
	target = null,
	keyFormat = ({ key, parent }) =>
		parent.key
			? Array.isArray(parent.value)
				? `${parent.key}[${key}]`
				: `${parent.key}.${key}`
			: key,
	valueFormat = null,
}) => {
	target ??= {};
	valueFormat ??= ({ key, target, child }) => {
		flatten({ value: child.value, key, target, keyFormat, valueFormat });
	};
	if (typeof value !== "object" || value == null) {
		if (key == null) return value;
		target[key] = value;
	} else {
		Object.entries(value).forEach(([k, v]) => valueFormat({
			key: keyFormat({ key: k, parent: { key, value }}),
			target,
			child: { key: k, value: v },
			parent: { key, value },
		}));
	}
	return target;
};

/**
 * Trata de transformar string JSON en un objeto
 * @param {string} string Cadena a transformar
 * @param {(json: any) => void} onOk Callback en caso de transformar correctamente
 * @param {(error: any) => void} onError Callback en caso de ocurrir un error
 * @returns {any} Objecto transformado o `undefined`
 */
export const tryJSONParse = (string, onOk = () => {}, onError = () => {}) => {
	let json = undefined;
	try {
		json = JSON.parse(string);
	} catch (error) {
		onError(error);
		return json;
	}
	onOk(json);
	return json;
}