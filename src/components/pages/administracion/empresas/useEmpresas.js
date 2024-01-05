import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import EmpresasTable from "./EmpresasTable";
import AuthContext from "../../../../store/authContext";
import EmpresasForm from "./EmpresasForm";
import dayjs from "dayjs";
import ValidarCUIT from "components/validators/ValidarCUIT";


const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	errors: null,
};

const useEmpresas = ({onLoadSelect: onLoadSelectInit = ({ data, record }) => data.find((r) => r.id === record?.id) ?? data.at(0) }) => {

		
	//#region Trato queries a APIs
	const Usuario = useContext(AuthContext).usuario;

	const pushQuery = useQueryQueue((action, params) => {
		console.log('action & param: ', action," & ", params);
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/Empresas/GetEmpresasListSpecs",
						method: "GET",
						/*body: {
							bajas: "false",
							ambitoTodos: Usuario.ambitoTodos,
							ambitoProvincias: Usuario.ambitoProvincias,
							ambitoDelegaciones: Usuario.ambitoDelegaciones,
							ambitoEmpresas: Usuario.ambitoEmpresas,
						 },*/
					},
				};
			}
			case "GetById": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/GetEmpresaSpecs${id}`,
						method: "GET",
					},
					params: otherParams,
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas`,
						method: "POST",
					},
				};
			}
			case "Update": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/Reactivar`,
						method: "PATCH",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		params: {},
		data: [],
		pagination: { index: 1, size: 15, count: 0 }, 
		delegaciones: [],
		error: null,
		selection: {...selectionDef},
		onLoadSelect: onLoadSelectInit,
	});
	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetList",
			params: {
				...list.params,
				pageIndex: list.pagination.index,
				pageSize: list.pagination.size,
			},
			onOk: async ({index, size, count, data}) =>		
				setList((o) => {
					console.log('data_empresas:',data)
					const selection = {
						record:
							list.onLoadSelect({ data, record: o.selection.record }),
						action: "",
						request: "",
						//record: data//.sort((a, b) => a.codigo > b.codigo ? 1 : -1)//.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
					};
					if (selection.record)
						selection.index = data.indexOf(selection.record);
					return {
						...o,
						loading: null,
						pagination: { index, size, count },
						data,
						error: null,
						selection,
					};
				}),
			onError: async (err) =>
				setList((o) => ({
					...o,
					loading: null,
					data: [],
					error: err.code === 404 ? null : err,
					selection: { ...selectionDef },
				})),
		});
	}, [pushQuery, list]);


	/*
	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetAllDelegaciones",

			onOk: async (data) =>
				setList((o) => {
					//console.log('delegaciones_useEmpresas:',data)

					const delegaciones = data.map((refDelegacion) => {
						return { value: refDelegacion.id, label: `${refDelegacion.codigoDelegacion}-${refDelegacion.nombre}` };
					 });	
					return {
						...o,
						loading: null,
						//pagination: { index, size, count },
						delegaciones,
						error: null,
					};
				}),
			onError: async (err) =>
				setList((o) => ({
					...o,
					loading: null,
					delegaciones: [],
					error: err.code === 404 ? null : err,
				})),
		});
	}, [pushQuery, list]);*/
	//#endregion

	const requestChanges = useCallback((type, payload = {}) => {
		console.log('useEmpresas_RequestType:',type," payload:",payload)
		switch (type) {
			case "selected": {
				return setList((o) => ({
					...o,
					selection: {
						...o.selection,
						request: payload.request,
						action: payload.action,
						record: {
							...(payload.request === "A" ? {} : o.selection.record),
							...payload.record,
						},
					},
				}));
			}
			case "list": {
				if (payload.clear)
					return setList((o) => ({
						...o,
						loading: null,
						data: [],
						error: null,
						selection: { ...selectionDef },
					}));
				return setList((o) => ({
					...o,
					loading: "Cargando...",
					params: { ...payload.params },
					data: [],
				}));
			}
			case "GetById": {
				console.log('GetById_payload:',payload);
				return pushQuery({
					action: "GetById",
					params: { ...payload.params },
					onOk: async (obj) =>
						
						{
						let data = [];
						data.push(obj);
						console.log('data_Empresa',data);
						setList((o) => {
							const selection = {
								action: "",
								request: "",
								record: data,
							};
							return {
								...o,
								loading: null,
								data,
								error: null,
								selection,
							};
						})},
					onError: async (err) =>
						setList((o) => ({
							...o,
							loading: null,
							data: [],
							error: err.code === 404 ? null : err,
							selection: { ...selectionDef },
						})),
				});
			}
			default:
				return;
		}
	}, [pushQuery]);

	let form = null;
	if (list.selection.request) {
		form = (
			<EmpresasForm
				data={(() => { 
					//INIT DE DATOS DEL FORM
					const data =
					["A"].includes(list.selection.request) ?  //INIT PARA ALTA
						{}:
						["B"].includes(list.selection.request) ? //INIT PARA BAJA
							{
								deletedDate: dayjs().format("YYYY-MM-DD"),
								deletedBy: Usuario.nombre,
							}:
							{}

						return {...list.selection.record, ...data}; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
					})()
				}
				delegaciones={list.delegaciones}
				title={list.selection.action}
				errors={list.selection.errors}
				loading={!!list.loading}
				disabled={(() => {

					const r = ["A", "M"].includes(list.selection.request)
						? { }
						: {
								cuit: true,
								razonSocial	:true,
								claveTipo	:true,
								claveEstado	:true,
								claveInactivaAsociada	:true,
								actividadPrincipalDescripcion	:true,
								actividadPrincipalId	:true,
								actividadPrincipalPeriodo	:true,
								contratoSocialFecha	:true,
								cierreMes	:true,
								email	:true,
								telefono	:true,
								domicilioCalle	:true,
								domicilioNumero	:true,
								domicilioPiso	:true,
								domicilioDpto	:true,
								domicilioSector	:true,
								domicilioTorre	:true,
								domicilioManzana	:true,
								domicilioProvinciasId	:true,
								domicilioLocalidadesId	:true,
								domicilioCodigoPostal	:true,
								domicilioCPA	:true,
								domicilioTipo	:true,
								domicilioEstado	:true,
								domicilioDatoAdicional	:true,
								domicilioDatoAdicionalTipo	:true,
								ciiU1	:true,
								ciiU1Descripcion	:true,
								ciiU1EsRural	:true,
								ciiU2	:true,
								ciiU2Descripcion	:true,
								ciiU2EsRural	:true,
								ciiU3	:true,
								ciiU3Descripcion	:true,
								ciiU3EsRural	:true,
								localidadDescripcion	:true,
								provinciaDescripcion	:true,
								esEmpresaRural	:true,
								
						  };
					if (list.selection.request !== "B") r.deletedObs = true;
					r.deletedBy=true;
					r.deletedDate=true;

					return r;
				})()}
				hide={
					["A", "M"].includes(list.selection.request)
						? { deletedObs: true }
						: {}
				}
				onChange={(changes) =>{ //solo entra el campo que se está editando
					console.log('useEmpresas_changes:',changes)
					setList((o) => ({
						...o,
						selection: {
							...o.selection,
							record: {
								...o.selection.record,
								...changes,
							},
						},
					}))
					}
				}

				/*onTextChange={(partialText)=>{
					console.log('partialText',partialText);
					//setLocalidadBuscar(partialText);
				}}*/

				onClose={(confirm) => {
					
					if (!["A", "B", "M", "R"].includes(list.selection.request)){
						confirm = false}
					if (!confirm) {
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								request: "",
								action: "",
								record: o.data.at(o.selection.index),
								errors: null,
							},
						}));
						return;
					}
					
					const record = { ...list.selection.record };

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						 if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					}
					
					if (["A", "M"].includes(list.selection.request)){
						
						if (!record.cuit) errors.cuit = "Dato requerido";
						if (!ValidarCUIT(record.cuit)) errors.cuit = "CUIT Incorrecto";
						if (!record.razonSocial) errors.razonSocial = "Dato requerido";
						if (!record.domicilioCalle) errors.domicilioCalle = "Dato requerido";
						//if (!record.refLocalidadesId || record.refLocalidadesId == 0) errors.refLocalidadesId = "Dato requerido";
						if (!record.actividadPrincipalDescripcion) errors.actividadPrincipalDescripcion = "Dato requerido";
						if (!record.telefono) errors.telefono = "Dato requerido"; 
						if (!record.email) errors.email = "Dato requerido"; 

						if (!record.ciiU1Descripcion) errors.ciiU1Descripcion = "Dato requerido";
						if (!record.ciiU2Descripcion) errors.ciiU2Descripcion = "Dato requerido";
						if (!record.ciiU3Descripcion) errors.ciiU3Descripcion = "Dato requerido";

						//if (!record.domicilioLocalidadesId || record.domicilioLocalidadesId === 0) errors.domicilioLocalidadesId = "Dato requerido";
						//if (!record.domicilioProvinciasId || record.domicilioProvinciasId === 0) errors.domicilioProvinciasId = "Dato requerido";
					}
				
					console.log('useEmpresas_errors',errors);

					if (Object.keys(errors).length) {
						setList((o) => ({
							...o,
							selection: {
								...o.selection,
								errors,
							},
						}));
						return;
					}

					const query = {
						config: {},
						onOk: async (_res) =>
							setList((old) => ({ ...old, loading: "Cargando..." })),
						onError: async (err) => alert(err.message),
					};

					switch (list.selection.request) {
						case "A":
							query.action = "Create";
							query.config.body = record;
							break;
						case "M":
							query.action = "Update";
							query.params = { id: record.id };
							query.config.body = record;
							break;
						case "B":
							query.action = "Delete";
							query.params = { id: record.id };
							query.config.body = { id: record.id, deletedObs: record.deletedObs };
							break;
						case "R":
							query.action = "Reactiva";
							//query.params = { id: record.id };
							query.config.body = { id: record.id };
							break;
						default:
							break;
					}
					//console.log('useEmpresas_query',query);
					pushQuery(query);
				}}
			/>
		);
	}

	const render = () => (
		<>
			<EmpresasTable
				remote
				data={list.data}
				loading={!!list.loading}
				pagination={{
					...list.pagination,
					onChange: ({ index, size }) =>
						setList((o) => ({
							...o,
							loading: "Cargando...",
							pagination: { index, size },
							data: [],
						})),
				}}
				noDataIndication={
					list.loading ?? list.error?.message ?? "No existen datos para mostrar"
				}
				selection={{
					selected: [list.selection.record?.id].filter((r) => r),
					onSelect: (record, isSelect, index, e) =>
						setList((o) => ({
							...o,
							selection: {
								action: "",
								request: "",
								index,
								record,
							},
						})),
				}}
				onTableChange={(type, newState) => {
					switch (type) {
						case "sort": {
							const { sortField, sortOrder } = newState;
							return setList((o) => ({
								...o,
								loading: "Cargando...",
								params: {
									...o.params,
									orderBy: `${sortField}${sortOrder === "desc" ? "Desc" : ""}`,
								},
							}));
						}
						default:
							return;
					}
				}}
			/>
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useEmpresas;
