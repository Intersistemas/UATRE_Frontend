import React from "react";
import { useSelector } from "react-redux";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import TableHook from "components/ui/Table/TableHook";
import ValidarEmail from "components/validators/ValidarEmail";
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
		requests: ["A", "B", "M", "R"],
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
					else if (!ValidarEmail(edit.email)) errors.email = "Dato inválido";
					if (request === "A") {
						if (!edit.password) errors.password = "Dato requerido";
						if (!edit.confirmPassword) errors.confirmPassword = "Dato requerido";
						if (edit.password !== edit.confirmPassword){
							errors.password = "Las Claves deben ser idénticas";
							errors.confirmPassword = "Las Claves deben ser idénticas";
						}
					}
					if (edit.phoneNumber && !isPossiblePhoneNumber(edit.phoneNumber))
						errors.phoneNumber = "Dato inválido";
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
		tableRender: (p) => <UsuariosTable {...p} />,
		formRender: ({ data, request, title, errors, apply, close }) => (
			<UsuariosForm
				/*data={(() => {
					
						const d = ["A"].includes(request) ? {data, tipo: usuarioLogueado?.tipo} : {data}
						console.log("data para insert2",d)
						return d;
						})()}*/
				//data={data}
				
				data = {(() => {
					const d =  data;
					if (["A"].includes(request)) d.tipo= usuarioLogueado?.tipo;
					return d;
				})()}

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
								//tipo: data.tipo, se asigna por defecto lo que trae data.tipo
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
