import React from "react";
import TableHook from "components/ui/Table/TableHook";
import Table from "./TasasARCATable";
import Form from "./TasasARCAForm";

/** imports: TableHookConfig y TableHookReturn
 * @typedef {import('components/ui/Table/TableHook').TableHookConfig} TableHookConfig
 * @typedef {import('components/ui/Table/TableHook').TableHookReturn} TableHookReturn
 */

/** useUsuarios
 * @param {TableHookConfig} config
 * @returns {TableHookReturn}
 */
//Agregado Mauro
// Normaliza fechas a "YYYY-MM-DD" o null
const toYMD = (raw) => {
  if (raw == null || raw === "") return null;

  // Date nativo
  if (raw instanceof Date && !isNaN(raw)) {
    const y = raw.getFullYear();
    const m = String(raw.getMonth() + 1).padStart(2, "0");
    const d = String(raw.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  // String
  const s = String(raw).trim();

  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // ISO con tiempo → "YYYY-MM-DDTHH:mm:ss..." (me quedo con la parte de fecha)
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})[T\s].*$/);
  if (iso) return iso[1];

  // No aceptamos otros formatos (dd/mm, mm/dd, etc.)
  return null;
};

// Para comparar fácilmente fechas "YYYY-MM-DD"
const ymdToNum = (ymd) => (ymd ? Number(ymd.replace(/-/g, "")) : NaN);


export default function useTasasARCA(config = {}) {
	return TableHook({
		requests: ["A", "B", "M"],
		config: {
			remote: true,
			pagination: { index: 1, size: 15 },
			...config,
			onEditValidate: (params) => {
				const { edit, request, errors } = params;
				if (request === "B") {
					if (!edit.deletedObs) errors.deletedObs = "Dato requerido";
				} else {
					if (!edit.desdeFecha) errors.desdeFecha = "Dato requerido";
					if (!edit.hastaFecha) errors.hastaFecha = "Dato requerido";
					if (!edit.resarcitorioMensual) errors.resarcitorioMensual = "Dato requerido";

					//Agregado Mauro
					// Pruebas
					// console.log("onEditValidate raw fechas:", {
					// 	desdeFecha: edit.desdeFecha,
					// 	hastaFecha: edit.hastaFecha,
					// 	toYMD_desde: toYMD(edit.desdeFecha),
					// 	toYMD_hasta: toYMD(edit.hastaFecha),
					// });
					// Normalizamos y reescribimos fechas
					const ymd1 = toYMD(edit.desdeFecha);
					const ymd2 = toYMD(edit.hastaFecha);
					if (!ymd1) errors.desdeFecha = "Formato de fecha inválido";
					if (!ymd2) errors.hastaFecha = "Formato de fecha inválido";
					if (ymd1) edit.desdeFecha = ymd1;
					if (ymd2) edit.hastaFecha = ymd2;
					// Comparación numérica (sólo si válidas)
					const n1 = ymdToNum(ymd1);
					const n2 = ymdToNum(ymd2);
					if (!isNaN(n1) && !isNaN(n2) && n2 < n1) {
						errors.hastaFecha = "Debe ser ≥ que 'Desde'";
					}
				}

				if (config.onEditValidate) config.onEditValidate(params);
			},
			onEditError: (params) => {
				const { response, errors } = params;
				errors.error = response?.message ?? "Error al guardar";
				if (config.onEditError) config.onEditError(params);
			},
		},
		tableProps: ({ request }) => ({
			onTableChange: (type, newState) => {
				switch (type) {
					case "sort": {
						const { sortField, sortOrder } = newState;
						return request("list", {
							params: {
								sort: `${sortOrder === "desc" ? "-" : ""}${sortField}`,
							},
						});
					}
					default:
						return;
				}
			},
		}),
		tableRender: (p) => <Table {...p} />,
		formRender: ({ data, request, title, errors, apply, close }) => (
			<Form
				data={data}
				title={title}
				errors={errors}
				disabled={(() => {
					const r = ["A", "M"].includes(request)
						? {}
						: Object.fromEntries([
								"desdeFecha",
								"hastaFecha",
								"norma",
								"resarcitorioMensual",
								"resarcitorioDiario",
								"punitorioMensual",
								"punitorioDiario",
							].map((k) => [k, true])
						);
					if (request !== "B") r.deletedObs = true;
					return r;
				})()}
				hide={["A", "M"].includes(request) ? { deletedObs: true } : {}}
				onChange={apply}
				onClose={close}
			/>
		),
		queryConfig: (action, params) => {
			switch (action) {
				case "Get":
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/ARCATasasInteres/Paginated`,
							method: "GET",
						},
					};
				case "Create":
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/ARCATasasInteres`,
							method: "POST",
						},
					};
				case "Update": {
					const { id, ...others } = params;
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/ARCATasasInteres/${id}`,
							method: "PUT",
						},
						params: others,
					};
				}
				case "Delete": {
					const { id, ...others } = params;
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/ARCATasasInteres/${id}`,
							method: "DELETE",
						},
						params: others,
					};
				}
				default:
					return null;
			}
		},
		getListQuery: ({ params, pagination: { index, size } }) => ({
			action: "Get",
			params: {
				...params,
				page: `${index},${size}`,
			},
		}),
		getMutationQuery: ({ request, data }) => {
			//Agregado Mauro
			const { confirmPassword, ...rest } = data || {};
			// Limpia números
			const toNum = (v) => {
				if (v == null || v === "") return null;
				const s = String(v).replace(/[^\d.,-]/g, "").replace(",", ".");
				const n = Number(s);
				return Number.isFinite(n) ? n : null;
			};
			const m2d = (m) => (m == null ? null : Math.round((m / 30) * 1e6) / 1e6);
			// Normalizamos fechas y porcentajes
			const mensualR = toNum(rest.resarcitorioMensual);
			const diarioR = toNum(rest.resarcitorioDiario);
			const mensualP = toNum(rest.punitorioMensual);
			const diarioP = toNum(rest.punitorioDiario);

			let resarcitorioDiario = diarioR != null ? diarioR : m2d(mensualR);
			let punitorioDiario = diarioP != null ? diarioP : m2d(mensualP);

			if (mensualR != null && resarcitorioDiario != null) {
				const esperado = m2d(mensualR);
				if (Math.abs(resarcitorioDiario - esperado) > 1e-6) resarcitorioDiario = esperado;
			}
			if (mensualP != null && punitorioDiario != null) {
				const esperado = m2d(mensualP);
				if (Math.abs(punitorioDiario - esperado) > 1e-6) punitorioDiario = esperado;
			}

			const normalized = {
				...rest,
				desdeFecha: toYMD(rest.desdeFecha),
				hastaFecha: toYMD(rest.hastaFecha),
				resarcitorioMensual: mensualR,
				resarcitorioDiario,
				punitorioMensual: mensualP,
				punitorioDiario,
			};

			// Probando
			//console.log("getMutationQuery request:", request, "normalized body:", normalized);

			switch (request) {
				case "A":
					return { 
						action: "Create", 
						config: { body: normalized } 
					};
					
				case "M": {
					const { id, ...body } = normalized;
					return { 
						action: "Update", 
						config: { body }, 
						params: { id }, 
					};
				}
				case "B": {
					const { id, deletedObs } = normalized;
					return { 
						action: "Delete", 
						config: { body: { deletedObs } }, 
						params: { id },
					};
				}
				default:
					return;
			}
		},
	});
}