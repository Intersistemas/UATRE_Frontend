import React, { useEffect, useState } from "react";
// import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "components/ui/Table/Table";
import Formato from "components/helpers/Formato";
import styles from "./Localizar.module.css";

const onCloseDef = () => {};

const InputMaterialDetail = (p) => (
	<InputMaterial variant="standard" padding="0rem 0.5rem" size="small" {...p} />
);

const Localizar = ({ onClose = onCloseDef }) => {
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetAfiliados": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: "/Afiliado/GetAfiliadosWithSpec",
						method: "POST",
					},
				};
			}
			default:
				return null;
		}
	});

	const [state, setState] = useState({
		nroAfiliado: 0,
		documento: 0,
		cuil: 0,
	});

	const [afiliados, setAfiliados] = useState({
		loading: null,
		params: {},
		pagination: { index: 1, size: 2, count: 0 },
		data: [],
		selection: { selected: [] },
		error: null,
	});
	const selected =
		afiliados.data.find((r) => afiliados.selection.selected.includes(r.id)) ??
		{};
	useEffect(() => {
		if (!afiliados.loading) return;
		pushQuery({
			action: "GetAfiliados",
			config: {
				body: {
					...afiliados.params,
					soloActivos: true,
					pageIndex: afiliados.pagination.index,
					pageSize: afiliados.pagination.size,
				},
			},
			onOk: ({ index, size, count, data }) =>
				setAfiliados((o) => ({
					...o,
					loading: null,
					pagination: { index, size, count },
					data,
					selection: {
						selected: ((a) => (a.length ? a : data.length ? [data[0].id] : []))(
							data
								.filter((r) => o.selection.selected.includes(r.id))
								.map((r) => r.id)
						),
					},
					error: null,
				})),
			onError: (e) =>
				setAfiliados((o) => ({ ...o, loading: null, data: [], error: e })),
		});
	}, [pushQuery, afiliados]);

	return (
		<Modal size="lg" centered show onHide={onClose}> 
			<Modal.Header className={modalCss.modalCabecera}>
				<Grid width="full" justify="center">
					<h4>Localiza Afiliado</h4>
				</Grid>
			</Modal.Header>
			<Modal.Body>
				<Grid col width="full" gap="10px">
					<Grid>Buscar por...</Grid>
					<Grid width="full" gap="inherit">
						<InputMaterial
							label="Nro. Afiliado"
							type="number"
							value={state.nroAfiliado}
							onChange={(v) => setState((o) => ({ ...o, nroAfiliado: v }))}
						/>
						<InputMaterial
							label="CUIL"
							type="number"
							value={state.cuil}
							onChange={(v) => setState((o) => ({ ...o, cuil: v }))}
						/>
						<InputMaterial
							label="Documento"
							type="number"
							value={state.documento}
							onChange={(v) => setState((o) => ({ ...o, documento: v }))}
						/>
						<Grid style={{ minWidth: "200px" }}>
							<Button
								className="botonAmarillo"
								onClick={() => {
									const cambios = {
										params: {},
										data: [],
										selection: { selected: [] },
									};

									if (state.nroAfiliado)
										cambios.params.nroAfiliado = state.nroAfiliado;
									if (state.documento) cambios.params.documento = state.documento;
									if (state.cuil) cambios.params.cuil = state.cuil;

									if (Object.keys(cambios.params).length)
										cambios.loading = "Cargando...";
									else
										cambios.error = { message: "Debe ingresar algún parámetro " };

									setAfiliados((o) => ({ ...o, ...cambios }));
								}}
							>
								Localiza
							</Button>
						</Grid>
					</Grid>
					<Table
						remote
						loading={!!afiliados.loading}
						mostrarBuscar={false}
						keyField="id"
						data={afiliados.data}
						pagination={{
							...afiliados.pagination,
							onChange: (c) =>
								setAfiliados((o) => ({
									...o,
									loading: "Cargando",
									pagination: { ...o.pagination, ...c },
								})),
						}}
						selection={{
							...afiliados.selection,
							onSelect: (row, isSelect, index, e) =>
								setAfiliados((o) => ({
									...o,
									selection: { ...o.selection, selected: [row.id] },
								})),
						}}
						noDataIndication={
							afiliados.loading ||
							((e) => (e ? <span style={{ color: "red" }}>{e}</span> : null))(
								[afiliados.error?.code, afiliados.error?.message]
									.filter((r) => r)
									.join(" ")
							) ||
							"No existen datos para mostrar"
						}
						columns={[
							{
								dataField: "nroAfiliado",
								text: "Nro. Afil.",
								style: { textAlign: "center" },
								headerStyle: () => ({ width: "7rem", textAlign: "center" }),
							},
							{
								dataField: "nombre",
								text: "Nombre",
							},
							{
								dataField: "seccional",
								text: "Seccional",
								formatter: (v, row) => `${row.seccionalCodigo} ${v}`,
							},
		
						]}
					/>
					<Grid
						className={[styles.fondo, styles.grupo].join(" ")}
						col
						width="full"
						gap="inherit"
					>
						<Grid className={styles.titulo} width="full">
							Datos del afiliado
						</Grid>
						<Grid col width="full" gap="inherit" style={{ padding: "0rem 1rem" }}>
							<Grid width="full" gap="inherit">
								<InputMaterialDetail
									label="Nro. afiliado"
									value={selected.nroAfiliado}
								/>
								<InputMaterialDetail
									label="CUIL"
									mask="99-99.999.999-9"
									value={selected.cuil}
								/>
								<InputMaterialDetail
									label="Documento"
									value={[
										selected.afipTipoDocumento,
										Formato.DNI(selected.afipNumeroDocumento),
									]
										.filter((r) => r)
										.join(" ")}
								/>
							</Grid>
							<InputMaterialDetail label="Seccional" value={`${selected?.seccionalCodigo} ${selected?.seccional}`} />
							<InputMaterialDetail label="Nombre" value={selected?.nombre} />
						</Grid>
					</Grid>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid width="full" justify="evenly" gap="inherit">
					<Grid width="200px" gap="inherit">
						<Button className="botonAmarillo" onClick={onClose}>
							Cierra
						</Button>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default Localizar;
