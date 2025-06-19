import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

//#region components/helpers
import AsArray from "components/helpers/AsArray";
import UseKeyPress from "components/helpers/UseKeyPress";

//#region components/ui
import useQueryQueue from "components/hooks/useQueryQueue";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";


const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const DenunciasForm = ({
	data = {},
	title = <></>,
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetDenuncia": {
				return {
					config: {
						baseURL: "App",
						method: "GET",
						endpoint: "/EncuestaRespuestas",
					},
				};
			}
		}
	});

	//#region select Provincia
	const [denuncia, setDenunciass] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: [],
		selected: { value: data.provinciaId, label: data.provincia },
	});
	useEffect(() => {
		if (!denuncia.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
			options: [],
			selected: { value: 0, label: "" },
		};
		pushQuery({
			action: "GetDenuncia",
			params: denuncia.params,
			onOk: async (data) => {
				changes.data = AsArray(data)
					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
					.map((r) => ({ label: r.nombre, value: r.id }));
				changes.options = changes.data;
				changes.selected =
					changes.data.find(
						({ value }) => value === denuncia.selected.value
					) ?? denuncia.selected;
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setDenunciass((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, denuncia]);
	// Buscador
	useEffect(() => {
		if (denuncia.loading) return;
		if (denuncia.buscar === denuncia.buscado) return;
		const options = denuncia.data.filter((r) =>
			denuncia.buscar !== ""
				? r.label
						.toLocaleLowerCase()
						.includes(denuncia.buscar.toLocaleLowerCase())
				: true
		);
		setDenunciass((o) => ({ ...o, options, buscado: o.buscar }));
	}, [denuncia]);
	// Change
	useEffect(() => {
		if (denuncia.loading) return;
		if ((denuncia.selected?.value ?? 0) === (data.provinciaId ?? 0)) return;
		onChange({ provinciaId: denuncia.selected?.value ?? 0 });
	}, [denuncia, data.provinciaId, onChange]);
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
					<Grid width="full" gap="inherit">
						<Grid width="35%">
							{hide.codPostal ? null : (
								<InputMaterial
									type="number"
									label="Id"
									disabled={disabled.codPostal}
									error={!!errors.codPostal}
									helperText={errors.codPostal ?? ""}
									value={data.codPostal}
									onChange={(codPostal) => onChange({ codPostal })}
								/>
							)}
						</Grid>
						<Grid width>
							{hide.nombre ? null : (
								<InputMaterial
									label="Afiliado"
									disabled={disabled.nombre}
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									onChange={(nombre) => onChange({ nombre })}
								/>
							)}
						</Grid>
					</Grid>
					
					
				</Grid>
			</Modal.Body>
			
		</Modal>
	);
};

export default DenunciasForm;
