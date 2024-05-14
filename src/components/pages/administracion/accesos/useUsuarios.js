import React from "react";
import { useSelector } from "react-redux";
import TableHook from "components/ui/Table/TableHook";
import UsuariosTable from "./UsuariosTable";
import UsuariosForm from "./UsuariosForm";

/** imports: TableHookConfig y TableHookReturn
 * @typedef {import('components/ui/Table/TableHook').TableHookConfig} TableHookConfig
 * @typedef {import('components/ui/Table/TableHook').TableHookReturn} TableHookReturn
 */

/** useUsuarios
 * @param {TableHookConfig} config
 * @returns {TableHookReturn}
 */
const useUsuarios = (config = {}) => {
	//Obtengo los modulos del usuario logueado
	const usuarioLogueado = useSelector((state) => state.usuarioLogueado);

	// const filtrarTipo =
	// 	usuarioLogueado?.roles?.find((u) => u === "Administrador") != null
	// 		? false
	// 		: usuarioLogueado?.tipo !== "" && usuarioLogueado?.tipo !== null
	// 		? true
	// 		: false;

	const tipo =
		usuarioLogueado?.roles?.find((u) => u === "Administrador") == null
			? usuarioLogueado?.tipo ?? ""
			: "";

	return TableHook({
		config: {
			remote: true,
			pagination: { index: 1, size: 15 },
			...config,
			onEditValidate: (params) => {
				const { edit, request, errors } = params;
				if (request === "B" || request === "R") {
					 if (!edit.deletedObs) errors.deletedObs = "Dato requerido";
				} else {
					if (!edit.cuit) errors.cuit = "Dato requerido";
					if (!edit.nombre) errors.nombre = "Dato requerido";
					if (!edit.userName) errors.userName = "Dato requerido";
					if (!edit.email) errors.email = "Dato requerido";
					if (request === "A") {
						if (!edit.password) errors.password = "Dato requerido";
						if (!edit.confirmPassword) errors.confirmPassword = "Dato requerido";
						if (edit.password !== edit.confirmPassword){
							errors.password = "Las Claves deben ser idénticas";
							errors.confirmPassword = "Las Claves deben ser idénticas";
						}
					}
				}
				if (config.onEditValidate) config.onEditValidate(params);
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
		tableRender: (p) => <UsuariosTable {...p} />,
		requests: ["A", "B", "M", "R"],
		formRender: ({ data, request, title, errors, apply, close }) => (
			<UsuariosForm
				data={data}
				title={title}
				errors={errors}
				disabled={(() => {
					const r = ["A", "M"].includes(request)
						? {}
						: Object.fromEntries([
							"nombre",
							"cuit",
							"userName",
							"email",
							"emailConfirmed",
							"phoneNumber",
							"password",
							"confirmPassword",
						].map(k => [k, true]));
					if (request !== "B") r.deletedObs = true;
					return r;
				})()}
				hide={(() => {
					const h = ["A", "M"].includes(request) ? { deletedObs: true } : {};
					if (!["A"].includes(request)) {
						h.password = true;
						h.confirmPassword = true;
					}
					return h;
				})()}
				onChange={apply}
				onClose={close}
			/>
		),
		queryConfig: (action, params) => {
			switch (action) {
				case "GetList": {
					return {
						config: {
							baseURL: "Seguridad",
							endpoint: `/Usuario/GetAll`,
							method: "GET",
						},
					};
				}
				case "Create": {
					return {
						config: {
							baseURL: "Seguridad",
							endpoint: `/Usuario/registrar`,
							method: "POST",
						},
					};
				}
				case "Update": {
					return {
						config: {
							baseURL: "Seguridad",
							endpoint: `/Usuario`,
							method: "PATCH",
						},
					};
				}
				case "DarDeBaja": {
					const { id, ...otherParams } = params;
					return {
						config: {
							baseURL: "Seguridad",
							endpoint: `/Usuario/DarDeBaja`,
							method: "PUT",
						},
						params: otherParams,
					};
				}
				case "Reactivar": {
					const { id, ...otherParams } = params;
					return {
						config: {
							baseURL: "Seguridad",
							endpoint: `/Usuario/Reactivar`,
							method: "PUT",
						},
						params: otherParams,
					};
				}
				default:
					return null;
			}
		},
		getListQuery: ({ params, pagination }) => ({
			action: "GetList",
			params: {
				...params,
				pageIndex: pagination.index,
				pageSize: pagination.size,
				// tipo: filtrarTipo ? usuarioLogueado.tipo : "",
				tipo,
			},
		}),
		getMutationQuery: ({ request, data }) => {
			//ESTOS DELETE  DEBEN DESAPARECER CUANDO CIRO AGREGUE LOS CAMPOS DEL OBJ AL ENDPOINT
			delete data.confirmPassword;

			switch (request) {
				case "A":
					return {
						action: "Create",
						config: {
							body: {
								...data,
								tipo: "Interno",
								tareas: [],
								cuit: parseInt(data.cuit),
							},
						},
					};
				case "M":
					return {
						action: "Update",
						config: { body: data },
					};
				case "B":
					return {
						action: "DarDeBaja",
						config: { body: { id: data.id, deletedObs: data.deletedObs } },
					};
				case "R":
					return {
						action: "Reactivar",
						config: { body: { id: data.id } },
					};
				default:
					return;
			}
		},
	});
};

export default useUsuarios;
