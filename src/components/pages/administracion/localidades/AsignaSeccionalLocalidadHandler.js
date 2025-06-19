import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

//#region components/helpers
import UseKeyPress from "components/helpers/UseKeyPress";
//#endregion

//#region components/ui
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
//#endregion

const dependenciesDef = { provinciaId: 0 };

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const AsignaSeccionalLocalidadHandler = ({
	data = {},
	title = <></>,
	disabled = {},
	hide = {},
	errors = {},
	dependencies = dependenciesDef,
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	if (dependencies === dependenciesDef) dependencies = { provinciaId: null };

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetSeccionales": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "POST",
						endpoint: `/Seccional/GetSeccionalesSpecs`,
					},
				};
			}
		}
	});

	//#region select Seccional
	const [seccionales, setSeccionales] = useState({
		loading: "Cargando...",
		params: {
			provinciaId: dependencies.provinciaId,
			soloActivos: true,
			pageIndex: 1,
		},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: [],
		selected: { value: data.seccionalId, label: data.seccionalDescripcion },
	});
	useEffect(() => {
		if (!seccionales.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
			options: [],
			selected: { value: 0, label: "" },
		};
		const query = {
			action: "GetSeccionales",
			config: {
				body: {
					...seccionales.params,
					pageIndex: 1,
				},
			},
		};
		query.onOk = async ({ index, pages, count, data }) => {
			if (Array.isArray(data)) {
				changes.data.push(...data);
			} else {
				console.error("Se esperaba un arreglo", data);
			}
			if (changes.data.length < count && index < pages) {
				changes.loading = "Cargando...";
				query.config = {
					body: {
						...seccionales.params,
						pageIndex: index + 1,
					},
				};
				pushQuery({ ...query });
			} else {
				changes.loading = null;
			}
		};
		query.onError = async (error) => {
			changes.loading = null;
			changes.error = error;
		};
		query.onFinally = async () => {
			if (changes.loading) return;
			changes.data = changes.data
				.sort((a, b) => (a.descripcion > b.descripcion ? 1 : -1))
				.map(({ codigo, descripcion, id }) => ({
					label: [codigo, descripcion].join(" - "),
					value: id,
				}));
			changes.options = changes.data;
			changes.selected =
				changes.data.find(
					({ value }) => value === seccionales.selected.value
				) ?? seccionales.selected;
			setSeccionales((o) => ({ ...o, ...changes }));
		};
		pushQuery(query);
	}, [pushQuery, seccionales]);
	// Buscador
	useEffect(() => {
		if (seccionales.loading) return;
		if (seccionales.buscar === seccionales.buscado) return;
		const options = seccionales.data.filter((r) =>
			seccionales.buscar !== ""
				? r.label
						.toLocaleLowerCase()
						.includes(seccionales.buscar.toLocaleLowerCase())
				: true
		);
		setSeccionales((o) => ({ ...o, options, buscado: o.buscar }));
	}, [seccionales]);
	// Change
	useEffect(() => {
		if (seccionales.loading) return;
		if ((seccionales.selected?.value ?? 0) === (data.seccionalId ?? 0)) return;
		onChange({ seccionalId: seccionales.selected?.value ?? 0 });
	}, [seccionales, data.seccionalId, onChange]);
	//#endregion

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show /*onHide={() => onClose()}*/>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				{title}
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width>
						<SearchSelectMaterial
							id="seccionalId"
							name="seccionalId"
							label="Seccional"
							error={!!errors.seccionalId}
							helperText={
								seccionales.loading ??
								seccionales.error?.message ??
								errors.seccionalId ??
								""
							}
							value={seccionales.selected}
							disabled={disabled.seccionalId ?? false}
							onChange={(selected) =>
								setSeccionales((o) => ({ ...o, selected }))
							}
							options={seccionales.options}
							onTextChange={(buscar) =>
								setSeccionales((o) => ({ ...o, buscar }))
							}
						/>
					</Grid>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid gap="20px">
					<Grid width="150px">
						<Button className="botonAzul" onClick={() => onClose(true)}>
							CONFIRMA
						</Button>
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							CANCELA
						</Button>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default AsignaSeccionalLocalidadHandler;
