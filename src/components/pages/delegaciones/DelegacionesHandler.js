import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import useDelegacionesTab from "./useDelegacionesTab";

const DelegacionesHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [tab, setTab] = useState(0);
	const [delegacionesTab, delegacionHandler, delegacionSelected] = useDelegacionesTab();
	const documentacionSelected = {};	///ToDo cambiar por el use

	//#region sidebar
	const sidebar = {
		delegacionHandler: delegacionHandler,
		dispatch: dispatch,
	};

	const [redirect, setRedirect] = useState({ to: "", options: null }); //De esta forma puedo limpiar moduloInfo antes de cambiar de página
	const moduloInfo = {};
	if (redirect.to) {
		navigate(redirect.to, redirect.options);
	} else {
		moduloInfo.nombre = "Delegaciones";
		moduloInfo.acciones = [{ name: "Administración de datos" }];
	}

	sidebar.delegacionDesc = (() => {
		if (!moduloInfo.acciones || tab !== 0) return "";
		moduloInfo.acciones.push({ name: `Agrega Delegación` });
		const desc = delegacionSelected?.id;
		if (!desc) return "";
		moduloInfo.acciones.push({ name: `Consulta Delegación ${desc}` });
		moduloInfo.acciones.push({ name: `Modifica Delegación ${desc}` });
		moduloInfo.acciones.push({ name: `Baja Delegación ${desc}` });
		return desc;
	})();

	sidebar.documentacionDesc = (() => {
		if (!moduloInfo.acciones || tab !== 1) return "";
		moduloInfo.acciones.push({ name: `Agrega Documentación` });
		const desc = documentacionSelected?.id;
		if (!desc) return "";
		moduloInfo.acciones.push({ name: `Consulta Documentación ${desc}` });
		moduloInfo.acciones.push({ name: `Modifica Documentación ${desc}` });
		moduloInfo.acciones.push({ name: `Baja Documentación ${desc}` });
		return desc;
	})();
	
	dispatch(handleModuloSeleccionar(moduloInfo));
	sidebar.moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		switch (sidebar.moduloAccion) {
			case "Administración de datos":
				setRedirect({ to: "/administracion" });
				break;
			case "Agrega Delegación":
				sidebar.delegacionHandler("A", sidebar.moduloAccion);
				break;
			case `Consulta Delegación ${sidebar.delegacionDesc}`:
				sidebar.delegacionHandler("C", sidebar.moduloAccion);
				break;
			case `Modifica Delegación ${sidebar.delegacionDesc}`:
				sidebar.delegacionHandler("M", sidebar.moduloAccion);
				break;
			case `Baja Delegación ${sidebar.delegacionDesc}`:
				sidebar.delegacionHandler("B", sidebar.moduloAccion);
				break;
			default:
				break;
		}
		sidebar.dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [sidebar]);
	//#endregion

	return (
		<Grid full col>
			<Grid>
				<h1 className="titulo">Delegaciones</h1>
			</Grid>
			<Grid width="full">
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					<Tab label="Delegaciones" />
					<Tab label="Documentacion" disabled={!delegacionSelected} />
				</Tabs>
			</Grid>
			{(() => {
				switch (tab) {
					case 0:
						return delegacionesTab();
					default:
						return null;
				}
			})()}
		</Grid>
	);
};

export default DelegacionesHandler;
