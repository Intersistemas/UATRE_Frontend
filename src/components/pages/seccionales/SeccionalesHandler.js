import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import useAutoridades from "components/pages/seccionales/autoridades/useAutoridades";
import KeyPress from "components/keyPress/KeyPress";
import useSeccionales from "./useSeccionales";

const SeccionalesHandler = () => {
	const dispatch = useDispatch();

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Tab Seccionales
	const [seccionalesTab, seccionalChanger, seccionalSelected] = useSeccionales();
	const [seccionalesActions, setSeccionalesActions] = useState([]);
	
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					seccionalChanger("selected", { request, action }),
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
		/*if (!desc) {
			setSeccionalesActions(actions);
			return;
		}*/
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
	}, [seccionalChanger, seccionalSelected]);

	tabs.push({
		header: () => <Tab label="Seccionales" />,
		body: seccionalesTab,
		actions: seccionalesActions,
	});

	useEffect(() => {
		seccionalChanger("list");
	}, [seccionalChanger]);
	//#endregion


	//#region Tab Autoridades
	const [autoridadesTab, autoridadesChanger, autoridadSelected] = useAutoridades();
	const [autoridadesActions, setAutoridadesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const secc = seccionalSelected?.id;
		if (!secc) {
			setAutoridadesActions(actions);
			return;
		}
		const seccDesc = `para Seccional ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					autoridadesChanger("selected", {
						request,
						action,
						record: { seccionalId: seccionalSelected?.id },
					}),
				combination: "AltKey",
				...x,
			});
		actions.push(
			createAction({
				action: `Agrega Autoridad ${seccDesc}`,
				request: "A",
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
					keys: "r",
					underlineindex: 0,
			})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Autoridad ${seleDesc}`,
					request: "B",
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
	}, [autoridadesChanger, autoridadSelected, seccionalSelected?.id]);
	tabs.push({
		header: () => <Tab label="Autoridades" disabled={!seccionalSelected} />,
		body: autoridadesTab,
		actions: autoridadesActions,
	});

	// Si cambia Seccional, refresco lista de autoridades
	useEffect(() => {
		autoridadesChanger("list", {
			clear: !seccionalSelected?.id,
			params: { seccionalId: seccionalSelected?.id /*aca debo ir el check de SOloActivos */},
		});
	}, [seccionalSelected?.id, autoridadesChanger]);
	//#endregion

	//#region Tab documentaciones
	const [documentacionesTab, documentacionChanger, documentacionSelected] =
		useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);

	useEffect(() => {
		const actions = [];
		const secc = seccionalSelected?.id;
		if (!secc) {
			setDocumentacionesActions(actions);
			return;
		}
		const seccDesc = `para Seccional ${secc}`;
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "S", entidadId: seccionalSelected?.id, soloactivos: false },
					}),
				combination: "AltKey",
				...x,
			});

		actions.push(
			createAction({
				action: `Agrega Documentación ${seccDesc}`,
				request: "A",
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
				keys: "m",
				underlineindex: 0,
			})
		);
		actions.push(
			createAction({
				action: `Baja Documentación ${docuDesc}`,
				request: "B",
				keys: "b",
				underlineindex: 0,
			})
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, seccionalSelected?.id]);


	tabs.push({
		header: () => <Tab label="Documentacion" disabled={!seccionalSelected} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia Seccional, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !seccionalSelected?.id,
			params: { entidadTipo: "S", entidadId: seccionalSelected?.id, soloactivos: false },
		});
	}, [seccionalSelected?.id, documentacionChanger]);
	//#endregion



	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Seccionales", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid>
				<h1 className="titulo">Seccionales</h1>
			</Grid>
			<Grid width="full">
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</Grid>
			{tabs[tab].body()}
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default SeccionalesHandler;
