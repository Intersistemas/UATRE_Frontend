import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { PDFViewer } from "@react-pdf/renderer";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import LotePDF from "./LotePDF";
import useQueryState from "components/hooks/useQueryState";
// import useAuditoriaProceso from "components/hooks/useAuditoriaProceso";
// import { pick } from "components/helpers/Utils";

/**
 * @typedef {import('components/pages/administracion/delegaciones/Carnet/LotePDF').Delegacion} Delegacion
 * @typedef {import('components/pages/administracion/delegaciones/Carnet/LotePDF').AfiliadoDelegado} AfiliadoDelegado
 * @typedef {import("components/hooks/useQueryState").onLoad} onLoad
 */

const onCloseDef = () => {};

/**
 * @param {object} props
 * @param {Delegacion} props.delegacion Datos de la delegacion.
 * @param {AfiliadoDelegado[]} props.delegados Datos de delegados de delegacion a imprimirles credenciales.
 * @param {onCloseDef} props.onClose Handler al cerrar el modal
 */
const LotePDFViewer = ({ delegacion, delegados: delegadosParam, onClose = onCloseDef }) => {
	// const { audit } = useAuditoriaProceso();
	// audit({
	// 	proceso: "AfiliadoCarnet",
	// 	parametros: data.map((r) =>
	// 		pick(r, ["id", "cuil", "nroAfiliado", "nombre"])
	// 	),
	// });

	const { setState: setAfiliadoQuery } = useQueryState(
		(_, { id, ...params }) => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Afiliado/${id}`,
				method: "GET",
			},
			params
		}),
		{ query: { config: { errorType: "response" } } }
	);

	const [delegados, setDelegados] = useState({
		reload: true,
		loading: "Cargando...",
		data: [...delegadosParam],
	});

	useEffect(() => {
		if (!delegados.reload) return;
		setDelegados((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
		}));
		/** @type {AfiliadoDelegado[]} */
		const data = [];
		const consultas = [...delegados.data];
		let delegado = consultas.shift();
		if (!delegado) return;
		/** @type {onLoad} */
		const onLoad = ({ ok }) => {
			data.push({
				...delegado,
				nombre: delegado.nombre ?? ok?.nombre,
				nroAfiliado: ok?.nroAfiliado,
				documentoTipo: ok?.afipTipoDocumento,
				documentoNumero: ok?.afipNumeroDocumento
			});
			delegado = consultas.shift();
			if (!delegado) {
				setDelegados((o) => ({ ...o, data, loading: null }));
				return;
			}
			setAfiliadoQuery((o) => ({
				...o,
				query: {...o.query, params: { id: delegado.id }},
				onLoad,
			}));
		}
		setAfiliadoQuery((o) => ({
			...o,
			query: {...o.query, params: { id: delegado.id }},
			onLoad,
		}))
	}, [delegados, setAfiliadoQuery])

	let cuerpo = null;
	if (delegados.loading) {
		cuerpo = delegados.loading;
	} else {
		cuerpo = (
			<PDFViewer style={{ flexGrow: "1" }}>
				<LotePDF {...{ delegacion, delegados: delegados.data }} />
			</PDFViewer>
		);
	}

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Credenciales de delegados de delegacion
			</Modal.Header>
			<Modal.Body style={{ height: "70vh" }}>
				<Grid col full gap="15px">{cuerpo}</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid col gap="5px">
					<Grid gap="20px" justify="end">
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={onClose}>
								FINALIZA
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default LotePDFViewer;
