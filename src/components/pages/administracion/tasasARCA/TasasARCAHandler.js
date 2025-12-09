import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import dayjs from "dayjs";
import { Tabs, Tab } from "@mui/material";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import Button from "components/ui/Button/Button";
import { onLoadSelectKeepOrFirst } from "components/ui/Table/TableHook";
import useTasasARCA from "./useTasasARCA";

export default function Handler () {
	const dispatch = useDispatch();

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Tasas ARCA Params
	const [paramsEdit, setParamsEdit] = useState({});
	const [paramsSend, setParamsSend] = useState({});
	//#endregion

	//#region Tab Tasas ARCA
	const {
		render: tasasRender,
		request: tasasRequest,
		selected: tasaSelected,
	} = useTasasARCA({
		params: { sort: "-id" },
		onLoadSelect: onLoadSelectKeepOrFirst,
	});
	const [tasasActions, setTasasActions] = useState([]);

	useEffect(() => {
		const createAction = ({ action, request, record, ...x }) => {
			const params = { action, request };
			if (record) params.record = record;
			return new Action({
				name: action,
				onExecute: () => tasasRequest("selected", params),
				combination: "AltKey",
				...x,
			});
		};
		const actions = [
			createAction({
				action: `Agrega Tasa ARCA`,
				request: "A",
				tarea: "Datos_TasaARCAAgrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = tasaSelected?.norma;

		actions.push(
			createAction({
				action: `Consulta Tasa ARCA ${desc}`,
				request: "C",
				tarea: "Datos_TasaARCAConsulta",
				record: {},
				...(!tasaSelected?.id
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
				action: `Modifica Tasa ARCA ${desc}`,
				request: "M",
				record: {},
				tarea: "Datos_TasaARCAModifica",
				...(tasaSelected?.deletedDate || !tasaSelected?.id
					? { disabled: true }
					: {
							disabled: false,
							keys: "m",
							underlineindex: 0,
					  }),
			})
		);

		if (tasaSelected?.deletedDate) {
			// actions.push(
			// 	createAction({
			// 		action: `Reactiva Tasa ARCA ${desc}`,
			// 		request: "R",
			// 		record: {},
			// 		tarea: "Datos_TasaARCAReactiva",
			// 		keys: "r",
			// 		underlineindex: 0,
			// 	})
			// );
		} else {
			actions.push(
				createAction({
					action: `Baja Tasa ARCA ${desc}`,
					request: "B",
					record: {
						...tasaSelected,
						deletedDate: dayjs().format("YYYY-MM-DD"),
					},
					tarea: "Datos_TasaARCABaja",
					...(tasaSelected?.deletedDate || !tasaSelected?.id
						? { disabled: true }
						: {
								disabled: false,
								keys: "b",
								underlineindex: 0,
						  }),
				})
			);
		}
		setTasasActions(actions); //cargo todas las acciones / botones
	}, [tasasRequest, tasaSelected]);

	tabs.push({
		header: () => <Tab label="Tasas" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<Grid grow>
						{/* <InputMaterial
							label="Filtro por CUIT / Razón social"
							value={paramsEdit.filtro}
							onChange={(filtro) =>
								setParamsEdit((o) => {
									const paramsEdit = { ...o, filtro };
									if (!filtro) delete paramsEdit.filtro;
									return paramsEdit;
								})
							}
						/> */}
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
				{tasasRender()}
			</Grid>
		),
		actions: tasasActions,
	});

	//Carga de lista según parametros
	useEffect(() => {
		tasasRequest("list", {
			params: paramsSend,
			pagination: { index: 1, size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		});
	}, [tasasRequest, paramsSend]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Tasas ARCA", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Tasas ARCA</h1>
			</Grid>

			<div className="tabs">
				<text>
					{tasaSelected?.razonSocial
						? ` ${tasaSelected?.cuit} - ${tasaSelected.razonSocial ?? ""}`
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
