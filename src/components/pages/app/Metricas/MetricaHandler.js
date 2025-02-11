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
import useMetrica, { onLoadSelectKeepOrFirst } from "./useMetrica";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import AuthContext from "store/authContext";

const MetricaHandler = () => {
	const dispatch = useDispatch();

	const { usuario } = useContext(AuthContext);

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region API Queries
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetMetrica": {
				return {
					config: {
						baseURL: "App",
						method: "GET",
						endpoint: "/AppMetricas",
					},
				};
			}
			
			
		}
	});
	//#endregion

	//#region select Provincia
	const [metrica, setMetrica] = useState({
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
		if (!metrica.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null, 
			options: [],
			selected: null,
		};
		pushQuery({
			action: "GetMetrica",
			params: metrica.params,
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo.", { data });
				changes.data = data
					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
					.map((r) => ({ label: r.nombre, value: r.id }));
				changes.options = changes.data;
				changes.selected =
					changes.data.find(
						({ value }) => value === metrica.selected?.value
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
				? r.label.toLowerCase().includes(metrica.buscar.toLowerCase())
				: true
		);
		setMetrica((o) => ({ ...o, options, buscado: o.buscar }));
	}, [metrica]);
	//#endregion


	//#region Localidades Params
	const [metricaParams, setMetricaParams] = useState({
		metricaId: metrica.selected?.value,
		filtro: "",
		select: null,
		sortBy: "+nombre"
	});
	// Change
	useEffect(() => {
		if (metrica.loading) return;
		const metricaId = metrica.selected?.value;
		if (metricaId === metricaParams.metricaId) return;
		setMetricaParams((o) => ({ ...o, metricaId }));
	}, [metrica]);
	//#endregion

	//#region Localidades Tabla y acciones
	const {
		render: metricaRender,
		request: localidadesRequest,
		selected: localidadesSelected,
	} = useMetrica({
		onEditComplete: ({ edit, response, request }) => {
			const params = { ...metricaParams };
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
			setMetricaParams(params);
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
	const [seccionalLocalidad, setSeccionalMetrica] = useState({
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
				setSeccionalMetrica((o) => ({ ...o, ...changes })),
		});
	}, [seccionalLocalidad, pushQuery]);



	

	//Carga de lista según parametros
	useEffect(() => {
		const { metricaId, filtro, select, ...params } = metricaParams;
		const payload = {
			params,
			pagination: { size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		};
		if (metricaId != null) params.metricaId = metricaId;
		if (filtro) params.filterByCPNombre = filtro;
		if (select) {
			payload.onLoadSelect = () => {
				setMetricaParams((o) => ({ ...o, select: null }));
				return select;
			};
		}
		localidadesRequest("list", payload);
	}, [localidadesRequest, metricaParams]);
	//#endregion

	//#region Tab Localidades
	

	tabs.push({
		header: () => <Tab label="Metrica" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<InputMaterial
						label="Filtro por ID. / Nº Afiliado"
						value={metricaParams.filtro}
						onChange={(filtro) => {
							setMetricaParams((o) => ({ ...o, filtro }));
						}}
					/>
					
				</Grid>
				{metricaRender()}
				
			</Grid>
		),

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
				<h1>Metrica</h1>
			</Grid>
			<Grid col className="tabs">
				<text>{localidadesSelected?.nombre ?? <>&nbsp;</>}</text>
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</Grid>

			<div className="contenido">
				{tabs[tab].body()}
			</div>
			<KeyPress items={acciones} />
		</Grid>
	);
};

export default MetricaHandler;
