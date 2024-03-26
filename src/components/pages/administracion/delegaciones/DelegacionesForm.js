import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import { pick } from "components/helpers/Utils";
import useQueryQueue, { QueryClass } from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, {
	mapOptions,
	includeSearch,
} from "components/ui/Select/SearchSelectMaterial";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const onLoaded = ({}) => {};

const provinciaSelectOptions = ({ data = [], ...x }) =>
	mapOptions({
		data,
		map: (r) => ({
			value: r.id,
			label: r.nombre,
			data: r,
		}),
		...x,
	});

const localidadSelectOptions = ({ data = [], ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.id, label: r.nombre }),
		...x,
	});

const DelegacionesForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};
	data.codigoDelegacion ??= "";
	data.nombre ??= "";

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	//#region consultas API
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetProvincias": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Provincia`,
						method: "GET",
					},
				};
			}
			case "GetLocalidades": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/RefLocalidad`,
						method: "GET",
					},
				};
			}
			case "GetLocalidad": {
				const { id, ...others } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/RefLocalidad/${id}`,
						method: "GET",
					},
					params: others,
				};
			}
			case "GetAfiliados": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado/GetAfiliadosWithSpec`,
						method: "POST",
					},
				};
			}
			case "GetAfiliado": {
				const { id, ...others } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado/${id}`,
						method: "GET",
					},
					params: others,
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region select provincia
	const [provinciaSelect, setProvinciaSelect] = useState({
		reload: false,
		loading: null,
		params: {},
		data: [],
		error: null,
		buscar: "",
		options: [],
		filtered: [],
		selected: {},
		onLoaded,
	});

	useEffect(() => {
		if (!provinciaSelect.reload) return;
		const changes = {
			reload: null,
			loading: "Cargando...",
			data: [],
			error: null,
			buscar: "",
			options: [],
			onLoaded: provinciaSelect.onLoaded,
		};
		setProvinciaSelect((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetProvincias",
			params: { ...provinciaSelect.params },
			config: { errorType: "response" },
			onOk: (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
			},
			onError: (error) => (changes.error = error.toString()),
			onFinally: () => {
				changes.options = provinciaSelectOptions({ data: changes.data });
				if (changes.onLoaded) changes.onLoaded(changes);
				changes.onLoaded = null;
				changes.loading = null;
				setProvinciaSelect((o) => ({ ...o, ...changes, loading: null }));
			},
		});
	}, [provinciaSelect, pushQuery]);
	// Buscador
	useEffect(() => {
		if (provinciaSelect.reload) return;
		if (provinciaSelect.loading) return;
		setProvinciaSelect((o) => ({
			...o,
			filtered: o.options.filter((r) =>
				includeSearch(r, provinciaSelect.buscar)
			),
		}));
	}, [provinciaSelect.reload, provinciaSelect.loading, provinciaSelect.buscar]);
	//#endregion select provincia

	//#region select localidad
	const [localidadSelect, setLocalidadSelect] = useState({
		reload: false,
		loading: null,
		params: { soloActivos: true },
		data: [],
		error: null,
		buscar: "",
		options: [],
		selected: {},
		onLoaded,
	});

	useEffect(() => {
		if (!localidadSelect.reload) return;
		const changes = {
			reload: null,
			loading: "Cargando...",
			data: [],
			error: null,
			buscar: "",
			options: [],
			onLoaded: localidadSelect.onLoaded,
		};
		setLocalidadSelect((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetLocalidades",
			params: { ...localidadSelect.params },
			config: { errorType: "response" },
			onOk: (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
			},
			onError: (error) => (changes.error = error.toString()),
			onFinally: () => {
				changes.options = localidadSelectOptions({ data: changes.data });
				if (changes.onLoaded) changes.onLoaded(changes);
				changes.onLoaded = null;
				changes.loading = null;
				setLocalidadSelect((o) => ({ ...o, ...changes, loading: null }));
			},
		});
	}, [localidadSelect, pushQuery]);
	// Buscador
	useEffect(() => {
		if (localidadSelect.reload) return;
		if (localidadSelect.loading) return;
		setLocalidadSelect((o) => ({
			...o,
			filtered: o.options.filter((r) =>
				includeSearch(r, localidadSelect.buscar)
			),
		}));
	}, [localidadSelect.reload, localidadSelect.loading, localidadSelect.buscar]);
	//#endregion select localidad

	//#region localidadInit
	const [localidadInit, setLocalidadInit] = useState({
		reload: true,
		params: { id: data.refLocalidadId },
		ok: null,
		error: null,
		onLoaded: ({ ok }) => {
			setProvinciaSelect((o) => ({
				...o,
				reload: true,
				onLoaded: (changesProv) => {
					changesProv.selected =
						changesProv.options.find((r) => r.value === ok?.provinciaId) ?? {};
					setLocalidadSelect((o) => ({
						...o,
						reload: !!changesProv.selected.value,
						params: { ...o.params, provinciaId: changesProv.selected.value },
						data: [],
						options: [],
						filtered: [],
						selected: {
							id: 0,
							label: changesProv.selected.data.localidadDescripcionPorDefecto,
						},
						onLoaded: (changesLoc) => {
							changesLoc.selected =
								changesLoc.options.find(
									(r) => r.value === data.refLocalidadId
								) ?? {};
						},
					}));
				},
			}));
		},
	});
	useEffect(() => {
		if (!localidadInit.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			ok: null,
			error: null,
		};
		setLocalidadInit((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetLocalidad",
			params: localidadInit.params,
			config: { errorType: "response" },
			onOk: async (ok) => (changes.ok = ok),
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () => {
				localidadInit.onLoaded(changes);
				changes.loading = null;
				setLocalidadInit((o) => ({ ...o, ...changes }));
			},
		});
	}, [localidadInit, pushQuery]);
	//#endregion localidadInit

	//#region delegado
	const [delegado, setDelegado] = useState({
		reload: true,
		loading: null,
		params: { id: data.delegadoId },
		data: {},
		error: null,
		onLoaded,
	});

	useEffect(() => {
		if (!delegado.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: {},
			error: null,
			onLoaded: delegado.onLoaded,
		};
		setDelegado((o) => ({ ...o, ...changes }));
		const query = new QueryClass({
			config: { errorType: "response" },
			onError: async (error) => (changes.error = error.code === 404 ? null : error.toString()),
			onFinally: async () => {
				if (changes.onLoaded) changes.onLoaded(changes);
				changes.onLoaded = null;
				changes.loading = null;
				setDelegado((o) => ({ ...o, ...changes }));
			},
		});
		if ("id" in delegado.params) {
			query.action = "GetAfiliado"
			query.params = { ...delegado.params };
			query.onOk = async (data) => (changes.data = data ?? {});
		} else {
			query.action = "GetAfiliados"
			query.config.body = { ...delegado.params };
			query.onOk = async ({ data }) => (changes.data = data.at(0) ?? {});
		}
		pushQuery(query);
	}, [delegado, pushQuery]);
	//#endregion delegado

	//#region subdelegado
	const [subdelegado, setSubdelegado] = useState({
		reload: true,
		loading: null,
		params: { id: data.subDelegadoId },
		data: {},
		error: null,
		onLoaded,
	});

	useEffect(() => {
		if (!subdelegado.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: {},
			error: null,
			onLoaded: subdelegado.onLoaded,
		};
		setSubdelegado((o) => ({ ...o, ...changes }));
		const query = new QueryClass({
			config: { errorType: "response" },
			onError: async (error) => (changes.error = error.code === 404 ? null : error.toString()),
			onFinally: async () => {
				if (changes.onLoaded) changes.onLoaded(changes);
				changes.onLoaded = null;
				changes.loading = null;
				setSubdelegado((o) => ({ ...o, ...changes }));
			},
		});
		if ("id" in subdelegado.params) {
			query.action = "GetAfiliado"
			query.params = { ...subdelegado.params };
			query.onOk = async (data) => (changes.data = data ?? {});
		} else {
			query.action = "GetAfiliados"
			query.config.body = { ...subdelegado.params };
			query.onOk = async ({ data }) => (changes.data = data.at(0) ?? {});
		}
		pushQuery(query);
	}, [subdelegado, pushQuery]);
	//#endregion subdelegado

	return (
		<Modal size="lg" centered show>
			<Modal.Header className={modalCss.modalCabecera}>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<Grid width="200px">
							{hide.codigoDelegacion ? null : (
								<InputMaterial
									label="Delegación - Código"
									error={!!errors.codigoDelegacion}
									helperText={errors.codigoDelegacion ?? ""}
									value={data.codigoDelegacion}
									disabled={!!disabled.codigoDelegacion}
									onChange={(v) => onChange({ codigoDelegacion: v })}
								/>
							)}
						</Grid>
						<Grid grow>
							{hide.nombre ? null : (
								<InputMaterial
									label="Delegación - Nombre"
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									disabled={!!disabled.nombre}
									onChange={(v) => onChange({ nombre: v })}
								/>
							)}
						</Grid>
					</Grid>
					{hide.delegado ? null : (
						<Grid width gap="inherit">
							<Grid width="200px">
								<InputMaterial
									label="Delegado - Nro. Afil."
									error={!!errors.delegadoId || delegado.error}
									helperText={
										errors.delegadoId ??
										delegado.loading ??
										delegado.error ??
										""
									}
									value={delegado.data.nroAfiliado}
									disabled={!!disabled.delegadoId}
									onChange={(nroAfiliado) => {
										setDelegado((o) => ({
											...o,
											data: { ...o.data, nroAfiliado },
										}));
									}}
								/>
							</Grid>
							<Grid width="100px">
								<Button
									className="botonAmarillo"
									disabled={!!disabled.delegadoId}
									onClick={() => {
										setDelegado((o) => ({
											...o,
											reload: true,
											params: { nroAfiliado: o.data.nroAfiliado },
											onLoaded: ({ data }) =>
												onChange({
													delegadoId: data.id,
													delegadoNombre: data.nombre,
												}),
										}));
									}}
								>
									Valida
								</Button>
							</Grid>
							<Grid grow>
								<InputMaterial
									label="Delegado - Nombre"
									error={!!errors.delegadoIdNombre}
									helperText={errors.delegadoIdNombre ?? ""}
									value={delegado.data.nombre}
									disabled={!!disabled.delegadoIdNombre}
									onChange={(nombre) => {
										setDelegado((o) => ({...o, data: {...o.data, nombre } }))
										onChange({ delegadoIdNombre: nombre });
									}}
								/>
							</Grid>
						</Grid>
					)}
					{hide.subDelegado ? null : (
						<Grid width gap="inherit">
							<Grid width="200px">
								<InputMaterial
									label="Subdelegado - Nro. Afil."
									error={!!errors.subDelegadoId || subdelegado.error}
									helperText={
										errors.subdelegadoId ??
										subdelegado.loading ??
										subdelegado.error ??
										""
									}
									value={subdelegado.data.nroAfiliado}
									disabled={!!disabled.subDelegadoId}
									onChange={(nroAfiliado) => {
										setSubdelegado((o) => ({
											...o,
											data: { ...o.data, nroAfiliado },
										}));
									}}
								/>
							</Grid>
							<Grid width="100px">
								<Button
									className="botonAmarillo"
									disabled={!!disabled.subDelegadoId}
									onClick={() => {
										setSubdelegado((o) => ({
											...o,
											reload: true,
											params: { nroAfiliado: o.data.nroAfiliado },
											onLoaded: ({ data }) =>
												onChange({
													subDelegadoId: data.id,
													subDelegadoNombre: data.nombre,
												}),
										}));
									}}
								>
									Valida
								</Button>
							</Grid>
							<Grid grow>
								<InputMaterial
									label="Subdelegado - Nombre"
									error={!!errors.subDelegadoIdNombre}
									helperText={errors.subDelegadoIdNombre ?? ""}
									value={subdelegado.data.nombre}
									disabled={!!disabled.subDelegadoIdNombre}
									onChange={(nombre) => {
										setDelegado((o) => ({...o, data: {...o.data, nombre} }))
										onChange({ subDelegadoIdNombre: nombre });
									}}
								/>
							</Grid>
						</Grid>
					)}
					<Grid gap="inherit">
						<SearchSelectMaterial
							id="provinciaSelect"
							label="Provincia"
							error={!!provinciaSelect.error}
							helperText={provinciaSelect.loading ?? provinciaSelect.error}
							value={provinciaSelect.selected}
							disabled={!!disabled.refLocalidadId}
							onChange={(selected) => {
								setProvinciaSelect((o) => ({ ...o, selected }));
								onChange({ refLocalidadId: 0 });
								setLocalidadSelect((o) => ({
									...o,
									reload: !!selected.value,
									params: { ...o.params, provinciaId: selected.value },
									data: [],
									options: [],
									filtered: [],
									selected: {
										id: 0,
										label: selected.data.localidadDescripcionPorDefecto,
									},
								}));
							}}
							options={provinciaSelect.filtered}
							onTextChange={(buscar) =>
								setProvinciaSelect((o) => ({ ...o, buscar }))
							}
						/>
						<SearchSelectMaterial
							id="localidadSelect"
							label="Localidad"
							error={!!localidadSelect.error}
							helperText={
								localidadInit.loading ??
								localidadSelect.loading ??
								localidadSelect.error
							}
							value={localidadSelect.selected}
							disabled={!!disabled.refLocalidadId}
							onChange={(selected) => {
								setLocalidadSelect((o) => ({ ...o, selected }));
								onChange({ refLocalidadId: selected.value });
							}}
							options={localidadSelect.options}
							onTextChange={(buscar) =>
								setLocalidadSelect((o) => ({ ...o, buscar }))
							}
						/>
					</Grid>
					{/* <Grid width gap="inherit">
						<Grid width>
							{hide.codigoDelegacion ? null : (
								<InputMaterial
									label="Delegación - Código"
									error={!!errors.codigoDelegacion}
									helperText={errors.codigoDelegacion ?? ""}
									value={data.codigoDelegacion}
									disabled={!!disabled.codigoDelegacion}
									onChange={(v) => onChange({ codigoDelegacion: v })}
								/>
							)}
						</Grid>
						<Grid width>
							{hide.nombre ? null : (
								<InputMaterial
									label="Delegación - Nombre"
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									disabled={!!disabled.nombre}
									onChange={(v) => onChange({ nombre: v })}
								/>
							)}
						</Grid>
					</Grid> */}
					<Grid width gap="inherit">
						{hide.deletedObs ? null : (
							<InputMaterial
								label="Observaciones de baja"
								error={!!errors.deletedObs}
								helperText={errors.deletedObs ?? ""}
								value={data.deletedObs}
								disabled={!!disabled.deletedObs}
								onChange={(v) => onChange({ deletedObs: v })}
							/>
						)}
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

export default DelegacionesForm;
