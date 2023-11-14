import React, { useCallback, useEffect, useState, useContext } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import SeccionalesTable from "./SeccionalesTable";
import AuthContext from "../../../store/authContext";
import SeccionalesForm from "./SeccionalesForm";
import dayjs from "dayjs";



const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	errors: null,
};

const useSeccionales = () => {
	//#region Trato queries a APIs
	const Usuario = useContext(AuthContext).usuario;

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetList": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: "/Seccional/GetSeccionalesSpecs",
						method: "POST",
						body: {
							soloActivos: "false",
							ambitoTodos: Usuario.ambitoTodos,
							ambitoSeccionales: Usuario.ambitoSeccionales,
							ambitoDelegaciones: Usuario.ambitoDelegaciones,
							ambitoProvincias: Usuario.ambitoProvincias,
						  },
					},
				};
			}
			case "Create": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional`,
						method: "POST",
					},
				};
			}
			case "Update": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional`,
						method: "PUT",
					},
				};
			}
			case "Delete": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/Reactivar`,
						method: "PATCH",
					},
				};
			}
			case "GetAllDelegaciones": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: "/RefDelegacion/GetAll",
						method: "GET",
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
		delegaciones: [],
		error: null,
		selection: {...selectionDef},
	});


	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetList",
			params: { ...list.params },
			onOk: async ({data}) =>
				setList((o) => {
					const selection = {
						action: "",
						request: "",
						record: data.sort((a, b) => a.codigo > b.codigo ? 1 : -1).find((r) => r.id === o.selection.record?.id) ?? data.at(0),
					};
					if (selection.record)
						selection.index = data.indexOf(selection.record);
					return {
						...o,
						loading: null,
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
	}, [pushQuery, list.loading, list.params]);

	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetAllDelegaciones",

			onOk: async (data) =>
				setList((o) => {
					console.log('delegaciones_useSeccionales:',data)

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
	}, [pushQuery, list]);
	//#endregion

	const requestChanges = useCallback((type, payload = {}) => {
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
			default:
				return;
		}
	}, []);

	let form = null;
	if (list.selection.request) {
		form = (
			<SeccionalesForm
				data={(() => { 

					//INIT DE DATOS DEL FORM
					const data =
					["A"].includes(list.selection.request) ?  //INIT PARA ALTA
						{
							estado: "Activa",
						}:
						["B"].includes(list.selection.request) ? //INIT PARA BAJA
							{
								estado: "Inactiva",
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
						? { estado: true }
						: {
								codigo: true,
								estado: true,
								descripcion: true,
								refDelegacionId: true,
								refLocalidadesId: true,
								domicilio: true,
								observaciones: true,
								
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
					console.log('edit_useAutoridades',changes);
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
					
					if (!["A", "B", "M"].includes(list.selection.request)){
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
					console.log('list.selection',list.selection);
					const record = { ...list.selection.record };

					//Validaciones
					const errors = {};
					if (list.selection.request === "B") {
						 if (!record.deletedObs) errors.deletedObs = "Dato requerido";
					} else {
						if (!record.codigo) errors.codigo = "Dato requerido";
						if (!record.observaciones) errors.observaciones = "Dato requerido";
						if (!record.domicilio) errors.domicilio = "Dato requerido";
						if (!record.refLocalidadesId) errors.refLocalidadesId = "Dato requerido";
						//if (!record.descripcion) errors.descripcion = "Dato requerido";
						if (!record.estado) errors.estado = "Dato requerido";
					}
					console.log('list.selection2',list.selection);
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

					console.log('list.selection3',list.selection);
					
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
							query.params = { id: record.id };
							query.config.body = record.estado;
							break;
						default:
							break;
					}
					pushQuery(query);
				}}
			/>
		);
	}

	const render = () => (
		<>
			<SeccionalesTable
				data={list.data}
				loading={!!list.loading}
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
			/>
			{form}
		</>
	);

	return [render, requestChanges, list.selection.record];
};

export default useSeccionales;
