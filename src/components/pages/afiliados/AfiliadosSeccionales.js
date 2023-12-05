import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import useAutoridades from "components/pages/seccionales/autoridades/useAutoridades";
import KeyPress from "components/keyPress/KeyPress";
import useSeccionales from "../seccionales/useSeccionales";

const AfiliadosSeccionales = (props) => {
    const dispatch = useDispatch();

	const tabs = [];
	const [tab, setTab] = useState(0);

	console.log('props.afiliado:',props.afiliado);
	//#region Tab Seccionales
	const [seccionalesTab, seccionalChanger, seccionalSelected] = useSeccionales();
	const [seccionalesActions, setSeccionalesActions] = useState([]);
	

	useEffect(() => {
	
		
		props.onSeleccionRegistro(seccionalSelected);
	},[ seccionalSelected])
	

	/* EN AFILIADOS NO PRECISO LOS BOTONES
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>

			new Action({
				name: action,
				onExecute: (action) =>
					seccionalChanger("selected", {
						 request, action,record: {}}),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega Seccional`,
				request: "A",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = seccionalSelected?.codigo ?? seccionalSelected?.descripcion;
		if (!desc) {
			setSeccionalesActions(actions);
			return;
		}
		actions.push(
			createAction({
				action: `Consulta Seccional ${desc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Seccional ${desc}`,
				request: "M",

				...(seccionalSelected?.deletedDate ? 
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
		actions.push(
			createAction({
				action: `Baja Seccional ${desc}`,
				request: "B",

				...(seccionalSelected?.deletedDate ? 
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
		setSeccionalesActions(actions); //cargo todas las acciones / botones
	}, [seccionalChanger, seccionalSelected]);*/

	tabs.push({
		header: () => <Tab label="Seccionales" />,
		body: seccionalesTab,
		actions: seccionalesActions,
	});

	useEffect(() => {

		seccionalChanger("GetById", { params: {id: props.afiliado.seccionalId}});
	}, [seccionalChanger,props.afiliado]);
	//#endregion


	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Seccionales", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			{tabs[tab].body()}
			<KeyPress items={acciones} />
		</Grid>
	);
};
export default AfiliadosSeccionales