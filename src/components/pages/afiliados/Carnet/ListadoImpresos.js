import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { PDFViewer } from "@react-pdf/renderer";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import ListadoImpresosPDF from "./ListadoImpresosPDF";
import useQueryQueue from "components/hooks/useQueryQueue";
import AsArray from "components/helpers/AsArray";

const onCloseDef = () => {};

/**
 * @param {object} props
 * @param {array} props.data Datos de afiliados con credenciales impresas.
 * @param {onCloseDef} props.onClose Handler al cerrar el modal
 */
const ListadoImpresos = ({ data, onClose = onCloseDef }) => {
	//#region API Queries
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetSeccional": {
				const { id, ...others } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/${id}`,
						method: "GET",
					},
					params: others,
				};
			}
			default:
				return null;
		}
	});
	//#endregion API Queries

	//#region declaración y carga de dependencias
	const [dependencias, setDependencias] = useState({
		reload: true,
		loading: null,
		params: {
			seccionales: data
				.map((r) => r.seccionalId)
				.filter((v, i, a) => a.indexOf(v) === i),
		},
		data: {
			seccionales: null,
		},
		errors: null,
	});

	useEffect(() => {
		if (!dependencias.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			params: dependencias.params,
			data: { ...dependencias.data },
			errors: null,
		};
		const setData = (value, error = {}) => {
			Object.keys(value).forEach((k) => {
				changes.data[k] = value[k];
				if (!error[k]) return;
				changes.errors ??= {};
				changes.errors[k] = error[k];
			});
		};
		const applyChanges = () => {
			if (Object.keys(changes.data).filter((k) => !changes.data[k]).length)
				return;
			changes.loading = null;
			setDependencias((o) => ({ ...o, ...changes }));
		};
		setDependencias((o) => ({ ...o, ...changes }));
		Object.keys(changes.params).forEach((k) => {
			if (changes.data[k]) return;
			switch (k) {
				case "seccionales": {
					const seccionales = [];
					const erroresSecc = [];
					if (!dependencias.params.seccionales.length) {
						setData({ seccionales });
						applyChanges();
						return;
					}
					dependencias.params.seccionales.forEach((id) => {
						pushQuery({
							action: "GetSeccional",
							params: { id },
							onOk: async (seccional) => seccionales.push(seccional),
							onError: async (error) => erroresSecc.push(error.toString()),
							onFinally: async () => {
								if (
									dependencias.params.seccionales.length !==
									seccionales.length + erroresSecc.length
								)
									return;
								setData(
									{ seccionales },
									{ seccionales: erroresSecc.length ? erroresSecc : null }
								);
								applyChanges();
							},
						});
					});
					return;
				}
				default:
					return;
			}
		});
	}, [dependencias, pushQuery]);
	//#endregion declaración y carga de dependencias

	let content = null;
	if (dependencias.reload || dependencias.loading) {
		content = <Grid style={{ color: "green" }}>{dependencias.loading}</Grid>;
	} else if (dependencias.errors) {
		content = dependencias.errors.map((v, i) => (
			<Grid style={{ color: "red" }} key={i}>
				{v}
			</Grid>
		));
	} else {
		const seccionales = AsArray(dependencias.data.seccionales);
		data.forEach((r) => {
			const seccional = seccionales.find(({ id }) => id === r.seccionalId) ?? {
				id: r.seccionalId,
				descripcion: "SIN ASIGNAR",
			};
			seccional.lineas ??= [];
			seccional.lineas.push(r);
		});
		content = (
			<PDFViewer style={{ flexGrow: "1" }}>
				<ListadoImpresosPDF data={seccionales} />
			</PDFViewer>
		);
	}

	//ToDo consultar seccionales para obtener sus provincias.
	return (
		<Modal size="xl" centered show onHide={onClose}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Credenciales impresas de afiliados
			</Modal.Header>
			<Modal.Body style={{ height: "70vh" }}>
				<Grid col full gap="15px">
					{content}
				</Grid>
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

export default ListadoImpresos;
