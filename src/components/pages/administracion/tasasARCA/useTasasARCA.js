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
				}
				if (config.onEditValidate) config.onEditValidate(params);
			},
			onEditError: (params) => {
				const { response, errors } = params;
				errors.error = response.message;
				if (config.onEditError) config.onEditError(params);
			}
		},
		tableProps: ({ request }) => {
			return ({
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
				}
			});
		},
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
						].map(k => [k, true]));
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
				case "Get": {
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/ARCATasasInteres/Paginated`,
							method: "GET",
						},
					};
				}
				case "Create": {
					return {
						config: {
							baseURL: "Comunes",
							endpoint: `/ARCATasasInteres`,
							method: "POST",
						},
					};
				}
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
			//ESTOS DELETE  DEBEN DESAPARECER CUANDO CIRO AGREGUE LOS CAMPOS DEL OBJ AL ENDPOINT
			delete data.confirmPassword;
			switch (request) {
				case "A": {
					return {
						action: "Create",
						config: { body: data },
					};
				}
				case "M": {
					const { id, ...body } = data;
					return {
						action: "Update",
						config: { body },
						params: { id },
					};
				}
				case "B": {
					const { id, deletedObs } = data;
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