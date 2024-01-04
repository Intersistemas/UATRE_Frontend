import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
//import useAutoridades from "components/pages/administracion/empresas/autoridades/useAutoridades";
import KeyPress from "components/keyPress/KeyPress";
import useEmpresas from "./useEmpresas";
//import useEmpresaLocalidades from "./empresaLocalidades/useEmpresaLocalidades";
import useHttp from "../../../hooks/useHttp";

const EmpresasHandler = () => {
	const dispatch = useDispatch();
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
	
	
	//#region Tab Empresas
	const [empresasTab, empresaChanger, empresaSelected] = useEmpresas( {onLoadSelect: ({record})=> record});
	const [empresasActions, setEmpresasActions] = useState([]);
	
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) => empresaChanger("selected", { request, action }),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega Empresa`,
				request: "A",
				tarea: "Empresa_Agrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = empresaSelected?.cuit ?? empresaSelected?.razonSocial;

		actions.push(
			createAction({
				action: `Consulta Empresa ${desc}`,
				request: "C",

				...(!empresaSelected?.id ? 
					{disabled:  true}
					:
					{
					 disabled:  false,
					 keys: "o",
					 underlineindex: 1
					}
				)
		
			})
		);
		actions.push(
			createAction({
				action: `Modifica Empresa ${desc}`,
				request: "M",
				tarea: "Empresa_Modifica",

				...(empresaSelected?.deletedDate || !empresaSelected?.id ? 
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



		if (empresaSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Empresa ${desc}`,
					tarea: "Empresa_Reactiva",
					request: "R",
					keys: "r",
					underlineindex: 0,
			})
			);
		}else{
			actions.push(
				createAction({
					action: `Baja Empresa ${desc}`,
					request: "B",
					tarea: "Empresa_Baja",
	
					...(empresaSelected?.deletedDate || !empresaSelected?.id ? 
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
		setEmpresasActions(actions); //cargo todas las acciones / botones
	}, [empresaChanger, empresaSelected]);

	tabs.push({
		header: () => <Tab label="Empresas" />,
		body: empresasTab,
		actions: empresasActions,
	});

	useEffect(() => {
		empresaChanger("list", { params: { orderBy: "razonSocial"} })
	}, [empresaChanger]);
	//#endregion

	//#region Tab Autoridades 
	/*
	const [autoridadesTab, autoridadesChanger, autoridadSelected] = useAutoridades();
	const [autoridadesActions, setAutoridadesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const secc = empresaSelected?.codigo != "" ? empresaSelected?.codigo : empresaSelected?.id;
		if (!secc) {
			setAutoridadesActions(actions);
			return;
		}
		const seccDesc = `para Empresa ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					autoridadesChanger("selected", {
						request,
						action,
						record: { empresaId: empresaSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Autoridad ${seccDesc}`,
				request: "A",
				tarea: "Empresa_Autoridad_Agrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const sele = autoridadSelected?.id;
		if (!sele) {
			setAutoridadesActions(actions);
			return;
		}
		const seleDesc = `${sele} ${seccDesc}`;
		actions.push(
			createAction({
				action: `Consulta Autoridad ${seleDesc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Autoridad ${seleDesc}`,
				request: "M",
				tarea: "Empresa_Autoridad_Modifica",

				...(autoridadSelected?.deletedDate ? 
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
		if (autoridadSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Autoridad ${seleDesc}`,
					request: "R",
					tarea: "Empresa_Autoridad_Reactiva",
					keys: "r",
					underlineindex: 0,
			})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Autoridad ${seleDesc}`,
					request: "B",
					tarea: "Empresa_Autoridad_Baja",
					...(autoridadSelected?.deletedDate ? 
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
		setAutoridadesActions(actions);
	}, [autoridadesChanger, autoridadSelected, empresaSelected?.id]);
	tabs.push({
		header: () => <Tab label="Autoridades" disabled={!empresaSelected?.id || empresaSelected.deletedDate} />,
		body: autoridadesTab,
		actions: autoridadesActions,
	});

	// Si cambia Empresa, refresco lista de autoridades
	useEffect(() => {
		autoridadesChanger("list", {
			clear: !empresaSelected?.id,
			params: { empresaId: empresaSelected?.id },
		});
	}, [empresaSelected?.id, autoridadesChanger]);
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
