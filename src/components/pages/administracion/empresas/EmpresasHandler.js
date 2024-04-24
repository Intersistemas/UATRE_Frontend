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
import useEmpresas, { onLoadSelectKeepOrFirst } from "./useEmpresas";
import Button from "components/ui/Button/Button";

const EmpresasHandler = () => {
	const dispatch = useDispatch();

	const Usuario = useContext(AuthContext).usuario;

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Empresas Params
	const [paramsEdit, setParamsEdit] = useState({});
	const [paramsSend, setParamsSend] = useState({});
	//#endregion

	//#region Tab Empresas
	const {
		render: empresasRender,
		request: empresasRequest,
		selected: empresaSelected,
	} = useEmpresas({
		params: { orderBy: "razonSocial" },
		onLoadSelect: onLoadSelectKeepOrFirst,
	});
	const [empresasActions, setEmpresasActions] = useState([]);

	useEffect(() => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => empresasRequest("selected", params),
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
		const desc =
			Formato.Cuit(empresaSelected?.cuit) || empresaSelected?.razonSocial;

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
	}, [empresasRequest, empresaSelected]);

	tabs.push({
		header: () => <Tab label="Empresas" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<Grid grow>
						<InputMaterial
							label="Filtro por CUIT / Razón social"
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
				{empresasRender()}
			</Grid>
		),
		actions: empresasActions,
	});

	//Carga de lista según parametros
	useEffect(() => {
		empresasRequest("list", {
			params: paramsSend,
			pagination: { size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		});
	}, [empresasRequest, paramsSend]);
	//#endregion

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
				<text>
					{empresaSelected?.razonSocial
						? ` ${empresaSelected?.cuit} - ${empresaSelected.razonSocial ?? ""}`
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

export default EmpresasHandler;
