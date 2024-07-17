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
 * @typedef {import('components/pages/administracion/seccionales/autoridades/Carnet/LotePDF').Seccional} Seccional
 * @typedef {import('components/pages/administracion/seccionales/autoridades/Carnet/LotePDF').AfiliadoAutoridad} AfiliadoAutoridad
 */

const onCloseDef = () => {};

/**
 * @param {object} props
 * @param {Seccional} props.seccional Datos de la seccional.
 * @param {AfiliadoAutoridad[]} props.autoridades Datos de autoridades de seccional a imprimirles credenciales.
 * @param {onCloseDef} props.onClose Handler al cerrar el modal
 */
const LotePDFViewer = ({ seccional, autoridades: autoridadesParam, onClose = onCloseDef }) => {
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

	const [autoridades, setAutoridades] = useState({
		reload: true,
		loading: "Cargando...",
		data: [...autoridadesParam],
	});

	useEffect(() => {
		if (!autoridades.reload) return;
		setAutoridades((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
		}));
		/**
		 * @type {AfiliadoAutoridad[]}
		 */
		const data = [];
		autoridades.data.forEach((autoridad) => {
			setAfiliadoQuery((o) => ({
				...o,
				query: {...o.query, params: { id: autoridad.id }},
				onLoad: ({ ok }) => {
					data.push({
						...autoridad,
						documentoTipo: ok?.afipTipoDocumento,
						documentoNumero: ok?.afipNumeroDocumento
					})
					if (data.length !== autoridades.data.length) return;
					setAutoridades((o) => ({ ...o, data, loading: null }));
				}
			}))
		})
	}, [autoridades, setAfiliadoQuery])

	let cuerpo = null;
	if (autoridades.loading) {
		cuerpo = autoridades.loading;
	} else {
		cuerpo = (
			<PDFViewer style={{ flexGrow: "1" }}>
				<LotePDF {...{ seccional, autoridades: autoridades.data }} />
			</PDFViewer>
		);
	}

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Credenciales de autoridades de seccional
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
