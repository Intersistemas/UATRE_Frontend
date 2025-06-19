import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useQueryQueue from "./useQueryQueue";

const mapper = (v, n) => {
	const r = { nombre: `${n}`, valor: `${v}` };
	if (
		v == null ||
		["bigint", "boolean", "number", "string", "symbol"].includes(typeof v)
	) {
		return r;
	} else if (typeof v === "object") {
		try {
			r.valor = JSON.stringify(v);
			return r;
		} catch (e) {
			console.error("useAuditoriaProceso", e);
		}
	}
	return null;
};

export default function useAuditoriaProceso() {
	const { usuario, modulo } = useSelector((state) => ({
		usuario: state.usuarioLogueado,
		modulo: state.modulo,
	}));
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "AuditoriaProceso": {
				return {
					config: {
						baseURL: "Auditoria",
						endpoint: `/AuditoriasProcesos/registrar`,
						method: "POST",
					},
				};
			}
			default:
				return null;
		}
	});

	const [query, setQuery] = useState(null);

	/**
	 *
	 * @param {object} props
	 * @param {string?} props.usuario
	 * @param {string?} props.modulo
	 * @param {string} props.proceso
	 * @param {any?} props.parametros
	 * @param {string?} props.observaciones
	 * @param {(ok: any) => void?} props.onOk
	 * @param {(error: UseHttpError) => void?} props.onError
	 * @param {() => void?} props.onFinally
	 */
	const audit = ({
		usuario: pUsuario,
		modulo: pModulo,
		proceso,
		parametros,
		observaciones,
		onOk,
		onError,
		onFinally
	}) => {
		const body = {
			usuario: pUsuario || (usuario?.id ?? ""),
			modulo: pModulo || (modulo?.nombre ?? ""),
			proceso,
		};
		if (parametros) {
			let params = [];
			if (typeof parametros === "object") {
				params = Object.entries(parametros)
					.map(([k, v]) => mapper(v, k))
					.filter((r) => r);
			} else {
				params = [parametros].map(mapper).filter((r) => r);
			}
			if (params.length) body.parametros = params;
		}
		if (observaciones != null) body.observaciones = observaciones;

		if (JSON.stringify(query?.config?.body ?? {}) === JSON.stringify(body))
			return;

		setQuery(() => {
			const query = { action: "AuditoriaProceso", config: { body } };
			if (onOk) query.onOk = onOk;
			if (onError) query.onError = onError;
			if (onFinally) query.onFinally = onFinally;
			return query;
		});
	};

	useEffect(() => {
		if (!query) return;
		pushQuery(query);
	}, [pushQuery, query]);

	return { audit };
}
