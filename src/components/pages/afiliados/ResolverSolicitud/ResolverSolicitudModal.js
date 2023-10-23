import React, { useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import ResolverSolicitud from "./ResolverSolicitud";

const ResolverSolicitudModal = ({
	afiliado,
	onClose = (confirm = false) => {},
}) => {
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "AFIPConsulta": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/AFIPConsulta`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});

	//#region declaracion y carga datos padron
	const [padron, setPadron] = useState({
		loading: "Cargando...",
		data: {},
		error: {},
		params: { cuit: afiliado.cuilValidado, verificarHistorico: false },
	});
	useEffect(() => {
		if (!padron.loading) return;
		pushQuery({
			action: "AFIPConsulta",
			params: padron.params,
			onOk: async (res) =>
				setPadron((old) => ({
					...old,
					loading: null,
					data: res,
					error: null,
				})),
			onError: async (err) =>
				setPadron((old) => ({
					...old,
					loading: null,
					data: null,
					error: err,
				})),
		});
	}, [pushQuery, padron]);
	//#endregion

	let contenido;
	if (padron.loading) {
		contenido = <Grid>Cargando datos padron...</Grid>;
	} else if (padron.error) {
		contenido = <Grid>Error cargando padron...</Grid>;
	} else {
		// contenido = (
		// 	<ResolverSolicitud
		// 		padronRespuesta={padron}
		// 		cuilState={afiliado.cuilValidado}
		// 		nombreState={nombreState}
		// 		cuitEmpresa={cuitEmpresa}
		// 		resolverSolicitudFechaIngreso={resolverSolicitudFechaIngreso}
		// 		resolverSolicitudObs={resolverSolicitudObs}
		// 		estadoSolicitud={estadoSolicitudResolver}
		// 		estadosSolicitudes={estadosSolicitudes}
		// 		showImprimirLiquidacion={showImprimirLiquidacion}
		// 		onHandleChangeSelect={handleChangeSelect}
		// 		onHandleInputChange={handleInputChange}
		// 		onResolverSolicitudHandler={resolverSolicitudHandler}
		// 	/>
		// 	);
	}

	return <Modal onClose={onClose(false)}>{contenido}</Modal>;
};

export default ResolverSolicitudModal;
