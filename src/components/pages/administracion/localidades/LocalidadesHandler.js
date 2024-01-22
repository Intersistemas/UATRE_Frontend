import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import dayjs from "dayjs";
import { Tab } from "@mui/material";
import { Tabs } from "@mui/material";
import Action from "components/helpers/Action";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import useLocalidades, { onLoadSelectKeepOrFirst } from "./useLocalidades";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import AuthContext from "store/authContext";
import AsignaSeccionalLocalidadHandler from "./AsignaSeccionalLocalidadHandler";

const LocalidadesHandler = () => {
	const dispatch = useDispatch();

	const { usuario } = useContext(AuthContext);

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region API Queries
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
			case "GetSeccionalLocalidad": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "GET",
						endpoint: `/SeccionalLocalidad/GetSeccionalLocalidadByRefLocalidadId`,
					},
				};
			}
			case "UpdateSeccionalLocalidad": {
				return {
					config: {
						baseURL: "Afiliaciones",
						method: "PUT",
						endpoint: `/SeccionalLocalidad/UpdateRecordSeccionalLocalidad`
					}
				}
			}
		}
	});
	//#endregion

	//#region select Provincia
	const [provincias, setProvincias] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: [],
		selected: null,
	});
	useEffect(() => {
		if (!provincias.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
			options: [],
			selected: null,
		};
		pushQuery({
			action: "GetProvincias",
			params: provincias.params,
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo.", { data });
				changes.data = data
					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
					.map((r) => ({ label: r.nombre, value: r.id }));
				changes.options = changes.data;
				changes.selected =
					changes.data.find(
						({ value }) => value === provincias.selected?.value
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
				? r.label.toLowerCase().includes(provincias.buscar.toLowerCase())
				: true
		);
		setProvincias((o) => ({ ...o, options, buscado: o.buscar }));
	}, [provincias]);
	//#endregion

	//#region contenido Localidades

	//#region Localidades Params
	const [localidadesParams, setLocalidadesParams] = useState({
		provinciaId: provincias.selected?.value,
		filtro: "",
		select: null,
		sortBy: "%2Bnombre"
	});
	// Change
	useEffect(() => {
		if (provincias.loading) return;
		const provinciaId = provincias.selected?.value;
		if (provinciaId === localidadesParams.provinciaId) return;
		setLocalidadesParams((o) => ({ ...o, provinciaId }));
	}, [provincias]);
	//#endregion

	//#region Localidades Tabla y acciones
	const {
		render: localidadesRender,
		request: localidadesRequest,
		selected: localidadesSelected,
	} = useLocalidades({
		onEditComplete: ({ edit, response, request }) => {
			const params = { ...localidadesParams };
			switch (request) {
				case "A": {
					params.select = response;
					break;
				}
				case "B": {
					params.select = edit;
					break;
				}
				case "R": {
					params.select = edit;
					params.select.deletedDate = null;
				}
			}
			setLocalidadesParams(params);
		},
		columns: (def) => {
			if (!Array.isArray(def)) return def;
			def.push({
				dataField: "deletedDate",
				text: "Fecha de baja",
				sort: false,
				headerStyle: { width: "150px" },
				formatter: Formato.Fecha,
				style: (v) => {
					const r = { textAlign: "center" };
					if (v) {
						r.background = "#ff6464cc";
						r.color = "#FFF";
					}
					return r;
				},
			});
			return def;
		},
	});

	// Seccional de la localidad
	const [seccionalLocalidad, setSeccionalLocalidad] = useState({
		loading: null,
		params: {},
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!seccionalLocalidad.loading) return;
		const changes = {
			loading: null,
			data: null,
			error: null,
		};
		pushQuery({
			action: "GetSeccionalLocalidad",
			params: { ...seccionalLocalidad.params },
			onOk: async (rta) => {
				if (!Array.isArray(rta))
					return console.error("Se esperaba un arreglo.", { rta });
				changes.data = rta.splice(0, 1).find(() => true);
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () =>
				setSeccionalLocalidad((o) => ({ ...o, ...changes })),
		});
	}, [seccionalLocalidad, pushQuery]);

	const [despliegaAsignaSeccional, setDespliegaAsignaSeccional] =
		useState(null);

	const [localidadesActions, setLocalidadesActions] = useState([]);
	useEffect(() => {
		const createAction = ({ payload = { action: "", request: "" }, ...x }) =>
			new Action({
				name: payload.action,
				onExecute: () => localidadesRequest("selected", payload),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				payload: { action: `Agrega Localidad`, request: "A" },
				tarea: "Localidad_Agrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = ((v) => (v != null ? `C.P. ${Formato.Numero(v)}` : null))(
			localidadesSelected?.codPostal
		);
		if (!desc) {
			setLocalidadesActions(actions);
			setSeccionalLocalidad((o) => ({
				...o,
				loadig: null,
				params: {},
				data: null,
			}));
			return;
		}
		actions.push(
			createAction({
				payload: { action: `Consulta Localidad ${desc}`, request: "C" },
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				payload: { action: `Modifica Localidad ${desc}`, request: "M" },
				disabled: !!localidadesSelected.deletedDate,
				tarea: "Localidad_Modifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		if (localidadesSelected.deletedDate) {
			actions.push(
				createAction({
					payload: { action: `Reactiva Localidad ${desc}`, request: "R" },
					tarea: "Localidad_Reactiva",
					keys: "r",
					underlineindex: 0,
				})
			);
		} else {
			actions.push(
				createAction({
					payload: {
						action: `Baja Localidad ${desc}`,
						request: "B",
						record: {
							deletedDate: dayjs().format("YYYY-MM-DD"),
							deletedBy: usuario.nombre,
							deletedObs: "",
						},
					},
					tarea: "Localidad_Baja",
					keys: "b",
					underlineindex: 0,
				})
			);
		}
		if (seccionalLocalidad.loading) {
			setDespliegaAsignaSeccional(null);
		} else {
			if (
				seccionalLocalidad.params.refLocalidadId !== localidadesSelected?.id
			) {
				setSeccionalLocalidad((o) => ({
					...o,
					loading: "Cargando...",
					params: { refLocalidadId: localidadesSelected.id, soloActivos: true },
				}));
			} else {
				actions.push(
					new Action({
						name: `Modifica Seccional Localidad ${desc}`,
						onExecute: (name) =>
							setDespliegaAsignaSeccional({
								title: name,
								data: { ...seccionalLocalidad.data },
								errors: {},
								dependencies: { provinciaId: localidadesSelected.provinciaId },
							}),
						disabled:
							!!localidadesSelected.deletedDate ||
							localidadesSelected.provinciaId == null ||
							seccionalLocalidad.data == null,
					})
				);
			}
		}
		setLocalidadesActions(actions);
	}, [localidadesRequest, localidadesSelected, seccionalLocalidad]);

	//Carga de lista según parametros
	useEffect(() => {
		const { provinciaId, filtro, select, ...params } = localidadesParams;
		const payload = {
			params,
			pagination: { size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		};
		if (provinciaId != null) params.provinciaId = provinciaId;
		if (filtro) params.filterByCPNombre = filtro;
		if (select) {
			payload.onLoadSelect = () => {
				setLocalidadesParams((o) => ({ ...o, select: null }));
				return select;
			};
		}
		localidadesRequest("list", payload);
	}, [localidadesRequest, localidadesParams]);
	//#endregion

	//#region Tab Localidades
	let asignaSeccionalForm = null;
	if (despliegaAsignaSeccional) {
		asignaSeccionalForm = (
			<AsignaSeccionalLocalidadHandler
				title={despliegaAsignaSeccional.title}
				data={despliegaAsignaSeccional.data}
				errors={despliegaAsignaSeccional.errors}
				dependencies={despliegaAsignaSeccional.dependencies}
				onChange={(changes) => {
					setDespliegaAsignaSeccional((o) => ({
						...o,
						data: { ...o.data, ...changes },
					}));
				}}
				onClose={(confirm) => {
					if (!confirm) return setDespliegaAsignaSeccional(null);
					
					const { data = {} } = despliegaAsignaSeccional;

					const errors = {}
					if (!data.seccionalId) errors.seccionalId = "Dato requerido";


					if (Object.keys(errors).length)
						return setDespliegaAsignaSeccional((o) => ({ ...o, errors }));

					pushQuery({
						action: "UpdateSeccionalLocalidad",
						config: {
							body: { ...data },
						},
						onOk: async () => {
							setDespliegaAsignaSeccional(null);
							setSeccionalLocalidad((o) => ({ ...o, loading: "Cargando..." }));
						},
						onError: async (err) =>
							alert(
								typeof err.message === "object"
									? Object.keys(err.message)
											.map((k) => `${k}: ${err.message[k]}`)
											.join("\n")
									: err.message
							),
					});
				}}
			/>
		);
	}
	tabs.push({
		header: () => <Tab label="Localidades" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<InputMaterial
						label="Filtro por C.P. / Nombre"
						value={localidadesParams.filtro}
						onChange={(filtro) => {
							setLocalidadesParams((o) => ({ ...o, filtro }));
						}}
					/>
					<SearchSelectMaterial
						id="provinciaId"
						label="Provincia"
						helperText={provincias.loading ?? provincias.error?.message ?? ""}
						value={provincias.selected}
						onChange={(selected) => setProvincias((o) => ({ ...o, selected }))}
						options={provincias.options}
						onTextChange={({ target }) =>
							setProvincias((o) => ({ ...o, buscar: target.value }))
						}
					/>
				</Grid>
				{localidadesRender()}
				{asignaSeccionalForm}
			</Grid>
		),
		actions: localidadesActions,
	});
	//#endregion

	//#endregion

	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Localidades", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>Localidades</h1>
			</Grid>
			<Grid col className="tabs">
				<text>{localidadesSelected?.nombre ?? <>&nbsp;</>}</text>
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</Grid>
			{tabs[tab].body()}
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default LocalidadesHandler;
