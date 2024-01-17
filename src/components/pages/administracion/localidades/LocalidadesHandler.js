import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tab } from "@mui/material";
import { Tabs } from "@mui/material";
import Action from "components/helpers/Action";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import useLocalidades, { onLoadSelectKeepOrFirst } from "./useLocalidades";
import Formato from "components/helpers/Formato";

const LocalidadesHandler = () => {
	const dispatch = useDispatch();

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region contenido Localidades
	const [localidadesParams, setLocalidadesParams] = useState({ select: null });
	const {
		render: localidadesRender,
		request: localidadesRequest,
		selected: localidadesSelected,
	} = useLocalidades({
		onEditComplete: ({ edit, response, request }) => {
			const params = { ...localidadesParams };
			if (request === "A") {
				edit.id = response;
				params.select = edit;
			} else {
				params.select = null;
			}
			setLocalidadesParams(params);
		},
	});
	const [localidadesActions, setLocalidadesActions] = useState([]);
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					localidadesRequest("selected", {
						request,
						action,
						record: {},
					}),
				combination: "AltKey",
				...x,
			});
		const actions = [
			// createAction({
			// 	action: `Agrega Localidad`,
			// 	request: "A",
			// 	tarea: "Localidad_Agrega",
			// 	keys: "a",
			// 	underlineindex: 0,
			// }),
		];
		const desc = ((v) => (v != null ? `C.P. ${Formato.Numero(v)}` : null))(
			localidadesSelected?.codPostal
		);
		if (!desc) {
			setLocalidadesActions(actions);
			return;
		}
		actions.push(
			createAction({
				action: `Consulta Localidad ${desc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		// actions.push(
		// 	createAction({
		// 		action: `Modifica Localidad ${desc}`,
		// 		request: "M",
		// 		disabled: !!localidadesSelected.deletedDate,
		// 		tarea: "Localidad_Modifica",
		// 		keys: "m",
		// 		underlineindex: 0,
		// 	})
		// );
		// if (localidadesSelected.deletedDate) {
		// 	actions.push(
		// 		createAction({
		// 			action: `Reactiva Localidad ${desc}`,
		// 			request: "R",
		// 			tarea: "Localidad_Reactiva",
		// 			keys: "r",
		// 			underlineindex: 0,
		// 		})
		// 	);
		// } else {
		// 	actions.push(
		// 		createAction({
		// 			action: `Baja Localidad ${desc}`,
		// 			request: "B",
		// 			tarea: "Localidad_Baja",
		// 			keys: "b",
		// 			underlineindex: 0,
		// 		})
		// 	);
		// }
		
		setLocalidadesActions(actions);
	}, [localidadesRequest, localidadesSelected]);
	useEffect(() => {
		const { select, ...params } = localidadesParams;
		const payload = {
			params,
			pagination: { size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		};
		if (select) {
			payload.onLoadSelect = () => {
				setLocalidadesParams((o) => ({ ...o, select: null }));
				return select;
			};
		}
		localidadesRequest("list", payload);
	}, [localidadesRequest, localidadesParams]);
	tabs.push({
		header: () => <Tab label="Localidades" disabled={!localidadesSelected} />,
		body: localidadesRender,
		actions: localidadesActions,
	});
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Localidades", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Localidades</h1>
			</Grid>
			<Grid col className="tabs">
				<text>{localidadesSelected?.nombre ?? <>&nbsp;</>}</text>
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</Grid>
			{tabs[tab].body()}
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default LocalidadesHandler;
