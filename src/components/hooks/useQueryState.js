import { useEffect, useState } from "react";
import useQueryQueue from "./useQueryQueue";

/**
 * @typedef {import("components/hooks/useHttp").UseHttpError} UseHttpError
 * @typedef {import("components/hooks/useQueryQueue").QueryClass} QueryClass
 */

/**
 * @callback onPreLoad Operación a realizar antes de cargar.
 */

/**
 * @typedef {object} onLoadResults
 * @property {QueryClass} query Query origen.
 * @property {any} [ok] Cuando la operación es exitosa, esta propiedad contiene el resultado de la operación.
 * @property {UseHttpError} [error] Cuando la operación fracasa, esta propiedad contiene el error de la operación.
 */

/**
 * @callback onLoad Operación a realizar al cargar.
 * @param {onLoadResults} results Resultados de la operación.
 */

/**
 * @callback onGetConfig Configuraciones de consulta
 * @param {object} params
 * @returns {{ config: { baseURL: string, method: string, endpoint: string }, params?: object }}
 */

/**
 * @typedef {object} InitialState
 * @property {QueryClass} [query] Configuración de query
 * @property {onPreLoad} [onPreLoad] Operaciones antes de ejecutar la consulta.
 * @property {onLoad} [onLoad] Operaciones luego de ejecutar la consulta.
 */

/** 
 * @param {onGetConfig} onGetConfig Configuraciones de consulta
 * @param {InitialState} initial Estado inicial
 */
const useQueryState = (onGetConfig, initial = {}) => {
	const pushQuery = useQueryQueue(onGetConfig);
	const [state, setState] = useState({
		/** @type QueryClass */
		query: {},
		/** @type onPreLoad */
		onPreLoad: null,
		/** @type onLoad */
		onLoad: null,
		...initial,
	});

	useEffect(() => {
		if (!state.onLoad) return;
		const { onPreLoad, onLoad, query } = state;
		const results = {};
		setState((o) => ({ ...o, onPreLoad: null, onLoad: null }));
		if (onPreLoad) onPreLoad();
		pushQuery({
			...query,
			onOk: (ok) => {
				results.ok = ok;
				if (query.onOk) query.onOk(ok);
			},
			onError: (error) => {
				results.error = error;
				if (query.onError) query.onError(error);
			},
			onFinally: () => {
				results.query = query;
				onLoad(results);
				if (query.onFinally) query.onFinally();
			},
		});
	}, [state, pushQuery]);

	return { state, setState };
};

export default useQueryState;
