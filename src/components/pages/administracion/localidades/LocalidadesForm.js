import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";

//#region components/helpers
import AsArray from "components/helpers/AsArray";
import UseKeyPress from "components/helpers/UseKeyPress";
//#endregion

//#region components/ui
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
//#endregion

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const LocalidadesForm = ({
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
			case "GetProvincias": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/Provincia`,
					},
				};
			}
		}
	});

	//#region select Provincia
	const [provincias, setProvincias] = useState({
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
		if (!provincias.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
			options: [],
			selected: { value: 0, label: "" },
		};
		pushQuery({
			action: "GetProvincias",
			params: provincias.params,
			onOk: async (data) => {
				changes.data = AsArray(data)
					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
					.map((r) => ({ label: r.nombre, value: r.id }));
				changes.options = changes.data;
				changes.selected =
					changes.data.find(
						({ value }) => value === provincias.selected.value
					) ?? provincias.selected;
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setProvincias((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, provincias]);
	// Buscador
	useEffect(() => {
		if (provincias.loading) return;
		if (provincias.buscar === provincias.buscado) return;
		const options = provincias.data.filter((r) =>
			provincias.buscar !== ""
				? r.label
						.toLocaleLowerCase()
						.includes(provincias.buscar.toLocaleLowerCase())
				: true
		);
		setProvincias((o) => ({ ...o, options, buscado: o.buscar }));
	}, [provincias]);
	// Change
	useEffect(() => {
		if (provincias.loading) return;
		if ((provincias.selected?.value ?? 0) === (data.provinciaId ?? 0)) return;
		onChange({ provinciaId: provincias.selected?.value ?? 0 });
	}, [provincias, data.provinciaId, onChange]);
	//#endregion

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
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
									label="C.P."
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
									label="Nombre"
									disabled={disabled.nombre}
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									onChange={(nombre) => onChange({ nombre })}
								/>
							)}
						</Grid>
					</Grid>
					<Grid width>
						{hide.provinciaId ? null : (
							<SearchSelectMaterial
								id="provinciaId"
								name="provinciaId"
								label="Provincia"
								error={!!errors.provinciaId}
								helperText={
									provincias.loading ??
									provincias.error?.message ??
									errors.provinciaId ??
									""
								}
								value={provincias.selected}
								disabled={disabled.provinciaId ?? false}
								onChange={(selected) =>
									setProvincias((o) => ({ ...o, selected }))
								}
								options={provincias.options}
								onTextChange={({ target }) =>
									setProvincias((o) => ({ ...o, buscar: target.value }))
								}
								required
							/>
						)}
					</Grid>
					{hide.deletedDate ? null : (
						<Grid width gap="inherit" col>
							<Grid width gap="inherit">
								<Grid width="35%">
									{hide.deletedDate ? null : (
										<DateTimePicker
											type="date"
											label="Fecha de baja"
											value={data.deletedDate}
											disabled={disabled.deletedDate}
										/>
									)}
								</Grid>
								<Grid width>
									{hide.deletedBy ? null : (
										<InputMaterial
											label="Baja realizada por"
											disabled={disabled.deletedBy}
											error={!!errors.deletedBy}
											helperText={errors.deletedBy ?? ""}
											value={data.deletedBy}
											onChange={(deletedBy) => onChange({ deletedBy })}
										/>
									)}
								</Grid>
							</Grid>
							<Grid width>
								<InputMaterial
									label="Observaciones de baja"
									disabled={disabled.deletedObs}
									error={!!errors.deletedObs}
									helperText={errors.deletedObs ?? ""}
									value={data.deletedObs}
									onChange={(deletedObs) => onChange({ deletedObs })}
								/>
							</Grid>
						</Grid>
					)}
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

export default LocalidadesForm;
