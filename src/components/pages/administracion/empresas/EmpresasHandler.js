import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import dayjs from "dayjs";
import { Tabs, Tab } from "@mui/material";
import AuthContext from "store/authContext";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import useHttp from "components/hooks/useHttp";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import useEmpresas, { onLoadSelectKeepOrFirst } from "./useEmpresas";

const EmpresasHandler = () => {
	const dispatch = useDispatch();

	const Usuario = useContext(AuthContext).usuario;

	const { isLoading, error, sendRequest: request } = useHttp();

	const tabs = [];
	const [tab, setTab] = useState(0);
	const [localidadesTodas, setLocalidadesTodas] = useState([]);

	useEffect(()=>{

		const processLocalidades = async (localidadesObj) => {
				
			setLocalidadesTodas(localidadesObj);
		};

		request(
			{
			baseURL: "Comunes",
			endpoint: "/RefLocalidad",
			method: "GET",
			},
			processLocalidades
		);
	},[]);
	
	//#region Localidades Params
	const [empresasParams, setEmpresasParams] = useState({
		filtro: "",
		orderBy: "razonSocial"
	});
	//#endregion

	//#region Tab Empresas
	const {
		render: empresasTab,
		request: empresaChanger,
		selected: empresaSelected,
	} = useEmpresas({ onLoadSelect: onLoadSelectKeepOrFirst });
	const [empresasActions, setEmpresasActions] = useState([]);
	
	useEffect(() => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => empresaChanger("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Agrega Empresa`,
				request: "A",
				tarea: "Datos_EmpresaAgrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = Formato.Cuit(empresaSelected?.cuit) || empresaSelected?.razonSocial;

		actions.push(
			createAction({
				action: `Consulta Empresa ${desc}`,
				request: "C",
				tarea: "Datos_EmpresaConsulta",
				record: {},
				...(!empresaSelected?.id
					? { disabled: true }
					: {
							disabled: false,
							keys: "o",
							underlineindex: 1,
					  }),
			})
		);
		actions.push(
			createAction({
				action: `Modifica Empresa ${desc}`,
				request: "M",
				record: {},
				tarea: "Datos_EmpresaModifica",
				...(empresaSelected?.deletedDate || !empresaSelected?.id
					? { disabled: true }
					: {
							disabled: false,
							keys: "m",
							underlineindex: 0,
					  }),
			})
		);

		if (empresaSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Empresa ${desc}`,
					request: "R",
					record: {},
					tarea: "Datos_EmpresaReactiva",
					keys: "r",
					underlineindex: 0,
				})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Empresa ${desc}`,
					request: "B",
					record: {
						...empresaSelected,
						deletedDate: dayjs().format("YYYY-MM-DD"),
						deletedBy: Usuario.nombre,
					},
					tarea: "Datos_EmpresaBaja",
					...(empresaSelected?.deletedDate || !empresaSelected?.id
						? { disabled: true }
						: {
								disabled: false,
								keys: "b",
								underlineindex: 0,
						  }),
				})
			);
		}
		setEmpresasActions(actions); //cargo todas las acciones / botones
	}, [empresaChanger, empresaSelected]);

	tabs.push({
		header: () => <Tab label="Empresas" />,
		body: () => empresasTab(),
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<InputMaterial
						label="Filtro por CUIT / Razón social"
						value={empresasParams.filtro}
						onChange={(filtro) => {
							setEmpresasParams((o) => ({ ...o, filtro }));
						}}
					/>
				</Grid>
				{empresasTab()}
			</Grid>
		),
		actions: empresasActions,
	});

	//Carga de lista según parametros
	useEffect(() => {
		const { filtro, ...params } = empresasParams;
		const payload = {
			params,
			pagination: { size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		};
		if (filtro) params.filtro = filtro;
		empresaChanger("list", payload);
	}, [empresaChanger, empresasParams]);
	//#endregion

	/*
	//#region Tab DDJJ 
	const [DDJJTab, DDJJChanger, DDJJSelected] = useDDJJ();
	const [DDJJActions, setDDJJActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const secc = empresaSelected?.codigo != "" ? empresaSelected?.codigo : empresaSelected?.id;
		if (!secc) {
			setDDJJActions(actions);
			return;
		}
		const seccDesc = `para Empresa ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					DDJJChanger("selected", {
						request,
						action,
						record: { empresaId: empresaSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega DDJJ ${seccDesc}`,
				request: "A",
				tarea: "Empresa_DDJJ_Agrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const sele = DDJJSelected?.id;
		if (!sele) {
			setDDJJActions(actions);
			return;
		}
		const seleDesc = `${sele} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta DDJJ ${seleDesc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica DDJJ ${seleDesc}`,
				request: "M",
				tarea: "Empresa_DDJJ_Modifica",

				...(DDJJSelected?.deletedDate ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "m",
					 underlineindex: 0
					}
				)
			})
		);
		if (DDJJSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva DDJJ ${seleDesc}`,
					request: "R",
					tarea: "Empresa_DDJJ_Reactiva",
					keys: "r",
					underlineindex: 0,
			})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja DDJJ ${seleDesc}`,
					request: "B",
					tarea: "Empresa_DDJJ_Baja",
					...(DDJJSelected?.deletedDate ? 
						{disabled:  true}
						:
						{
						 disabled:  false,
						 keys: "b",
						 underlineindex: 0
						}
					)
			})
			);
		}
		setDDJJActions(actions);
	}, [DDJJChanger, DDJJSelected, empresaSelected?.id]);
	tabs.push({
		header: () => <Tab label="DDJJ" disabled={!empresaSelected?.id || empresaSelected.deletedDate} />,
		body: DDJJTab,
		actions: DDJJActions,
	});

	// Si cambia Empresa, refresco lista de DDJJ
	useEffect(() => {
		DDJJChanger("list", {
			clear: !empresaSelected?.id,
			params: { empresaId: empresaSelected?.id },
		});
	}, [empresaSelected?.id, DDJJChanger]);
	//#endregion*/


	//#region Tab documentaciones
	/*
	const [documentacionesTab, documentacionChanger, documentacionSelected] =
		useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);

	useEffect(() => {
		const actions = [];
		const secc = empresaSelected?.codigo != "" ? empresaSelected?.codigo : empresaSelected?.id;
		if (!secc) {
			setDocumentacionesActions(actions);
			return;
		}
		const seccDesc = `para Empresa ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "S", entidadId: empresaSelected?.id, soloactivos: false },
					}),
				combination: "AltKey",
				...x,
			});

		actions.push(
			createAction({
				action: `Agrega Documentación ${seccDesc}`,
				request: "A",
				tarea: "Empresa_Documentacion_Agrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const docu = documentacionSelected?.id;
		if (!docu) {
			setDocumentacionesActions(actions);
			return;
		}
		const docuDesc = `${docu} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta Documentación ${docuDesc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Documentación ${docuDesc}`,
				request: "M",
				tarea: "Empresa_Documentacion_Modifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		actions.push(
			createAction({
				action: `Baja Documentación ${docuDesc}`,
				request: "B",
				tarea: "Empresa_Documentacion_Baja",
				keys: "b",
				underlineindex: 0,
			})
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, empresaSelected?.id]);


	tabs.push({
		header: () => <Tab label="Documentacion" disabled={!empresaSelected?.id || empresaSelected.deletedDate} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia Empresa, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !empresaSelected?.id,
			params: { entidadTipo: "S", entidadId: empresaSelected?.id, soloactivos: false },
		});
	}, [empresaSelected?.id, documentacionChanger]);
	//#endregion*/


	//#region Tab EmpresaLocalidades
	/*
	const [empresaLocalidadesTab, empresaLocalidadesChanger, empresaLocalidadesSelected] = useEmpresaLocalidades();
	const [empresaLocalidadesActions, setEmpresaLocalidadesActions] = useState([]);

	useEffect(() => {
		console.log('UseE_EmpresaLocalidades')
		const actions = [];
		const secc = empresaSelected?.codigo != "" ? empresaSelected?.codigo : empresaSelected?.id;
		if (!secc) {
			setEmpresaLocalidadesActions(actions);
			return;
		}
		const seccDesc = `para Empresa ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
				empresaLocalidadesChanger("selected", {
					request,
					action,
					localidades: localidadesTodas,
					record: { empresaId: empresaSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});

		actions.push(
			createAction({
				action: `Agrega Localidad ${seccDesc}`,
				request: "A",
				tarea: "Empresa_Localidad_Agrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const docu = empresaLocalidadesSelected?.codigo;
		if (!docu) {
			setEmpresaLocalidadesActions(actions);
			return;
		}
		const docuDesc = `${docu} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta Localidad ${docuDesc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		/*actions.push(
			createAction({
				action: `Modifica Localidad ${docuDesc}`,
				request: "M",
				keys: "m",
				underlineindex: 0,
			})
		);

		if (empresaLocalidadesSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Localidad ${docuDesc}`,
					tarea: "Empresa_Localidad_Reactiva",
					request: "R",
					keys: "r",
					underlineindex: 0,
			})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Localidad ${docuDesc}`,
					request: "B",
					tarea: "Empresa_Localidad_Baja",
					...(empresaLocalidadesSelected?.deletedDate ? 
						{disabled:  true}
						:
						{
						 disabled:  false,
						 keys: "b",
						 underlineindex: 0
						}
					)
			})
			);
		}
		
		setEmpresaLocalidadesActions(actions);
	}, [empresaLocalidadesChanger, empresaLocalidadesSelected, empresaSelected?.id]);


	tabs.push({
		header: () => <Tab label="Localidades" disabled={!empresaSelected?.id || empresaSelected.deletedDate} />,
		body: empresaLocalidadesTab,
		actions: empresaLocalidadesActions,
	});

	// Si cambia Empresa, refresco lista de documentación
	/*
	useEffect(() => {
		console.log('empresaSelected',empresaSelected)
		empresaLocalidadesChanger("list", {
			clear: !empresaSelected?.id,
			localidades: localidadesTodas,
			//data: empresaSelected?.empresaLocalidad ?? [{}],
			params: { empresaId: empresaSelected?.id,  soloactivos: false},
		});
	}, [localidadesTodas, empresaSelected?.id, documentacionChanger]);
	//#endregion*/


	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Empresas", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Empresas</h1>
			</Grid>
		
	
			<div className="tabs">
				<text>{empresaSelected?.razonSocial ? ` ${empresaSelected?.cuit} - ${empresaSelected.razonSocial ?? ""}` : " " }</text>

				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</div>

			{tabs[tab].body()}
			<KeyPress items={acciones} />
		
		</Grid>
	);
};

export default EmpresasHandler;
