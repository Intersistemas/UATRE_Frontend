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
import useAfiliadoFormulariosAfiliacion, { onLoadSelectKeepOrFirst } from "./useAfiliadoFormulariosAfiliacion";
import Button from "components/ui/Button/Button";

const AfiliadoFormulariosAfiliacionHandler = () => {
	const dispatch = useDispatch();



	const Usuario = useContext(AuthContext).usuario;

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Formulario Params
	const [paramsEdit, setParamsEdit] = useState({});
	const [paramsSend, setParamsSend] = useState({});
	//#endregion

	const [afiliadoAgregarShow, setAfiliadoAgregarShow] = useState(false);
	
	//#region Tab Formulario
	const {
		render: formularioRender,
		request: formularioRequest,
		selected: formularioSelected,
	} = useAfiliadoFormulariosAfiliacion({
		params: {},
		onLoadSelect: onLoadSelectKeepOrFirst,
	});
	const [formularioActions, setFormularioActions] = useState([]);

	useEffect(() => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => formularioRequest("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Agrega Solicitud`,
				request: "A",
				//tarea: "Datos_EmpresaAgrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc =
			Formato.Cuit(formularioSelected?.cuil) || formularioSelected?.nombre;

		actions.push(
			createAction({
				action: `Consulta Solicitud ${desc}`,
				request: "C",
				//tarea: "Datos_EmpresaConsulta",
				record: {},
				...(formularioSelected?.id
					? { disabled: true }
					: {
							disabled: false,
							keys: "o",
							underlineindex: 1,
					  }),
			})
		);

		if (!formularioSelected?.deletedDate && !formularioSelected?.afiliadoIdAsignado) {
			actions.push(
				createAction({
					action: `Modifica Solicitud ${desc}`,
					request: "M",
					record: {},
					//tarea: "Datos_EmpresaModifica",
					...(formularioSelected?.deletedDate || !formularioSelected?.id
						? { disabled: true }
						: {
								disabled: false,
								keys: "m",
								underlineindex: 0,
						}),
				})
			);
			actions.push(
				createAction({
					action: `Acepta Solicitud ${desc}`,
					request: "S",
					record: {},
					//tarea: "Datos_EmpresaReactiva",
					keys: "s",
					underlineindex: 0,
				})
			);
			actions.push(
				createAction({
					action: `Rechaza Solicitud ${desc}`,
					request: "B",
					record: {
						...formularioSelected,
						deletedDate: dayjs().format("YYYY-MM-DD"),
						deletedBy: Usuario.nombre,
					},
					//tarea: "Datos_EmpresaBaja",
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
		setFormularioActions(actions); //cargo todas las acciones / botones
	}, [formularioRequest, formularioSelected]);

	tabs.push({
		header: () => <Tab label="Formularios Afiliación" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<Grid grow>
						<InputMaterial
							label="Filtro por CUIL"
							value={paramsEdit.cuil}
							onChange={(cuil) =>
								setParamsEdit((o) => {
									const paramsEdit = { ...o, cuil };
									if (!cuil) delete paramsEdit.cuil;
									return paramsEdit;
								})
							}
						/>
					</Grid>
					<Grid grow>
						<InputMaterial
							label="Filtro por CUIT"
							value={paramsEdit.cuit}
							onChange={(cuit) =>
								setParamsEdit((o) => {
									const paramsEdit = { ...o, cuit };
									if (!cuit) delete paramsEdit.cuit;
									return paramsEdit;
								})
							}
						/>
					</Grid>
					<Grid grow>
						<InputMaterial
							label="Filtro por DNI"
							value={paramsEdit.documento}
							onChange={(documento) =>
								setParamsEdit((o) => {
									const paramsEdit = { ...o, documento };
									if (!documento) delete paramsEdit.documento;
									return paramsEdit;
								})
							}
						/>
					</Grid>
					<Grid grow>
						<InputMaterial
							label="Filtro por Nombre"
							value={paramsEdit.nombre}
							onChange={(nombre) =>
								setParamsEdit((o) => {
									const paramsEdit = { ...o, nombre };
									if (!nombre) delete paramsEdit.nombre;
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
				{formularioRender()}
			</Grid>
		),
		actions: formularioActions,
	});

	//Carga de lista según parametros
	useEffect(() => {
		formularioRequest("list", {
			params: paramsSend,
			pagination: { size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		});
	}, [formularioRequest, paramsSend]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Formulario Afiliación", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Solicitudes de Afiliación</h1>
			</Grid>

			<div className="tabs">
				<text>
					{formularioSelected?.razonSocial
						? ` ${formularioSelected?.cuil} - ${formularioSelected.apellido ?? ""} ${formularioSelected.nombre ?? ""} `
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

export default AfiliadoFormulariosAfiliacionHandler;
