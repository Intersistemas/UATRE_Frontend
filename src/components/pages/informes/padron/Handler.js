
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import Formato from "components/helpers/Formato";
import useQueryState from "components/hooks/useQueryState";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial, { includeSearch, mapOptions } from "components/ui/Select/SearchSelectMaterial";
import Table from "components/ui/Table/Table";
import PDFViewer from "./PDFViewer";
import AuthContext from "store/authContext";
import AsArray from "components/helpers/AsArray";
import useAmbitosUsuario from "components/hooks/useAmbitos";
import { useSelector } from "react-redux";

/** Types */
const columns = [
  { dataField: "nroAfiliado", text: "Nro. Afil.", sort: true, headerTitle: () => "Numero de Afiliado", headerStyle: { width: "6em", textAlign: "center" }, style: { textAlign: "center" } },
  { dataField: "cuil", text: "CUIL", sort: true, headerTitle: true, headerStyle: { width: "8em", textAlign: "center" }, formatter: (v, row) => (row.cuilValidado != 0 ? Formato.Cuit(row.cuilValidado) : Formato.Cuit(v)), style: { textAlign: "center" } },
  { dataField: "cuilValidado", text: "Val.", headerTitle: true, headerStyle: { width: "3em", textAlign: "center" }, formatter: (v, { cuil }) => (v === 0 ? "N" : v === cuil ? "V" : "D"), style: { textAlign: "center" } },
  { dataField: "documento", text: "Doc. Nro.", sort: true, headerTitle: () => "Documento número", headerStyle: { width: "7em", textAlign: "center" }, formatter: (v) => Formato.DNI(v), style: { textAlign: "center" } },
  { dataField: "nombre", text: "Nombre", sort: true, headerTitle: true, headerStyle: { width: "10em", textAlign: "center" }, style: { textAlign: "left" } },
  {
    dataField: "estadoSolicitud",
    text: "Sit. Afi.",
    headerTitle: () => "Situación del Afiliado",
    headerStyle: { width: "6em", textAlign: "center" },
    style: (v) => {
      const s = { textAlign: "center" };
      if (v === "Pendiente") s.background = "#ffff64cc";
      if (v === "No Activo") { s.background = "#ff6464cc"; s.color = "#FFF"; }
      if (v === "Rechazado") { s.background = "#f08c32cc"; s.color = "#FFF"; }
      return s;
    },
  },
  { dataField: "seccional", text: "Seccional", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" } },
  { dataField: "refDelegacionDescripcion", text: "Delegación", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" } },
  { dataField: "provincia", text: "Provincia", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" } },
  { dataField: "fechaIngreso", text: "F. Ingreso", sort: true, headerTitle: () => "Fecha de Ingreso", headerStyle: { width: "7em", textAlign: "center" }, formatter: (v) => Formato.Fecha(v), style: { textAlign: "center" } },
  { dataField: "puesto", text: "Puesto", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
//   { dataField: "empresaCUIT", text: "CUIT", headerTitle: true, headerStyle: { width: "8em", textAlign: "center" }, formatter: (v) => Formato.Cuit(v), style: { textAlign: "center" } },
//   { dataField: "empresaDescripcion", text: "Empresa", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
  { dataField: "actividad", text: "Actividad", headerTitle: true, headerStyle: { width: "10em", textAlign: "center" } },
  { dataField: "ultimaDDJJPeriodo", text: "Período última DDJJ", headerTitle: true, headerStyle: { width: "12em", textAlign: "center" }, formatter: (v) => Formato.Periodo(v) },
];

// --- options helpers
const delegacionSelectDef = { label: "Elige..." };
const seccionalSelectDef = { label: "Todas" };

const delegacionesSelectOptions = ({ data = [], ...x }) =>
  mapOptions({
    data,
    map: (r) => ({ value: r.id, label: [r.codigoDelegacion, r.nombre].join(" - "), record: r }),
    start: data.length === 1 ? [] : [delegacionSelectDef],
    ...x,
  });

const seccionalesSelectOptions = ({ data = [], ambitoUsuario = {}, ...x }) => {
  const tipo = ambitoUsuario?.tipo ?? ambitoUsuario?.ambitoUsuario?.tipo;
  return mapOptions({
    data,
    map: (r) => {
      if (tipo === "Todos") return { value: r.id, label: [r.codigo, r.descripcion].join(" - "), record: r };
      return ["NORMALIZADA", "TRANSITORIA", "SIN COMISION"].includes(r.seccionalEstadoDescripcion)
        ? { value: r.id, label: [r.codigo, r.descripcion].join(" - "), record: r }
        : null;
    },
    start: data.length === 1 ? [] : [seccionalSelectDef],
    ...x,
  });
};

// --- normalizadores (defensivos)
const normalizeDelegOption = (opt) => {
  if (!opt) return delegacionSelectDef;
  if (opt.value != null) return opt;
  if (opt.id != null) return { value: opt.id, label: [opt.codigoDelegacion || opt.codigo, opt.nombre].filter(Boolean).join(" - "), record: opt };
  if (opt.record?.id != null) return { value: opt.record.id, label: opt.label ?? [opt.record.codigoDelegacion || opt.record.codigo, opt.record.nombre || opt.record.descripcion].filter(Boolean).join(" - "), record: opt.record };
  return delegacionSelectDef;
};
const normalizeSeccionalOption = (opt) => {
  if (!opt) return seccionalSelectDef;
  if (opt.value != null) return opt;
  if (opt.id != null) return { value: opt.id, label: [opt.codigo, opt.descripcion].filter(Boolean).join(" - "), record: opt };
  if (opt.record?.id != null) return { value: opt.record.id, label: opt.label ?? [opt.record.codigo, opt.record.descripcion].filter(Boolean).join(" - "), record: opt.record };
  return seccionalSelectDef;
};

const normalizeFiltros = (f) => {
  const g = { ...f };
  if (g?.ambitoTodos?.ids && g.ambitoTodos.ids.length === 1 && Number(g.ambitoTodos.ids[0]) === 0) delete g.ambitoTodos;
  return g;
};

const Handler = ({ onClose = () => {} }) => {
	const ambitoUsuario = useAmbitosUsuario().ambitoUser();
	//console.log("ambitoUser_handler",ambitoUser)
	const usuarioLogueado = useSelector((state) => state.usuarioLogueado);
	const usuarioConSeccionalInactiva = usuarioLogueado.ambitosDescripciones[0]?.seccionalEstado && !["NORMALIZADA", "TRANSITORIA", "SIN COMISION"].includes(usuarioLogueado.ambitosDescripciones[0]?.seccionalEstado);
	
	//#region APIs
	const { setState: setDelegacionesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/RefDelegacion/GetAll`,
				method: "GET",
			},
		}),
		{
			query: {
				config: { errorType: "response" },
				params: { soloActivos: true },
			},
		}
	);
	const { setState: setSeccionalesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional/GetSeccionalesSpecs`,
				method: "POST",
			},
		}),
		{
			query: { config: { errorType: "response" }, body: { soloActivos: true } },
		}
	);
	const { setState: setSeccionalQuery } = useQueryState(
		(_, { id, ...params }) => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Seccional/${id}`,
				method: "GET",
			},
			params,
		}),
		{
			query: { config: { errorType: "response" } },
		}
	);
	const { setState: setAfiliacionesQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Afiliaciones",
				endpoint: `/Afiliado/GetAfiliadosWithSpec`,
				method: "POST",
			},
		}),
		{ query: { config: { errorType: "response" } } }
	);
	//#endregion APIs

	const { usuario } = useContext(AuthContext);
	const [init, setInit] = useState({
		pending: true,
		filtros: {
			ambitoTodos: usuario.ambitoTodos,  //Se agrega ya que SIEMPRE debo enviar TODOS los ambitos que tiene habilitados y deshabilitados el USUARIO
            ambitoProvincias: usuario.ambitoProvincias, //Se agrega ya que SIEMPRE debo enviar TODOS los ambitos que tiene habilitados y deshabilitados el USUARIO
		}, 
		wait: { delegaciones: true, seccionales: true },
		usuario,
	});

	//#region selects
	const [filtros, setFiltros] = useState({ ...init.filtros });

	//#region select delegacion
	const [delegacionSelect, setDelegacionSelect] = useState({
		reload: false,
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: delegacionSelectDef,
		selectedDef: delegacionSelectDef,
		/** @type array */
		ambito: null,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setDelegacionSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) =>
				includeSearch(r, delegacionSelect.buscar)
			),
		}));
	}, [delegacionSelect.buscar, delegacionSelect.optionsSrc]);
	//#endregion select delegacion

	//#region select seccional
	const [seccionalSelect, setSeccionalSelect] = useState({
		reload: false,
		loading: "Cargando...",
		buscar: "",
		data: [],
		error: null,
		optionsSrc: [],
		options: [],
		selected: seccionalSelectDef,
		selectedDef: seccionalSelectDef,
		/** @type array */
		ambito: null,
		refDelegacionId: 0,
		origen: "",
	});
	// Buscador
	useEffect(() => {
		setSeccionalSelect((o) => ({
			...o,
			options: o.optionsSrc.filter((r) =>
				includeSearch(r, seccionalSelect.buscar)
			),
		}));
	}, [seccionalSelect.buscar, seccionalSelect.optionsSrc]);
	//#endregion select seccional

	//#endregion selects

	//#region list
	const [list, setList] = useState({
		reload: false,
		loading: null,
		pagination: { index: 1, size: 10 },
		filtros: {},
		sort: "seccionalId,nombre",
		data: [],
		error: null,
	});
	//#endregion list

	//#region Carga inicial select delegacion
	useEffect(() => {
		if (!delegacionSelect.reload) return;
		setDelegacionSelect((o) => ({
			...o,
			reload: false,
			loading: "Cargando...",
			data: [],
			options: [],
			optionsSrc: [],
			selected: delegacionSelectDef,
			selectedDef: delegacionSelectDef,
			buscar: "",
		}));
		setDelegacionesQuery((o) => ({
			...o,
			onLoad: ({ ok, error }) => {
				let data = [];
				if (Array.isArray(ok)) data = ok;
				setDelegacionSelect((o) => {
					const n = {
						...o,
						loading: null,
						data: o.ambito ? data.filter((r) => o.ambito.includes(r.id)) : data,
						error: error?.toString(),
					};
					n.optionsSrc = delegacionesSelectOptions(n);
					n.selectedDef =
						n.optionsSrc.length === 1 ? n.optionsSrc[0] : delegacionSelectDef;
					n.selected = n.selectedDef;
					return n;
				});
			},
		}));
	}, [delegacionSelect, setDelegacionesQuery]);
	//#endregion Carga inicial select delegacion

	//#region Carga inicial select seccional
	useEffect(() => {
		if (!seccionalSelect.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			error: null,
			options: [],
			optionsSrc: [],
			selected: seccionalSelectDef,
			selectedDef: seccionalSelectDef,
			buscar: "",
			ambitoUsuario: {ambitoUsuario},
		};
		const data = [];
		if (seccionalSelect.refDelegacionId) {
			setSeccionalSelect((o) => ({ ...o, ...changes }));
		} else {
			changes.loading = null;
			changes.data = data;
			setSeccionalSelect((o) => ({ ...o, ...changes }));
			return;
		}
		/** @type {onLoad} */
		const onLoad = ({ query, ok, error }) => {
			let pages = 0;
			let pageIndex = query.config.body.pageIndex;
			if (ok) {
				pages = ok.pages;
				if (Array.isArray(ok.data)) {
					data.push(...ok.data);
				} else {
					console.error("Se esperaba un arreglo", ok.data);
				}
			}
			if (error) changes.error = error.toString();
			if (pageIndex < pages) {
				pageIndex += 1;
				changes.loading = `Cargando bloque ${pageIndex} de ${pages}...`;
				setSeccionalesQuery((o) => ({
					...o,
					query: {
						...o.query,
						config: {
							...o.query.config,
							body: {
								...o.query.config.body,
								pageIndex,
							},
						},
					},
					onLoad,
				}));
			} else {
				changes.loading = null;
				const ambito = seccionalSelect.ambito;
				changes.data = ambito
					? data.filter((r) => ambito.includes(r.id))
					: data;
					console.log("ambitoUsuario")
				changes.optionsSrc = seccionalesSelectOptions(changes, ambitoUsuario);
				changes.selectedDef = changes.optionsSrc.length === 1
					? changes.optionsSrc[0]
					: seccionalSelectDef;
				changes.selected = changes.selectedDef;
			}
			setSeccionalSelect((o) => ({ ...o, ...changes }));
		};
		setSeccionalesQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: {
					...o.query.config,
					body: {
						...o.query.params,
						refDelegacionId: seccionalSelect.refDelegacionId,
						pageIndex: 1,
					},
				},
			},
			onLoad,
		}));
	}, [seccionalSelect, setSeccionalesQuery]);
	//#endregion Carga inicial select seccional

	//#region Cambia select delegación
	useEffect(() => {
		if (delegacionSelect.loading) return;
		const finalizaInit = () =>
			setInit((o) => {
				if (!o.wait || !("delegaciones" in o.wait)) return o;
				const init = { ...o };
				const wait = { ...init.wait };
				delete wait.delegaciones;
				init.wait = wait;
				return init;
			});
		const selected = delegacionSelect.selected;
		setSeccionalSelect((o) => {
			const n = {
				...o,
				reload: true,
				refDelegacionId: selected === delegacionSelectDef ? 0 : selected?.value,
				selected: o.selectedDef,
			};
			if (!n.refDelegacionId) {
				setFiltros((o) => {
					const filtros = { ...o };
					delete filtros.ambitoDelegaciones;
					return filtros;
				});
			} else {
				setFiltros((o) => ({
					...o,
					ambitoDelegaciones: { ids: [selected?.value] },
				}));
			}
			finalizaInit();
			return n;
		});
	}, [delegacionSelect.loading, delegacionSelect.selected]);
	//#endregion Cambia select delegación

	//#region Cambia select seccional
	useEffect(() => {
		if (seccionalSelect.loading) return;
		const finalizaInit = () =>{
			setInit((o) => {
				if (!o.wait || !("seccionales" in o.wait)) return o;
				const init = { ...o };
				const wait = { ...init.wait };
				delete wait.seccionales;
				init.wait = wait;
				return init;
			});}
		const selected = seccionalSelect.selected;
		if (selected === seccionalSelectDef) {
			setFiltros((o) => {
				const filtros = { ...o };
				delete filtros.ambitoSeccionales;
				return filtros;
			});
			finalizaInit();
			return;
		}
		setFiltros((o) => ({
			...o,
			ambitoSeccionales: { ids: [selected?.value] },
		}));
		finalizaInit();
	}, [seccionalSelect.loading, seccionalSelect.selected]);
	//#endregion Cambia select seccional

	//#region Carga list
	useEffect(() => {
		if (!list.reload) return;
		setAfiliacionesQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: {
					body: {
						...list.filtros,
						// estadoSolicitudId: 2,
						sort: list.sort,
						pageIndex: list.pagination.index,
						pageSize: list.pagination.size,
					},
				},
			},
			onPreLoad: () =>
				setList((o) => ({
					...o,
					reload: false,
					loading: "Cargando...",
					data: [],
				})),
			onLoad: ({ ok, error }) => {
				let data = [];
				let pagination = { ...list.pagination, count: data.length };
				if (Array.isArray(ok?.data)) {
					//({ data, ...pagination } = ok);
					console.log("usuarioConSeccionalInactiva", usuarioConSeccionalInactiva);
					 //fix para corregir el tema del ambito de un usuario que corresponde a una secciona NO ACTIVA
						({ data, ...pagination } = !usuarioConSeccionalInactiva ?  ok : {data:[], pagination:{}}); //fix para corregir el tema del ambito de un usuario que corresponde a una secciona NO ACTIVA
					} else {
					console.error("Se esperaba un arreglo", ok?.data);
				}
				setList((o) => ({
					...o,
					loading: null,
					pagination,
					data,
					error: error?.toString(),
				}));
			},
		}));
	}, [setAfiliacionesQuery, list]);
	//#endregion Carga list

	//#region padron
	const [padron, setPadron] = useState({
		reload: null,
		loading: null,
		filtros: {},
		/** @type {SeccionalAfiliados[]} */


		//Aqui se guarda todos los datos de los afiliados
		data: [],
		error: null,
		seccionales: [],

		//Al momento de que se me carga mi data, se setea a true (padron.despliega = true)
		//y se despliega el pdf
		despliega: false,
	});
	//#endregion padron

	//#region Carga padron
	useEffect(() => {
		if (!padron.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			/** @type {SeccionalAfiliados[]} */
			data: [],
			error: null,
			despliega: false,
		};
		/** @type {onLoad} */
		const onLoad = ({ query, ok, error }) => {
			let pages = 0;
			let pageIndex = query.config.body.pageIndex;
			if (ok) {
				pages = ok.pages;
				const data = ok.data;
				if (Array.isArray(data)) {
					data.forEach((afiliado) => {
						const seccional = padron.seccionales.find(
							(s) => s.id === afiliado.seccionalId
						);
						if (seccional) {
							let seccionalAfiliados = changes.data.find(
								(a) => a.seccional === seccional
							);
							if (seccionalAfiliados == null) {
								seccionalAfiliados = { seccional, afiliados: [] };
								changes.data.push(seccionalAfiliados);
							}
							seccionalAfiliados.afiliados.push(afiliado);
						}
					});
				} else {
					console.error("Se esperaba un arreglo", data);
				}
			}
			if (error) changes.error = error.toString();
			if (pageIndex < pages) {
				pageIndex += 1;
				changes.loading = `Cargando bloque ${pageIndex} de ${pages}...`;
				setAfiliacionesQuery((o) => ({
					...o,
					query: {
						...o.query,
						config: {
							...o.query.config,
							body: {
								...o.query.config.body,
								pageIndex,
							},
						},
					},
					onLoad,
				}));
			} else {
				changes.loading = null;
				changes.despliega = true;
			}
			setPadron((o) => ({ ...o, ...changes }));
		};
		setAfiliacionesQuery((o) => ({
			...o,
			query: {
				...o.query,
				config: {
					...o.query.config,
					body: {
						...padron.filtros,
						estadoSolicitudId: 2,
						sort: "seccionalId,nombre",
						pageIndex: 1,
					},
				},
			},
			onPreLoad: () => setPadron((o) => ({ ...o, ...changes })),
			onLoad,
		}));
	}, [setAfiliacionesQuery, padron]);
	//#endregion Carga padron

/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
	//Se ejecuta dicha funcion cuando selecciono imprimir
	//y se encarga de validar si la delegacion fue seleccionada
	//y si no fue seleccionada, muestra un mensaje de error
	//si fue seleccionada, se carga el padron
	//y se despliega el pdf
	//si no hay error, se carga el padron
	//y se despliega el pdf

	const onCargaPadron = () => {
		if (!filtros.ambitoDelegaciones) {
			setDelegacionSelect((o) => ({ ...o, error: "Dato requerido." }));
			return;
		} else {
			setDelegacionSelect((o) => ({ ...o, error: null }));
		}
		setPadron((o) => ({
			...o,
			//Me cambia mi estado a "true" para que se cargue el padron
			reload: true,
			seccionales: seccionalSelect.data
				.map((s) => ({
					id: s.id,
					codigo: s.codigo,
					nombre: s.descripcion,
					provincia: s.provinciaDescripcion,
				}))
				.filter((s) => s?.id),
		}));
	};



	///////////////////////////////////////////////////////////
	//Cuando (padron.despliega) es true, se despliega el pdf
	///////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////

	const padronRender = !padron.despliega ? null : (
		<PDFViewer
			data={padron.data}
			onClose={() => setPadron((o) => ({ ...o, despliega: false }))}
			ambitoUser={ambitoUsuario}
		/>
	);

	const onAplicaFiltros = () => {
		if (!filtros.ambitoDelegaciones) {
			setDelegacionSelect((o) => ({
				...o,
				error: "Dato requerido.",
			}));
		} else {
			setDelegacionSelect((o) => ({ ...o, error: null }));
		}
		setList((o) => ({
			...o,
			filtros,
			reload: true,
			error: null,
			pagination: { ...o.pagination, index: 1 },
		}));
		setPadron((o) => ({
			...o,
			filtros,
			seccionales: seccionalSelect.data
				.map((s) => ({
					id: s.id,
					codigo: s.codigo,
					nombre: s.descripcion,
					provincia: s.provinciaDescripcion,
				}))
				.filter((s) => s?.id),
		}));
	};

	const onLimpiaFiltros = () => {
		const filtros = { ...init.filtros };
		setDelegacionSelect((o) => ({ ...o, selected: o.selectedDef }));
		setSeccionalSelect((o) => ({ ...o, selected: o.selectedDef }));
		setFiltros(filtros);
		if (JSON.stringify(list.filtros) === JSON.stringify(filtros)) return;
		setList((o) => ({
			...o,
			filtros,
			error: null,
			reload: true,
		}));
		setPadron((o) => ({ ...o, filtros, seccionales: [] }));
	};

	//#region activa init
	useEffect(() => {
		if (!init.pending) return;
		setInit((o) => ({ ...o, pending: false }));
		const ambito = {
			delegaciones: [...AsArray(init.usuario.ambitoDelegaciones?.ids)],
			seccionales: [...AsArray(init.usuario.ambitoSeccionales?.ids)],
		};
		const finalizaCarga = () => {
			setInit((o) => {
				const init = { ...o };
				const filtros = init.filtros;
				if (ambito.seccionales.length)
					filtros.ambitoSeccionales = { ids: [...ambito.seccionales] };
				if (ambito.delegaciones.length)
					filtros.ambitoDelegaciones = { ids: [...ambito.delegaciones] };
				return init;
			});
			if (ambito.seccionales.length)
				setSeccionalSelect((o) => ({ ...o, ambito: ambito.seccionales }));
			const delegaciones = {};
			if (ambito.delegaciones.length) delegaciones.ambito = ambito.delegaciones;
			setDelegacionSelect((o) => ({
				...o,
				reload: true,
				loading: "Cargando...",
				...delegaciones,
			}));
		};
		if (ambito.seccionales.length && !ambito.delegaciones.length) {
			const seccionales = [...ambito.seccionales].filter((r) => r);
			/** @type {onLoad} */
			const onLoad = ({ ok }) => {
				const refDelegacionId = ok?.refDelegacionId;
				if (refDelegacionId && !ambito.delegaciones.includes(refDelegacionId))
					ambito.delegaciones.push(refDelegacionId);
				let seccional = seccionales.shift();
				if (seccional) {
					setSeccionalQuery((o) => ({
						...o,
						query: {
							...o.query,
							params: { id: seccional },
						},
						onLoad,
					}));
				} else {
					finalizaCarga();
				}
			};
			onLoad({});
		} else {
			finalizaCarga();
		}
	}, [init, setSeccionalQuery]);

	useEffect(() => {
		if (init.pending) return;
		if (init.wait == null) return;
		if (Object.keys(init.wait).length) return;
		setInit((o) => ({ ...o, wait: null }));
		onLimpiaFiltros();
	}, [init, onLimpiaFiltros]);
	//#endregion activa init

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera}>
				Afiliados por seccional
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid grid="auto / 1fr 1fr 200px 200px" gap="inherit">
						<SearchSelectMaterial
							id="delegacionSelect"
							label="Delegacion"
							error={!!delegacionSelect.error}
							helperText={delegacionSelect.loading ?? delegacionSelect?.error}
							value={delegacionSelect.selected}
							onChange={(selected) =>
								setDelegacionSelect((o) => ({ ...o, selected }))
							}
							options={delegacionSelect.options}
							onTextChange={(buscar) =>
								setDelegacionSelect((o) => ({ ...o, buscar }))
							}
						/>
						<SearchSelectMaterial
							id="seccionalSelect"
							label="Seccional"
							error={!!seccionalSelect.error}
							helperText={seccionalSelect.loading ?? seccionalSelect?.error}
							value={seccionalSelect.selected}
							onChange={(selected) =>
								setSeccionalSelect((o) => ({ ...o, selected }))
							}
							options={seccionalSelect.options}
							onTextChange={(buscar) =>
								setSeccionalSelect((o) => ({ ...o, buscar }))
							}
						/>
						<Button
							className="botonAzul"
							disabled={
								JSON.stringify(list.filtros) === JSON.stringify(filtros)
							}
							onClick={() => onAplicaFiltros()}
						>
							Aplica filtros
						</Button>
						<Button
							className="botonAzul"
							disabled={
								JSON.stringify(filtros) === JSON.stringify(init.filtros)
							}
							onClick={() => onLimpiaFiltros()}
						>
							Limpia filtros
						</Button>
					</Grid>
					<Table
						remote
						keyField="id"
						data={list.data}
						mostrarBuscar={false}
						baseProps={{ style: { overflowX: "scroll" } }}
						pagination={{
							...list.pagination,
							onChange: (pagination) =>
								setList((o) => ({
									...o,
									reload: true,
									pagination: { ...o.pagination, ...pagination },
									data: [],
									error: null,
								})),
						}}
						noDataIndication={
							list.loading || list.error || "No existen datos para mostrar "
						}
						columns={columns}
						onTableChange={(type, { sortOrder, sortField }) => {
							switch (type) {
								case "sort": {
									sortField = { cuil: "CUIL" }[sortField] ?? sortField;
									const sort = `${sortField}${
										sortOrder === "desc" ? "Desc" : ""
									}`;
									setList((o) => ({
										...o,
										reload: true,
										sort,
										data: [],
										error: null,
										pagination: { ...o.pagination, count: 0 },
									}));
									return;
								}
								default:
									return;
							}
						}}
					/>
					{padronRender}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid grid="auto / 1fr 150px 150px" width col gap="15px">
					<Grid width col>
						{padron.loading == null ? null : (
							<text style={{ color: "green" }}>{padron.loading}</text>
						)}
						{padron.error == null ? null : (
							<text style={{ color: "red" }}>{padron.error}</text>
						)}
					</Grid>
					<Button
						className="botonAmarillo"
						loading={!!padron.loading}
						onClick={() => onCargaPadron()}
						tarea="Informes_Afiliados_AfiliadosSeccional_Imprime"
						disabled={list.data.length === 0}
					>
						IMPRIME
					</Button>
					<Button className="botonAmarillo" onClick={() => onClose()}>
						FINALIZA
					</Button>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default Handler;
