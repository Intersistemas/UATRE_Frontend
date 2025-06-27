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

const MetricaForm = ({
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
			case "GetMetrica": {
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
	const [metrica, setMetrica] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: [],
		selected: { value: data.metricaId, label: data.provincia },
	});
	useEffect(() => {
		if (!metrica.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
			options: [],
			selected: { value: 0, label: "" },
		};
		pushQuery({
			action: "GetMetrica",
			params: metrica.params,
			onOk: async (data) => {
				changes.data = AsArray(data)
					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
					.map((r) => ({ label: r.nombre, value: r.id }));
				changes.options = changes.data;
				changes.selected =
					changes.data.find(
						({ value }) => value === metrica.selected.value
					) ?? metrica.selected;
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setMetrica((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, metrica]);
	// Buscador
	useEffect(() => {
		if (metrica.loading) return;
		if (metrica.buscar === metrica.buscado) return;
		const options = metrica.data.filter((r) =>
			metrica.buscar !== ""
				? r.label
						.toLocaleLowerCase()
						.includes(metrica.buscar.toLocaleLowerCase())
				: true
		);
		setMetrica((o) => ({ ...o, options, buscado: o.buscar }));
	}, [metrica]);
	// Change
	useEffect(() => {
		if (metrica.loading) return;
		if ((metrica.selected?.value ?? 0) === (data.metricaId ?? 0)) return;
		onChange({ metricaId: metrica.selected?.value ?? 0 });
	}, [metrica, data.metricaId, onChange]);
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
									label="Id."
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
						{hide.metricaId ? null : (
							<SearchSelectMaterial
								id="metricaId"
								name="metricaId"
								label="Provincia"
								error={!!errors.metricaId}
								helperText={
									metrica.loading ??
									metrica.error?.message ??
									errors.metricaId ??
									""
								}
								value={metrica.selected}
								disabled={disabled.metricaId ?? false}
								onChange={(selected) =>
									setMetrica((o) => ({ ...o, selected }))
								}
								options={metrica.options}
								onTextChange={(buscar) =>
									setMetrica((o) => ({ ...o, buscar}))
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

export default MetricaForm;
