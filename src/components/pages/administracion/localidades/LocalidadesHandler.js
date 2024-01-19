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
		}
	});
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
							deletedObs: ""
						},
					},
					tarea: "Localidad_Baja",
					keys: "b",
					underlineindex: 0,
				})
			);
		}

		setLocalidadesActions(actions);
	}, [localidadesRequest, localidadesSelected]);
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
	tabs.push({
		header: () => <Tab label="Localidades" disabled={!localidadesSelected} />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<InputMaterial
						label="Filtro por C.P. / Nombre"
						value={localidadesParams.filtro}
						onChange={(filtro) => {
							console.log({ filtro });
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
