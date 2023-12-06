import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import KeyPress from "components/keyPress/KeyPress";
import useSeccionales from "../administracion/seccionales/useSeccionales";

const AfiliadosDocumentaciones = (props) => {
    const dispatch = useDispatch();

	const tabs = [];
	const [tab, setTab] = useState(0);

	console.log('props.afiliado:',props.afiliado);
	
	//#region Tab documentaciones
	const [documentacionesTab, documentacionChanger, documentacionSelected] =
		useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);

	useEffect(() => {
		const actions = [];
		const secc = props.afiliado?.id;
		if (!secc) {
			setDocumentacionesActions(actions);
			return;
		}
		const seccDesc = "";//`para Afiliado ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "A", entidadId: props.afiliado?.id, soloactivos: false },
					}),
				combination: "AltKey",
				...x,
			});

		actions.push(
			createAction({
				action: `Agrega Documentación ${seccDesc}`,
				request: "A",
				tarea: "Documentacion_Agrega",
				keys: "a",
				underlineindex: 0,
			})
		);
		const docu = documentacionSelected?.id;
		if (!docu) {
			setDocumentacionesActions(actions);
			return;
		}
		const docuDesc = "";//`${docu} ${seccDesc}`;
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
				tarea: "Documentacion_Modifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		actions.push(
			createAction({
				action: `Baja Documentación ${docuDesc}`,
				request: "B",
				tarea: "Documentacion_Baja",
				keys: "b",
				underlineindex: 0,
			})
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, props.afiliado?.id]);


	tabs.push({
		header: () => <Tab label="Documentacion" disabled={!props.afiliado} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia Seccional, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !props.afiliado?.id,
			params: { entidadTipo: "A", entidadId: props.afiliado.id, soloactivos: false },
		});
	}, [props.afiliado, documentacionChanger]);
	//#endregion
	//#endregion


	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Documentación", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			{tabs[tab].body()}
			<KeyPress items={acciones} />
		</Grid>
	);
};
export default AfiliadosDocumentaciones