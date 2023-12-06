import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthContext from "store/authContext";
import {
	handleModuloSeleccionar,
	handleEmpresaSeleccionar,
} from "redux/actions";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import EmpresaDetails from "./empresas/EmpresaDetails";
import EmpresasList from "./empresas/EmpresasList";
import useQueryQueue from "components/hooks/useQueryQueue";
import Action from "components/helpers/Action";
import KeyPress from "components/keyPress/KeyPress";
import EmpresasForm from "../administracion/empresas/EmpresasForm";


const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	errors: null,
};

const SiaruHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const authContext = useContext(AuthContext);
	const [empresaNueva,setEmpresaNueva] = useState();

	const pushQuery = useQueryQueue((action, params) => {

		console.log('siaru_pushQuery',action, "&",params)
		switch (action) {

			case "GetList": {
				const { usuarioId , ...otherParams } = params;
				return {
					config: {
						baseURL: "Seguridad",
						method: "GET",
						endpoint: `/UsuarioEmpresas/${usuarioId}`,
					},
					params: otherParams,
				};
			}

			case "GetEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: "/Empresas/GetEmpresaSpecs",
					},
				};
			}

			case "CreateUsuarioEmpresa": {
				return {
					config: {
						baseURL: "Seguridad",
						endpoint: `/UsuarioEmpresas`,
						method: "POST",
					},
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
				const { id, ...otherParams } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas`,
						method: "PUT",
					},
				};
			}
			default:
				return null;
		}
	});


	const [list, setList] = useState({
		loading: null,
		params: {},
		data: [],
		pagination: { index: 1, size: 15, count: 0 }, 
		delegaciones: [],
		error: null,
		selection: {},
	});

	//#region declaración y carga de empresas
	const [empresas, setEmpresas] = useState({ data: [], selected: null });


	useEffect(()=>{
		
		if (!empresaNueva) return
		console.log('onFinally')
		pushQuery({				
			onError: async (err) => alert(err.message),
			action: "CreateUsuarioEmpresa",
			config:{
				body:{
						"usuarioId": authContext?.usuario?.id,
						"empresaId": empresaNueva
				} //debo pasarle IsUsuario y IdEmpresa
			},
		})

	},[empresaNueva, pushQuery,authContext])


	useEffect(() => {
		setList((o) => ({
			...o,
			loading: "Cargando...",
			data: [],
		}));
	},[]);

	useEffect(() => {
		if (!list.loading) return;
		pushQuery({
			action: "GetList",
			params: {
				usuarioId : authContext.usuario.id,
			},
			onOk: async (data) =>		
				setList((o) => {
					console.log('data_empresas:',data)
					const selection = {
						record: {},//o.selection.record,
						action: "",
						request: "",
						/*record: {
							...(payload.request === "A" ? {} : o.selection.record),
							...payload.record,
						},*/
						//record: data//.sort((a, b) => a.codigo > b.codigo ? 1 : -1)//.find((r) => r.id === o.selection.record?.id) ?? data.at(0),
					};
					if (selection.record)
						selection.index = data.indexOf(selection.record);
					return {
						...o,
						loading: null,
						//pagination: { index, size, count },
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
	}, [pushQuery, list.loading, list.params, authContext.usuario]);



	//#region declaración y carga de empresa
	const [empresa, setEmpresa] = useState({
		loading: null,
		params: {},
		data: {},
		error: null,
	});

	useEffect(() => {

		if (!empresa.loading) return;
		const result = { loading: null, data: null, error: null };
		pushQuery({
			action: "GetEmpresa",
			params: empresa.params,
			onOk: (data) => (result.data = data),
			onError: (error) => (result.error = error),
			onFinally: () => {
				dispatch(handleEmpresaSeleccionar(result.data));
				setEmpresa((o) => ({ ...o, ...result }));
			},
		});

		
	}, [empresa, pushQuery, dispatch]);
	// Cargo empresa cuando cambia la selección de empresas
	useEffect(() => {
		const empresa = {
			loading: null,
			params: { cuit: empresas.selected?.cuitEmpresa },
			data: {},
			error: null,
		};
		if (empresa.params.cuit) empresa.loading = "Cargando...";
		setEmpresa((o) => ({ ...o, ...empresa }));
	}, [empresas.selected?.cuitEmpresa]);
	//#endregion


	let form = null;
	if (list.selection.request) {
		 form = (
		<EmpresasForm
			data={(() => { 

				//INIT DE DATOS DEL FORM
				const data = {}  //INIT PARA ALTA
					return {...list.selection.record, ...data}; //le paso el registro entero  y modifico los campos necesarios segun el request que se está haciendo
				})()
			}
			title={"Relaciona Empresa al usuario: "+authContext.usuario.cuit}
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

				if (!["A", "B"].includes(list.selection.request)){
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
					onOk: async (_res) =>(
						setEmpresaNueva(_res),
						setList((old) => ({ ...old, loading: "...Cargando" }))
					),
					onError: async (err) => alert(err.message),
					onFinally: () => {
					},
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
					default:
						break;
				}
				console.log('SiaruHandler_query',query);
				pushQuery(query);


			}}
		/>
	);
}
	//#region declaracion y carga de acciones
	const [acciones, setAcciones] = useState([]);

	useEffect(() => {
		const acciones = [];

		const addAction = (
			name = "",
			onExecute = (name) => {},
			keys = "",
			combination = "AltKey"
		) =>
			acciones.push(
				new Action({
					name,
					onExecute,
					keys,
					underlineindex: name.toLowerCase().indexOf(keys),
					combination,
				})
		);

		addAction(
			`Relaciona Empresa`,
			(_) => (
				setList((o) => ({
					...o,
					selection: {
						...o.selection,
						request: "A",
						record:{}
					},
				}))
			),
			"r"
		);

		const desc = ((r) =>
			[Formato.Cuit(r?.cuit), r?.razonSocial].filter((r) => r).join(" - "))(
			empresa.data
		);

		if (desc) {
			addAction(
				`Establecimientos de ${desc}`,
				(_) => navigate("Establecimientos"),
				"s"
			);
			addAction(
				`Liquidaciones de ${desc}`,
				(_) => navigate("Liquidaciones"),
				"q"
			);
		}
		dispatch(handleModuloSeleccionar({ nombre: "SIARU", acciones }));
		setAcciones(acciones);
	}, [empresa.data, dispatch, navigate]);
	//#endregion

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">
				<Grid
					col
					full
					style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
				>
					<Grid full="width">
						<h2 className="subtitulo">Empresas</h2>
					</Grid>
					<Grid full="width" col grow gap="5px">
						<Grid grow>
							<EmpresasList
								data={list.data}
								loading={!!list.loading}
								pagination={{index:1,size:5}}
								selection={{
									//selected: [empresas.selected?.cuitEmpresa].filter((r) => r),
									selected: [list.selection.record?.id].filter((r) => r),
									//onSelect: (selected) =>
										//setEmpresas((o) => ({ ...o, selected })),
									onSelect: (record, isSelect, index, e) =>{
									setList((o) => ({
										...o,
										selection: {
											action: "",
											request: "",
											index,
											record,
										},
									}))
									setEmpresa((o)=>({
										...o,
										 loading:"cargando",
										 params:{cuit:record.cuitEmpresa}
										}))
									//dispatch(handleEmpresaSeleccionar(record));
								}
								}}

							/>
						</Grid>
						<EmpresaDetails />
						<KeyPress items={acciones} />
					</Grid>
				</Grid>
				{form}
			</div>
		</>
	);
};

export default SiaruHandler;
