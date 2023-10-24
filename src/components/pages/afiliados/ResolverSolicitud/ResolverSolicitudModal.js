import React, { useEffect, useState } from "react";
import useQueryQueue from "components/hooks/useQueryQueue";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import Formato from "components/helpers/Formato";
import DeclaracionesJuradas from "../declaracionesJuradas/DeclaracionesJuradas";
import InputMaterial from "components/ui/Input/InputMaterial";

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
			case "UpdateAfiliado": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado`,
						method: "PATCH",
					}
				}
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
		params: { cuit: afiliado.cuilValidado || afiliado.cuil, verificarHistorico: false },
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
		contenido = (
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
				null
			);
	}

	return (
			<Modal onClose={onClose}>
				<Grid col width="full" justify="center">
					<h4>{`DDJJ UATRE ${Formato.Cuit(afiliado.cuil)} ${afiliado.nombre}`}</h4>
					<DeclaracionesJuradas
							cuil={afiliado.cuil}
							infoCompleta={true}
							mostrarBuscar={false}
							registros={1}
						/>
				</Grid>
				<Grid col width="full" justify="center">
					<h4>Actividades del Empleador</h4>
					{/* <InputMaterial
						id="CIIU1"
						value={
							props.padronEmpresaRespuesta &&
							props.padronEmpresaRespuesta.ciiU1
								? `${props.padronEmpresaRespuesta.ciiU1} - ${props.padronEmpresaRespuesta.ciiU1Descripcion}`
								: ""
						}
						label="Actividad Principal"
						disabled={true}
						showToolTip={true}
					/> */}
				</Grid>
				{contenido}
			</Modal>
		);
};

export default ResolverSolicitudModal;
