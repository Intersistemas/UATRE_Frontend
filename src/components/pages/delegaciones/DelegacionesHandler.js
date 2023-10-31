import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import useDelegaciones from "./useDelegaciones";
import useDocumentaciones from "components/documentacion/useDocumentaciones";

const DelegacionesHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const [tab, setTab] = useState(0);
	const [delegacionesTab, delegacionChanger, delegacionSelected] = useDelegaciones();
	const [documentacionesTab, documentacionChanger, documentacionSelected] = useDocumentaciones();

	//#region actualizar por cambio de seleccion de delegacion
	useEffect(() => {
		documentacionChanger({
			type: "list",
			params: { entidadTipo: "D", entidadId: delegacionSelected?.id },
		});
	}, [delegacionSelected?.id, documentacionChanger]);
	//#endregion

	//#region sidebar
	const sidebar = {
		delegacionChanger: delegacionChanger,
		documentacionChanger: documentacionChanger,
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
				setRedirect({ to: "Administracion" });
				break;
			case "Agrega Delegación":
				sidebar.delegacionChanger({
					type: "selected",
					request: "A",
					action: sidebar.moduloAccion,
				});
				break;
			case `Consulta Delegación ${sidebar.delegacionDesc}`:
				sidebar.delegacionChanger({
					type: "selected",
					request: "C",
					action: sidebar.moduloAccion,
				});
				break;
			case `Modifica Delegación ${sidebar.delegacionDesc}`:
				sidebar.delegacionChanger({
					type: "selected",
					request: "M",
					action: sidebar.moduloAccion,
				});
				break;
			case `Baja Delegación ${sidebar.delegacionDesc}`:
				sidebar.delegacionChanger({
					type: "selected",
					request: "B",
					action: sidebar.moduloAccion,
				});
				break;
				
			case "Agrega Documentación":
				sidebar.documentacionChanger({
					type: "selected",
					request: "A",
					action: sidebar.moduloAccion,
				});
				break;
			case `Consulta Documentación ${sidebar.documentacionDesc}`:
				sidebar.documentacionChanger({
					type: "selected",
					request: "C",
					action: sidebar.moduloAccion,
				});
				break;
			case `Modifica Documentación ${sidebar.documentacionDesc}`:
				sidebar.documentacionChanger({
					type: "selected",
					request: "M",
					action: sidebar.moduloAccion,
				});
				break;
			case `Baja Documentación ${sidebar.documentacionDesc}`:
				sidebar.documentacionChanger({
					type: "selected",
					request: "B",
					action: sidebar.moduloAccion,
				});
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
					default:
						return delegacionesTab();
					case 1:
						return documentacionesTab();
				}
			})()}
		</Grid>
	);
};

export default DelegacionesHandler;
