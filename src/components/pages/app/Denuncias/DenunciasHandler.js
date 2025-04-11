// import React, { useContext, useEffect, useState } from "react";
// import { useDispatch } from "react-redux";
// import { handleModuloSeleccionar } from "redux/actions";

// import { Tab } from "@mui/material";
// import { Tabs } from "@mui/material";
// import Formato from "components/helpers/Formato";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import KeyPress from "components/keyPress/KeyPress";
// import Grid from "components/ui/Grid/Grid";
// import InputMaterial from "components/ui/Input/InputMaterial";
// import useDenuncias, { onLoadSelectKeepOrFirst } from "./useDenuncias";
// import AuthContext from "store/authContext";

// const DenunciasHandler = () => {
// 	const dispatch = useDispatch();

// 	const { usuario } = useContext(AuthContext);

// 	const tabs = [];
// 	const [tab, setTab] = useState(0);

// 	//#region API Queries
// 	const pushQuery = useQueryQueue((action) => {
// 		switch (action) {
// 			case "GetDenuncia": {
// 				return {
// 					config: {
// 						baseURL: "App",
// 						method: "GET",
// 						endpoint: "/EncuestaRespuestas",
// 					},
// 				};
// 			}

// 		} 
// 	});
// 	//#endregion

// 	//#region select Provincia
// 	const [denuncia, setDenunciax] = useState({
// 		loading: "Cargando...",
// 		params: {},
// 		data: [],
// 		error: null,
// 		buscar: "",
// 		buscado: "",
// 		options: [],
// 		selected: null,
// 	});
// 	useEffect(() => {
// 		if (!denuncia.loading) return;
// 		const changes = {
// 			loading: null,
// 			data: [],
// 			error: null,
// 			options: [],
// 			selected: null,
// 		};
// 		pushQuery({
// 			action: "GetDenuncia",
// 			params: denuncia.params,
// 			onOk: async (data) => {
// 				if (!Array.isArray(data))
// 					return console.error("Se esperaba un arreglo.", { data });
// 				changes.data = data
// 					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
// 					.map((r) => ({ label: r.nombre, value: r.id }));
// 				changes.options = changes.data;
// 				changes.selected =
// 					changes.data.find(
// 						({ value }) => value === denuncia.selected?.value
// 					) ?? denuncia.selected;
// 			},
// 			onError: async (error) => (changes.error = error),
// 			onFinally: async () => setDenunciax((o) => ({ ...o, ...changes })),
// 		});
// 	}, [pushQuery, denuncia]);
// 	// Buscador
// 	useEffect(() => {
// 		if (denuncia.loading) return;
// 		if (denuncia.buscar === denuncia.buscado) return;
// 		const options = denuncia.data.filter((r) =>
// 			denuncia.buscar !== ""
// 				? r.label.toLowerCase().includes(denuncia.buscar.toLowerCase())
// 				: true
// 		);
// 		setDenunciax((o) => ({ ...o, options, buscado: o.buscar }));
// 	}, [denuncia]);
// 	//#endregion


// 	//#region Localidades Params
// 	const [afiliadoParams, setAfiliadoParams] = useState({
// 		provinciaId: denuncia.selected?.value,
// 		filtro: "",
// 		select: null,
// 		sortBy: "+nombre"
// 	});
	

// 	//#region Localidades Tabla y acciones
// 	const {
// 		render: localidadesRender,
// 		request: localidadesRequest,
// 		selected: localidadesSelected,
// 	} = useDenuncias({
// 		onEditComplete: ({ edit, response, request }) => {
// 			const params = { ...afiliadoParams };
// 			switch (request) {
// 				case "A": {
// 					params.select = response;
// 					break;
// 				}
// 				case "B": {
// 					params.select = edit;
// 					break;
// 				}
// 				case "R": {
// 					params.select = edit;
// 					params.select.deletedDate = null;
// 				}
// 			}
// 			setAfiliadoParams(params);
// 		},
// 		columns: (def) => {
// 			if (!Array.isArray(def)) return def;
// 			def.push({
// 				dataField: "deletedDate",
// 				text: "Fecha de baja",
// 				sort: false,
// 				headerStyle: { width: "150px" },
// 				formatter: Formato.Fecha,
// 				style: (v) => {
// 					const r = { textAlign: "center" };
// 					if (v) {
// 						r.background = "#ff6464cc";
// 						r.color = "#FFF";
// 					}
// 					return r;
// 				},
// 			});
// 			return def;
// 		},
// 	});




// 	const [localidadesActions, setLocalidadesActions] = useState([]);
	

// 	//Carga de lista según parametros
// 	useEffect(() => {
// 		const { provinciaId, filtro, select, ...params } = afiliadoParams;
// 		const payload = {
// 			params,
// 			pagination: { size: 15 },
// 			onLoadSelect: onLoadSelectKeepOrFirst,
// 		};
// 		if (provinciaId != null) params.provinciaId = provinciaId;
// 		if (filtro) params.filterByCPNombre = filtro;
// 		if (select) {
// 			payload.onLoadSelect = () => {
// 				setAfiliadoParams((o) => ({ ...o, select: null }));
// 				return select;
// 			};
// 		}
// 		localidadesRequest("list", payload);
// 	}, [localidadesRequest, afiliadoParams]);
// 	//#endregion

// 	//#region Tab Localidades
	

// 	tabs.push({
// 		header: () => <Tab label="Denuncias" />,
// 		body: () => (
// 			<Grid width col gap="10px">
// 				<Grid />
// 				<Grid gap="inherit">
// 					<InputMaterial
// 						label="Filtro por ID. / Nº Afiliado"
// 						value={afiliadoParams.filtro}
// 						onChange={(filtro) => {
// 							setAfiliadoParams((o) => ({ ...o, filtro }));
// 						}}
// 					/>
				
// 				</Grid>
// 				{localidadesRender()}
				
// 			</Grid>
// 		),
// 		actions: localidadesActions,
// 	});


// 	//#region modulo y acciones
// 	const acciones = tabs[tab].actions;
// 	useEffect(() => {
// 		dispatch(handleModuloSeleccionar({ nombre: "Localidades", acciones }));
// 	}, [dispatch, acciones]);
// 	//#endregion

// 	return (
// 		<Grid full col>
// 			<Grid className="titulo">
// 				<h1>DENUNCIAS</h1>
// 			</Grid>
// 			<Grid col className="tabs">
// 				<text>{localidadesSelected?.nombre ?? <>&nbsp;</>}</text>
// 				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
// 					{tabs.map((r) => r.header())}
// 				</Tabs>
// 			</Grid>

// 			<div className="contenido">
// 				{tabs[tab].body()}
// 			</div>
// 			<KeyPress items={acciones} />
// 		</Grid>
// 	);
// };

// export default DenunciasHandler;


import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";

import { Tab } from "@mui/material";
import { Tabs } from "@mui/material";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import KeyPress from "components/keyPress/KeyPress";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import useDenuncias, { onLoadSelectKeepOrFirst } from "./useDenuncias";
import AuthContext from "store/authContext";

const DenunciasHandler = () => {
	const dispatch = useDispatch();

	const { usuario } = useContext(AuthContext);

	const tabs = [];
	const [tab, setTab] = useState(0);

	//#region API Queries
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
	//#endregion

	//#region select Provincia
	const [denuncia, setDenunciax] = useState({
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
		if (!denuncia.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
			options: [],
			selected: null,
		};
		pushQuery({
			action: "GetDenuncia",
			params: denuncia.params,
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo.", { data });
				changes.data = data
					.sort((a, b) => (a.nombre > b.nombre ? 1 : -1))
					.map((r) => ({ label: r.nombre, value: r.id }));
				changes.options = changes.data;
				changes.selected =
					changes.data.find(
						({ value }) => value === denuncia.selected?.value
					) ?? denuncia.selected;
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setDenunciax((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, denuncia]);
	// Buscador
	useEffect(() => {
		if (denuncia.loading) return;
		if (denuncia.buscar === denuncia.buscado) return;
		const options = denuncia.data.filter((r) =>
			denuncia.buscar !== ""
				? r.label.toLowerCase().includes(denuncia.buscar.toLowerCase())
				: true
		);
		setDenunciax((o) => ({ ...o, options, buscado: o.buscar }));
	}, [denuncia]);
	//#endregion


	//#region Localidades Params
	const [denunciaParams, setDenunciaParams] = useState({
		provinciaId: denuncia.selected?.value,
		filtro: "",
		select: null,
		sortBy: "+nombre"
	});
	

	//#region Localidades Tabla y acciones
	const {
		render: denunciaRender,
		request: denunciaRequest,
		selected: denunciasSelected,
	} = useDenuncias({
		onEditComplete: ({ edit, response, request }) => {
			const params = { ...denunciaParams };
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
			setDenunciaParams(params);
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




	const [denunciasActions, setDenunciasActions] = useState([]);
	

	//Carga de lista según parametros
	useEffect(() => {
		const { provinciaId, filtro, select, ...params } = denunciaParams;
		const payload = {
			params,
			pagination: { size: 15 },
			onLoadSelect: onLoadSelectKeepOrFirst,
		};
		if (provinciaId != null) params.provinciaId = provinciaId;
		if (filtro) params.filterByCPNombre = filtro;
		if (select) {
			payload.onLoadSelect = () => {
				setDenunciaParams((o) => ({ ...o, select: null }));
				return select;
			};
		}
		denunciaRequest("list", payload);
	}, [denunciaRequest, denunciaParams]);
	//#endregion

	//#region Tab Localidades
	

	tabs.push({
		header: () => <Tab label="Denuncias" />,
		body: () => (
			<Grid width col gap="10px">
				<Grid />
				<Grid gap="inherit">
					<InputMaterial
						label="Filtro por ID. / Nº Afiliado"
						value={denunciaParams.filtro}
						onChange={(filtro) => {
							setDenunciaParams((o) => ({ ...o, filtro }));
						}}
					/>
				
				</Grid>
				{denunciaRender()}
				
			</Grid>
		),
		actions: denunciasActions,
	});


	//#region modulo y acciones
	const acciones = tabs[tab].actions;
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "Localidades", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid full col>
			<Grid className="titulo">
				<h1>DENUNCIAS</h1>
			</Grid>
			<Grid col className="tabs">
				{/* <text>{denunciasSelected?.nombre ?? <>&nbsp;</>}</text> */}
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

export default DenunciasHandler;
