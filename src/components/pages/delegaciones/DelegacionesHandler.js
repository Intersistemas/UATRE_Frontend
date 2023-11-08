import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/documentacion/useDocumentaciones";
import useDelegaciones from "./useDelegaciones";
import useColaboradores from "components/colaboradores/useColaboradores";

const DelegacionesHandler = () => {
	const dispatch = useDispatch();

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region Tab delegaciones
	const [delegacionesTab, delegacionChanger, delegacionSelected] =
		useDelegaciones();
	const [delegacionesActions, setDelegacionesActions] = useState([]);
	useEffect(() => {
		const createAction = ({ action, request }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					delegacionChanger("selected", { request, action }),
			});
		const actions = [
			createAction({ action: `Agrega Delegación`, request: "A" }),
		];
		const desc = delegacionSelected?.id;
		if (!desc) {
			setDelegacionesActions(actions);
			return;
		}
		actions.push(
			createAction({ action: `Consulta Delegación ${desc}`, request: "C" })
		);
		actions.push(
			createAction({ action: `Modifica Delegación ${desc}`, request: "M" })
		);
		actions.push(
			createAction({ action: `Baja Delegación ${desc}`, request: "B" })
		);
		setDelegacionesActions(actions);
	}, [delegacionChanger, delegacionSelected]);
	tabs.push({
		header: () => <Tab label="Delegaciones" />,
		body: delegacionesTab,
		actions: delegacionesActions,
	});

	useEffect(() => {
		delegacionChanger("list");
	}, [delegacionChanger]);
	//#endregion

	//#region Tab documentaciones
	const [documentacionesTab, documentacionChanger, documentacionSelected] =
		useDocumentaciones();
	const [documentacionesActions, setDocumentacionesActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const dele = delegacionSelected?.id;
		if (!dele) {
			setDocumentacionesActions(actions);
			return;
		}
		const deleDesc = `para Delegación ${dele}`;
		const createAction = ({ action, request }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					documentacionChanger("selected", {
						request,
						action,
						record: { entidadTipo: "D", entidadId: delegacionSelected?.id },
					}),
			});
		actions.push(
			createAction({ action: `Agrega Documentación ${deleDesc}`, request: "A" })
		);
		const docu = documentacionSelected?.id;
		if (!docu) {
			setDocumentacionesActions(actions);
			return;
		}
		const docuDesc = `${docu} ${deleDesc}`;
		actions.push(
			createAction({
				action: `Consulta Documentación ${docuDesc}`,
				request: "C",
			})
		);
		actions.push(
			createAction({
				action: `Modifica Documentación ${docuDesc}`,
				request: "M",
			})
		);
		actions.push(
			createAction({ action: `Baja Documentación ${docuDesc}`, request: "B" })
		);
		setDocumentacionesActions(actions);
	}, [documentacionChanger, documentacionSelected, delegacionSelected?.id]);
	tabs.push({
		header: () => <Tab label="Documentacion" disabled={!delegacionSelected} />,
		body: documentacionesTab,
		actions: documentacionesActions,
	});

	// Si cambia delegación, refresco lista de documentación
	useEffect(() => {
		documentacionChanger("list", {
			clear: !delegacionSelected?.id,
			params: { entidadTipo: "D", entidadId: delegacionSelected?.id },
		});
	}, [delegacionSelected?.id, documentacionChanger]);
	//#endregion

	//#region Tab colaboradores
	const [colaboradoresTab, colaboradoresChanger, colaboradorSelected] =
		useColaboradores();
	const [colaboradoresActions, setColaboradoresActions] = useState([]);
	useEffect(() => {
		const actions = [];
		const dele = delegacionSelected?.id;
		if (!dele) {
			setColaboradoresActions(actions);
			return;
		}
		const deleDesc = `para Delegación ${dele}`;
		const createAction = ({ action, request }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					colaboradoresChanger("selected", {
						request,
						action,
						record: { refDelegacionId: delegacionSelected?.id },
					}),
			});
		actions.push(
			createAction({ action: `Agrega Colaborador ${deleDesc}`, request: "A" })
		);
		const sele = colaboradorSelected?.id;
		if (!sele) {
			setColaboradoresActions(actions);
			return;
		}
		const seleDesc = `${sele} ${deleDesc}`;
		actions.push(
			createAction({ action: `Consulta Colaborador ${seleDesc}`, request: "C" })
		);
		actions.push(
			createAction({ action: `Modifica Colaborador ${seleDesc}`, request: "M" })
		);
		if (colaboradorSelected?.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Colaborador ${seleDesc}`,
					request: "R",
				})
			);
		} else {
			actions.push(
				createAction({ action: `Baja Colaborador ${seleDesc}`, request: "B" })
			);
		}
		setColaboradoresActions(actions);
	}, [colaboradoresChanger, colaboradorSelected, delegacionSelected?.id]);
	tabs.push({
		header: () => <Tab label="Colaboradores" disabled={!delegacionSelected} />,
		body: colaboradoresTab,
		actions: colaboradoresActions,
	});

	// Si cambia delegación, refresco lista de colaboradores
	useEffect(() => {
		colaboradoresChanger("list", {
			clear: !delegacionSelected?.id,
			params: { refDelegacionId: delegacionSelected?.id },
		});
	}, [delegacionSelected?.id, colaboradoresChanger]);
	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Delegaciones", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid>
				<h1 className="titulo">Delegaciones</h1>
			</Grid>
			<Grid width="full">
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</Grid>
			{tabs[tab].body()}
		</Grid>
	);
};

export default DelegacionesHandler;
