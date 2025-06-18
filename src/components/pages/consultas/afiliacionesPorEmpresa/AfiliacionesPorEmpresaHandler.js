import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import dayjs from "dayjs";
import { Tabs, Tab } from "@mui/material";
import AuthContext from "store/authContext";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import useFormularioOsprera, { onLoadSelectKeepOrFirst } from "./useAfiliacionesPorEmpresa";
import Button from "components/ui/Button/Button";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import useAfiliacionesPorEmpresaDetalle from "./afiliacionesPorEmpresaDetalle/useAfiliacionesPorEmpresaDetalle";

const AfiliacionesPorEmpresaHandler = () => {
	const dispatch = useDispatch();

	const Usuario = useContext(AuthContext).usuario;

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Formularios Params
	const [paramsEdit, setParamsEdit] = useState({});
	const [paramsSend, setParamsSend] = useState({});
	//#endregion

	//#region Tab Formularios
	const {
		render: formulariosOspreraRender,
		request: formularioOspreraRequest,
		selected: formularioSelected,
	} = useFormularioOsprera({
		params: { orderBy: "cuitTitular" },
		onLoadSelect: onLoadSelectKeepOrFirst,
	});
	const [formularioOspreraActions, setFormularioOspreraActions] = useState([]);

	useEffect(() => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => formularioOspreraRequest("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Nueva Solicitud Afiliación`,
				request: "A",
				tarea: "Consultas_AfiliacionesPorEmpresaNueva",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc =formularioSelected?.id;
			//Formato.Cuit(formularioSelected?.cuitTitular) || formularioSelected?.cuitTitular;
	console.log("formularioSelected",formularioSelected)
		actions.push(
			createAction({
				action: `Consulta Solicitud Afiliación ${desc}`,
				request: "C",
				tarea: "Osprera_GestionConsulta",
				record: {},
				...(!formularioSelected?.id
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
				action: `Modifica Solicitud Afiliación ${desc}`,
				request: "M",
				record: {},
				tarea: "Osprera_GestionModifica",
				...(formularioSelected?.deletedDate || !formularioSelected?.id
					? { disabled: true }
					: {
							disabled: false,
							keys: "m",
							underlineindex: 0,
					  }),
			})
		);

		if (formularioSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Solicitud Afiliación ${desc}`,
					request: "R",
					record: {},
					tarea: "Osprera_GestionReactiva",
					keys: "r",
					underlineindex: 0,
				})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Solicitud Afiliación ${desc}`,
					request: "B",
					record: {
						...formularioSelected,
						deletedDate: dayjs().format("YYYY-MM-DD"),
						deletedBy: Usuario.nombre,
					},
					tarea: "Osprera_GestionBaja",
					...(formularioSelected?.deletedDate || !formularioSelected?.id
						? { disabled: true }
						: {
								disabled: false,
								keys: "b",
								underlineindex: 0,
						  }),
				})
			);
		}
		setFormularioOspreraActions(actions); //cargo todas las acciones / botones
	}, [formularioOspreraRequest, formularioSelected]);

	tabs.push({
		header: () => <Tab label="Solicitudes de Afiliación por Empresa" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<Grid grow>
						<InputMaterial
							label="Filtro por Estado"
							value={paramsEdit.filtro}
							onChange={(filtro) =>
								setParamsEdit((o) => {
									const paramsEdit = { ...o, filtro };
									if (!filtro) delete paramsEdit.filtro;
									return paramsEdit;
								})
							}
						/>
					</Grid>
					<Grid width="200px">
						<Button
							className="botonAzul"
							disabled={
								JSON.stringify(paramsEdit) === JSON.stringify(paramsSend)
							}
							onClick={() => setParamsSend(paramsEdit)}
						>
							Aplica filtro
						</Button>
					</Grid>
					<Grid width="200px">
						<Button
							className="botonAzul"
							disabled={Object.entries(paramsEdit).length === 0}
							onClick={() => {
								const paramsEdit = {};
								setParamsEdit(paramsEdit);
								if (JSON.stringify(paramsEdit) === JSON.stringify(paramsSend))
									return;
								setParamsSend({ ...paramsEdit });
							}}
						>
							Limpia filtro
						</Button>
					</Grid>
				</Grid>
				{formulariosOspreraRender()}
			</Grid>
		),
		actions: formularioOspreraActions,
	});

	//Carga de lista según parametros
	useEffect(() => {
		formularioOspreraRequest("list", {
			params: paramsSend,
			pagination: { index: 1, size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		});
	}, [formularioOspreraRequest, paramsSend]);
	//#endregion


	//#region Tab DETALLE
	const [detalleTab, detalleChanger, detalleSelected] = useAfiliacionesPorEmpresaDetalle();
	const [detalleActions, setDetalleActions] = useState([]);
	
	tabs.push({
		header: () => <Tab label="Detalle de Solicitud de Afiliación" disabled={!formularioSelected || formularioSelected.deletedDate} />,
		body: detalleTab,
		actions: detalleActions,
	});

	// Si cambia delegación, refresco lista de documentación
	useEffect(() => {
		detalleChanger("list", {
			clear: !formularioSelected?.id,
			params: { solicitudAfiliacionEmpresaId: formularioSelected?.id, soloactivos: true },
		});
	}, [formularioSelected?.id, detalleChanger]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "AfiliacionesPorEmpresa", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Gestión Obra Social</h1>
			</Grid>

			<div className="tabs">
				<text>
					{formularioSelected?.nombre
						? `(${Formato.Cuit(formularioSelected?.cuil)}  |  ${formularioSelected?.nombre})`
						: " "}
				</text>

				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</div>
			<div className="contenido">	
				{tabs[tab].body()}
			</div>
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default AfiliacionesPorEmpresaHandler;
