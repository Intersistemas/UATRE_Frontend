import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import useQueryState from "components/hooks/useQueryState";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";

//#region provinciaSelect Options
const provinciaDefOption = {};
const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion provinciaSelect Options

//#region localidadSelect Options
const localidadDefOption = {};
const localidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: [r.codPostal, r.nombre].join(" - "),
			record: r,
		}),
		filter: (r) => includeSearch(r, buscar),
		...x,
	});
//#endregion localidadSelect Options

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const SeccionalLocalidadesForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	loading = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	const { setState: setProvinciasQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Provincia`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	const { state: localidadQuery, setState: setLocalidadQuery } = useQueryState(
		(_, { id, ...params }) => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/RefLocalidad/${id}`,
				method: "GET",
			},
			params,
		}),
		{
			query: {
				config: { errorType: "response" },
				params: { id: data.refLocalidadId },
			},
		}
	);
	const { setState: setLocalidadesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/RefLocalidad`,
				method: "GET",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);

	//#region Selects

	//#region Select provincia
	const [provinciaSelect, setProvinciaSelect] = useState({
		reload: true,
		loading: null,
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: provinciaDefOption,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setProvinciaSelect((o) => {
			const options = provinciaSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? (o) => o.record.id === record.id
						: record.nombre != null
						? (o) => includeSearch(o, record.nombre)
						: null;
				selected = findFn ? options.find(findFn) : null;
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [provinciaSelect.buscar, provinciaSelect.data]);
	//#endregion Select provincia

	//#region Select localidad
	const [localidadSelect, setLocalidadSelect] = useState({
		loading: "",
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: localidadDefOption,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setLocalidadSelect((o) => {
			const options = localidadSelectOptions(o);
			let selected = o.selected;
			let origen = o.origen;
			if (!selected.value && selected.record) {
				const record = selected.record;
				const findFn =
					record.id != null
						? (o) => o.record.id === record.id
						: record.codPostal != null
						? (o) => o.record.codPostal === record.codPostal
						: record.nombre != null
						? (o) => includeSearch(o, record.nombre)
						: null;
				selected = findFn ? options.find(findFn) : null;
				if (selected) {
					origen = "option";
				} else {
					selected = o.selected;
				}
			}
			return { ...o, options, selected, origen };
		});
	}, [localidadSelect.buscar, localidadSelect.data]);
	//#endregion Select localidad

	//#endregion Selects

	//#region Carga inicial

	//#region Carga inicial select provincias
	useEffect(() => {
		if (!provinciaSelect.reload) return;
		setProvinciaSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
		}));
		setProvinciasQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				const applyPcia = (p = {}) =>
					setProvinciaSelect((o) => ({
						...o,
						data,
						loading: null,
						error: error?.toString(),
						...p,
					}));
				if (!localidadQuery.query.params.id) return applyPcia();
				setLocalidadQuery((o) => ({
					...o,
					onLoad: ({ ok }) => {
						if (!ok) return applyPcia();
						const pcia = data.find((r) => r.id === ok.provinciaId);
						if (!pcia) return applyPcia();
						applyPcia({
							selected: { record: pcia },
							origen: "option",
						});
						const record = ok;
						setLocalidadesQuery((o) => ({
							...o,
							query: {
								...o.query,
								params: {
									...o.query.params,
									provinciaId: pcia.id,
								},
							},
							onPreLoad: () =>
								setLocalidadSelect((o) => ({
									...o,
									selected: localidadDefOption,
									loading: "Cargando...",
								})),
							onLoad: ({ ok, error }) =>
								setLocalidadSelect((o) => ({
									...o,
									data: Array.isArray(ok) ? ok : [],
									loading: null,
									error: error?.toString(),
									selected: error ? localidadDefOption : { record },
									origen: "option",
								})),
						}));
					},
				}));
			},
		}));
	}, [
		provinciaSelect,
		setProvinciasQuery,
		setLocalidadQuery,
		localidadQuery,
		setLocalidadesQuery,
	]);
	//#endregion Carga inicial select provincias

	//#endregion Carga inicial

	return (
		<Modal size="lg" centered show>
			<Modal.Header className={modalCss.modalCabecera}>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<SearchSelectMaterial
							label="Provincia"
							error={!!provinciaSelect.error}
							helperText={provinciaSelect.loading || provinciaSelect.error}
							disabled={!!disabled.refLocalidadId}
							value={provinciaSelect.selected}
							onChange={(selected = provinciaDefOption) => {
								setProvinciaSelect((o) => ({
									...o,
									selected,
									origen: "option",
								}));
								setLocalidadSelect((o) => ({
									...o,
									selected: localidadDefOption,
									buscar: "",
								}));
								onChange({ refLocalidadId: 0, localidadNombre: "" });
								if (selected === provinciaDefOption) return;
								setLocalidadesQuery((o) => ({
									...o,
									query: {
										...o.query,
										params: {
											...o.query.params,
											provinciaId: selected.value,
										},
									},
									onPreLoad: () =>
										setLocalidadSelect((o) => ({
											...o,
											loading: "Cargando...",
										})),
									onLoad: ({ ok, error }) =>
										setLocalidadSelect((o) => ({
											...o,
											data: Array.isArray(ok) ? ok : [],
											loading: null,
											error: error?.toString(),
											origen: "option",
										})),
								}));
							}}
							options={provinciaSelect.options}
							onTextChange={(buscar) =>
								setProvinciaSelect((o) => ({ ...o, buscar, origen: "text" }))
							}
						/>
						<SearchSelectMaterial
							label="Localidad"
							error={!!(localidadSelect.error || errors.refLocalidadId)}
							helperText={
								localidadSelect.loading ||
								localidadSelect.error ||
								errors.refLocalidadId
							}
							disabled={!!disabled.refLocalidadId}
							value={localidadSelect.selected}
							onChange={(selected = localidadDefOption) => {
								setLocalidadSelect((o) => ({
									...o,
									selected,
									origen: "option",
								}));
								onChange({
									refLocalidadId: selected.value,
									localidadNombre: selected.label,
								});
							}}
							options={localidadSelect.options}
							onTextChange={(buscar) =>
								setLocalidadSelect((o) => ({ ...o, buscar, origen: "text" }))
							}
						/>
					</Grid>
					{hide.deletedObs ? null : (
						<>
							<Grid width gap="inherit">
								<Grid width="200px">
									<InputMaterial
										id="deletedDate"
										type="date"
										label="Fecha Baja"
										error={!!errors.deletedDate}
										helperText={errors.deletedDate ?? ""}
										value={data.deletedDate}
										disabled={!!disabled.deletedDate}
										onChange={(v) => onChange({ deletedDate: v.format("YYYY-MM-DD") })}
									/>
								</Grid>
								<Grid grow>
									<InputMaterial
										id="deletedBy"
										label="Usuario Baja"
										error={!!errors.deletedBy}
										helperText={errors.deletedBy ?? ""}
										value={data.deletedBy}
										disabled={!!disabled.deletedBy}
										onChange={(deletedBy) => onChange({ deletedBy })}
									/>
								</Grid>
							</Grid>
							<Grid width>
								<InputMaterial
									id="deletedObs"
									label="Observaciones Baja"
									error={!!errors.deletedObs}
									helperText={errors.deletedObs ?? ""}
									value={data.deletedObs}
									disabled={!!disabled.deletedObs}
									onChange={(deletedObs) => onChange({ deletedObs })}
								/>
							</Grid>
						</>
					)}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Button
					width={25}
					loading={loading != null}
					className="botonAzul"
					onClick={() => onClose(true)}
				>
					CONFIRMA
				</Button>
				<Button width={25} className="botonAmarillo" onClick={() => onClose()}>
					CANCELA
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SeccionalLocalidadesForm;
