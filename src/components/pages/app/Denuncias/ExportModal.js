import React, { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { Modal } from "react-bootstrap";
import useQueryQueue from "components/hooks/useQueryQueue";
import AuthContext from "store/authContext";
import useTareasUsuario from "components/hooks/useTareasUsuario";
import useAmbitos from "components/hooks/useAmbitos";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import Table from "components/ui/Table/Table";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import SearchSelectMaterial, {
	includeSearch,
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import Formato from "components/helpers/Formato";
import FormatearFecha from "components/helpers/FormatearFecha";
import UseKeyPress from "components/helpers/UseKeyPress";
import dayjs from "dayjs";

const onCloseDef = () => {};

// Columnas base para la tabla de denuncias con filtro de novedades
const baseColumns = [
	{
			dataField: "fecha",
			text: "Fecha de carga",
			sort: true,
			headerTitle: () => "Fecha de la denuncia",
			headerStyle: { width: "7em", textAlign: "center" },
			formatter: (v) => FormatearFecha(v),
			csvFormat: (v) => FormatearFecha(v),
			style: { textAlign: "center" },
		},
		{
			dataField: "fechaIngreso",
			text: "Fecha de ingreso",
			sort: false,
			headerTitle: true,
			headerStyle: { width: "7em", textAlign: "center" },
			formatter: (v) => (v ? FormatearFecha(v) : ""),
			csvFormat: (v) => (v ? FormatearFecha(v) : ""),
			style: { textAlign: "center" },
		},
	{
		dataField: "nombre",
		text: "Denunciante",
		sort: true,
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "telefono",
		text: "Teléfono",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "provincia",
		text: "Provincia",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "localidad",
		text: "Localidad",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "seccional",
		text: "Seccional",
		headerTitle: true,
		headerStyle: { width: "9em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "estado",
		text: "Estado",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "fechaUltimaNovedad",
		text: "Fecha Ultima Novedad",
		headerTitle: true,
		headerStyle: { width: "9em", textAlign: "center" },
		formatter: (v) => v ? FormatearFecha(v) : "Sin fecha",
		csvFormat: (v) => v ? FormatearFecha(v) : "Sin fecha",
		style: { textAlign: "center" },
	},
	{
		dataField: "ultimaNovedad",
		text: "Ultima Novedad",
		headerTitle: true,
		headerStyle: { width: "12em", textAlign: "center" },
		csvFormat: (v) => v || "Sin novedad",
		style: { textAlign: "left" },
		formatter: (v) => (
			<div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
				{v || "Sin novedad"}
			</div>
		),
	},
	{
		dataField: "empleadorNombre",
		text: "Empresa",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "empleadorCUIT",
		text: "CUIT",
		headerTitle: true,
		headerStyle: { width: "8em", textAlign: "center" },
		formatter: (v) => v ? Formato.Cuit(v) : "",
		csvFormat: (v) => v,
		style: { textAlign: "center" },
	},
	{
		dataField: "derivadoDelegacion",
		text: "Derivado a Delegación",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
	{
		dataField: "derivadoSeccional",
		text: "Derivado a Seccional",
		headerTitle: true,
		headerStyle: { width: "10em", textAlign: "center" },
		csvFormat: (v) => v,
		style: { textAlign: "left" },
	},
];

//#region estadosSelectOptions
const estadosSelectTodos = { value: "", label: "Todos los estados" };
const estadosSelectOptions = ({ data = [], buscar = "", ...x }) =>
	mapOptions({
		data,
		map: (r) => ({ value: r.value, label: r.label }),
		filter: (r) => includeSearch(r, buscar),
		start: [estadosSelectTodos],
		...x,
	});
//#endregion estadosSelectOptions

const ExportModal = ({ 
	onClose = onCloseDef, 
	currentFilters = {}, 
	usuarioAmbito = null,
	applyAmbitoFilter = null,
	initialData = null,
}) => {
	const { usuario } = useContext(AuthContext);
	const tareasManager = useTareasUsuario();
	const ambitosManager = useAmbitos();
	const ambitoInfoGlobal = useMemo(() => ambitosManager.ambitoUser(), [ambitosManager]);

	// Determina si el usuario puede ver todos los datos (incluye Nro. Denuncia y Denunciante completo)
	const puedeVerTodosLosDatos = useMemo(() => {
		try {
			const esAdministrador = usuario?.roles?.includes("Administrador") || false;
				const ambitoName = ambitoInfoGlobal?.tipo || usuario?.ambito || null;
			if (esAdministrador || ambitoName === "Todos") return true;
			return tareasManager.hasTarea("Denuncias_Datos");
		} catch (error) {
			console.error("Error verificando permiso Denuncias_Datos en ExportModal:", error);
			return false;
		}
	}, [usuario, ambitoInfoGlobal, tareasManager]);

	// Columnas dinámicas en función del permiso para ver todos los datos
	const columns = useMemo(() => {
		const idColumn = {
			dataField: "id",
			text: "Nro. Denuncia",
			headerTitle: true,
			headerStyle: { width: "6em", textAlign: "center" },
			csvFormat: (v) => v,
			style: { textAlign: "center" },
		};

		const numeroSeguimientoColumn = {
			dataField: "numeroSeguimiento",
			text: "numeroSeguimiento",
			headerTitle: true,
			headerStyle: { width: "8em", textAlign: "center" },
			csvFormat: (v) => v,
			style: { textAlign: "center" },
		};

		if (puedeVerTodosLosDatos) {
			return [idColumn, numeroSeguimientoColumn, ...baseColumns];
		}

		// Columnas reducidas: fecha, telefono, localidad, estado
		return baseColumns.filter((c) => ["fecha", "telefono", "localidad", "estado"].includes(c.dataField));
	}, [puedeVerTodosLosDatos]);
	
	// Verificar permisos para mostrar el modal de exportación
	const tienePermisoExportar = useMemo(() => {
		if (!usuario || !tareasManager) {
			return false;
		}
		
		try {
			const esAdministrador = usuario?.roles?.includes("Administrador") || false;
				const ambitoName = ambitoInfoGlobal?.tipo || usuario?.ambito || null;
			const tieneTareaExcel = tareasManager.hasTarea("Excel_Denuncias");
			// Administrador o ambito 'Todos' pueden exportar sin la tarea; otros necesitan la tarea
			return esAdministrador || ambitoName === "Todos" || tieneTareaExcel;
		} catch (error) {
			console.error("Error verificando permisos en ExportModal:", error);
			return false;
		}
	}, [usuario, tareasManager, ambitoInfoGlobal]);

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetDenuncias": {
				return {
					config: {
						baseURL: "App",
						endpoint: `/AppDenuncias`,
						method: "GET",
					},
				};
			}
			case "GetDenunciasEstados": {
				return {
					config: {
						baseURL: "App",
						endpoint: `/DenunciasEstados`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region filtro estados
	const [estadoSelect, setEstadoSelect] = useState({
		loading: null,
		buscar: "",
		data: [],
		error: null,
		options: [],
		selected: estadosSelectTodos,
	});

	useEffect(() => {
		if (estadoSelect.data.length > 0) {
			const options = estadosSelectOptions({
				data: estadoSelect.data,
				buscar: estadoSelect.buscar,
			});
			setEstadoSelect((s) => ({
				...s,
				options,
			}));
		}
	}, [estadoSelect.buscar, estadoSelect.data]);

	//#endregion filtro estados

	//#region filtro fechas
	const [fechaDesde, setFechaDesde] = useState(null);
	const [fechaHasta, setFechaHasta] = useState(null);

	// Función para aplicar filtro por fechas (similar al patrón del archivo principal)
	const aplicarFiltroFechas = useCallback((data) => {
		if (!fechaDesde && !fechaHasta) {
			return data;
		}

		return data.filter(denuncia => {
			if (!denuncia.fecha) return false;

			const fechaDenuncia = dayjs(denuncia.fecha);
			let cumpleFiltro = true;

			if (fechaDesde) {
				const fechaDesdeFormatted = dayjs(fechaDesde);
				cumpleFiltro = cumpleFiltro && fechaDenuncia.isAfter(fechaDesdeFormatted.subtract(1, 'day'));
			}

			if (fechaHasta) {
				const fechaHastaFormatted = dayjs(fechaHasta);
				cumpleFiltro = cumpleFiltro && fechaDenuncia.isBefore(fechaHastaFormatted.add(1, 'day'));
			}

			return cumpleFiltro;
		});
	}, [fechaDesde, fechaHasta]);
	//#endregion filtro fechas

	//#region estados de denuncias
	const [estadosDenuncias, setEstadosDenuncias] = useState({
		loading: false,
		data: [],
		error: null,
		loaded: false
	});

	// Cargar todos los estados de denuncias una vez
	const cargarEstadosDenuncias = useCallback(() => {
		if (estadosDenuncias.loaded || estadosDenuncias.loading) return;

		setEstadosDenuncias(prev => ({ ...prev, loading: true, error: null }));
		
		pushQuery({
			action: "GetDenunciasEstados",
			params: {},
			onOk: (data) => {
				if (Array.isArray(data)) {
					setEstadosDenuncias({
						loading: false,
						data: data,
						error: null,
						loaded: true
					});
				} else {
					console.error("Se esperaba un arreglo de estados", data);
					setEstadosDenuncias(prev => ({ 
						...prev, 
						loading: false, 
						error: "Formato de datos incorrecto",
						loaded: true
					}));
				}
			},
			onError: (error) => {
				console.error("Error cargando estados de denuncias:", error);
				setEstadosDenuncias(prev => ({ 
					...prev, 
					loading: false, 
					error: error.toString(),
					loaded: true
				}));
			}
		});
	}, [pushQuery, estadosDenuncias.loaded, estadosDenuncias.loading]);

	// Cargar estados de denuncias al montar el componente
	useEffect(() => {
		cargarEstadosDenuncias();
	}, [cargarEstadosDenuncias]);

	// Actualizar opciones de estado cuando se cargan los estados de denuncias
	useEffect(() => {
		if (estadosDenuncias.loaded && estadosDenuncias.data.length > 0) {
			// Extraer estados únicos de los datos cargados
			const estadosUnicos = [...new Set(estadosDenuncias.data.map(item => item.estado))]
				.filter(estado => estado)
				.map(estado => ({ value: estado, label: estado }))
				.sort((a, b) => a.label.localeCompare(b.label));

			setEstadoSelect(prev => ({
				...prev,
				data: estadosUnicos
			}));
		}
	}, [estadosDenuncias.loaded, estadosDenuncias.data]);


	//#endregion

	//#region list denuncias
	const [list, setList] = useState({
		reload: initialData ? false : true,
		loading: null,
		pagination: { index: 1, size: 100 }, // Cargar más registros del servidor
		sort: "+fecha",
		params: { ...currentFilters },
		data: initialData || [],
		selected: [],
		error: null,
	});

	useEffect(() => {
		if (!list.reload) return;
		
		// Esperar a que se carguen los estados de denuncias antes de cargar las denuncias
		if (!estadosDenuncias.loaded) {
			return;
		}
		
		const changes = {
			reload: false,
			loading: "Cargando denuncias...",
			data: [],
			error: null,
		};
		setList((o) => ({ ...o, ...changes }));

		let params = {
			...list.params,
			sortBy: list.sort,
			pageIndex: list.pagination.index,
			pageSize: list.pagination.size,
		};

		// Nota: El filtro por estado se aplica en el cliente después de obtener los datos

		pushQuery({
			action: "GetDenuncias",
			params: params,
			onOk: async (response) => {
				try {
					// Normalizar respuesta
					let data = [];
					let pagination = {};
					
					if (response && typeof response === "object") {
						data = response.data || [];
						pagination = {
							index: response.index || 1,
							size: response.size || 10,
							count: response.count || 0,
							pages: response.pages || 1,
						};
					} else if (Array.isArray(response)) {
						data = response;
						pagination = { index: 1, size: data.length, count: data.length, pages: 1 };
					}

					if (!Array.isArray(data)) {
						console.error("Se esperaba un arreglo", response);
						data = [];
					}

					// Aplicar filtro por ámbito si corresponde
					if (usuarioAmbito && applyAmbitoFilter) {
						try {
							data = await applyAmbitoFilter(data, usuarioAmbito, pushQuery);
						} catch (error) {
							console.warn("Error aplicando filtro de ámbito:", error);
						}
					}

					// Enriquecer datos con el estado, fecha y observaciones de cada denuncia
					if (estadosDenuncias.data.length > 0) {
						data = data.map(denuncia => {
							// Buscar todos los estados de esta denuncia
							const estadosDeDenuncia = estadosDenuncias.data.filter(
								estado => estado.appDenunciasId === denuncia.id
							);
							
							let estadoActual = "Sin estado";
							let fechaUltimaNovedad = null;
							let ultimaNovedad = "Sin novedad";
							
							if (estadosDeDenuncia.length > 0) {
								// Ordenar por fecha (más reciente primero) y tomar el primero
								const ultimoEstado = estadosDeDenuncia.sort((a, b) => 
									new Date(b.fecha || b.fechaAsociada) - new Date(a.fecha || a.fechaAsociada)
								)[0];
								
								estadoActual = ultimoEstado.estado || "Sin estado";
								fechaUltimaNovedad = ultimoEstado.fecha || ultimoEstado.fechaAsociada;
								ultimaNovedad = ultimoEstado.observaciones || "Sin observaciones";
							}
							
							return {
								...denuncia,
								estado: estadoActual,
								fechaUltimaNovedad: fechaUltimaNovedad,
								ultimaNovedad: ultimaNovedad
							};
						});
					}

					// Aplicar filtro por estado si está seleccionado (cadena vacía = todos)
					if (estadoSelect.selected && estadoSelect.selected.value && estadoSelect.selected.value !== "") {
						data = data.filter(denuncia => denuncia.estado === estadoSelect.selected.value);
					}

					// Aplicar filtro por fechas
					data = aplicarFiltroFechas(data);

					// Aplicar ordenamiento por fecha (más reciente primero)
					data = data.sort((a, b) => {
						const fechaA = new Date(a.fecha);
						const fechaB = new Date(b.fecha);
						return fechaB - fechaA; // Orden descendente (más reciente primero)
						});

					changes.data = data;
					changes.pagination = pagination;
				} catch (error) {
					console.error("Error procesando respuesta:", error);
					changes.error = error.toString();
				}
			},
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () =>
				setList((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [list, pushQuery, usuarioAmbito, applyAmbitoFilter, estadoSelect.selected, estadosDenuncias.data, estadosDenuncias.loaded, aplicarFiltroFechas]);

	// Enriquecer denuncias existentes cuando se cargan los estados por primera vez
	useEffect(() => {
		if (estadosDenuncias.loaded && estadosDenuncias.data.length > 0 && list.data.length > 0) {
			// Verificar si las denuncias ya tienen todos los datos de estados
			const denunciasSinDatos = list.data.filter(d => 
				!d.estado || d.estado === "" || d.estado === "Sin estado" ||
				!d.fechaUltimaNovedad || !d.ultimaNovedad
			);
			
			if (denunciasSinDatos.length > 0) {
				// Enriquecer datos existentes con estados, fecha y observaciones
				const datosEnriquecidos = list.data.map(denuncia => {
					if (denuncia.estado && denuncia.estado !== "" && denuncia.estado !== "Sin estado" 
						&& denuncia.fechaUltimaNovedad && denuncia.ultimaNovedad) {
						// Ya tiene todos los datos, no cambiar
						return denuncia;
					}
					
					// Buscar todos los estados de esta denuncia
					const estadosDeDenuncia = estadosDenuncias.data.filter(
						estado => estado.appDenunciasId === denuncia.id
					);
					
					let estadoActual = "Sin estado";
					let fechaUltimaNovedad = null;
					let ultimaNovedad = "Sin novedad";
					
					if (estadosDeDenuncia.length > 0) {
						// Ordenar por fecha (más reciente primero) y tomar el primero
						const ultimoEstado = estadosDeDenuncia.sort((a, b) => 
							new Date(b.fecha || b.fechaAsociada) - new Date(a.fecha || a.fechaAsociada)
						)[0];
						
						estadoActual = ultimoEstado.estado || "Sin estado";
						fechaUltimaNovedad = ultimoEstado.fecha || ultimoEstado.fechaAsociada;
						ultimaNovedad = ultimoEstado.observaciones || "Sin observaciones";
					}
					
					return {
						...denuncia,
						estado: estadoActual,
						fechaUltimaNovedad: fechaUltimaNovedad,
						ultimaNovedad: ultimaNovedad
					};
				});
				
				// Aplicar filtro por estado si está seleccionado
				let datosFiltrados = datosEnriquecidos;
				if (estadoSelect.selected && estadoSelect.selected.value && estadoSelect.selected.value !== "") {
					datosFiltrados = datosEnriquecidos.filter(denuncia => denuncia.estado === estadoSelect.selected.value);
				}

				// Aplicar filtro por fechas
				datosFiltrados = aplicarFiltroFechas(datosFiltrados);

				// Aplicar ordenamiento por fecha (más reciente primero)
				datosFiltrados = datosFiltrados.sort((a, b) => {
					const fechaA = new Date(a.fecha);
					const fechaB = new Date(b.fecha);
					return fechaB - fechaA; // Orden descendente (más reciente primero)
				});
				
				setList(prev => ({ ...prev, data: datosFiltrados }));
			}
		}
	}, [estadosDenuncias.loaded, estadosDenuncias.data, list.data, estadoSelect.selected, aplicarFiltroFechas]);

	// Si recibimos `initialData`, aplicar filtros (estado y fechas) y enriquecer con estados
	useEffect(() => {
		if (!initialData) return;

		let data = Array.isArray(initialData) ? [...initialData] : [];

		try {
			// Enriquecer con estados si ya están cargados
			if (estadosDenuncias.data && estadosDenuncias.data.length > 0) {
				data = data.map(denuncia => {
					const estadosDeDenuncia = estadosDenuncias.data.filter(
						estado => estado.appDenunciasId === denuncia.id
					);
					let estadoActual = "Sin estado";
					let fechaUltimaNovedad = null;
					let ultimaNovedad = "Sin novedad";
					if (estadosDeDenuncia.length > 0) {
						const ultimoEstado = estadosDeDenuncia.sort((a, b) =>
							new Date(b.fecha || b.fechaAsociada) - new Date(a.fecha || a.fechaAsociada)
						)[0];
						estadoActual = ultimoEstado.estado || "Sin estado";
						fechaUltimaNovedad = ultimoEstado.fecha || ultimoEstado.fechaAsociada;
						ultimaNovedad = ultimoEstado.observaciones || "Sin observaciones";
					}
					return {
						...denuncia,
						estado: estadoActual,
						fechaUltimaNovedad,
						ultimaNovedad
					};
				});
			}

			// Aplicar filtro por estado si está seleccionado
			if (estadoSelect.selected && estadoSelect.selected.value && estadoSelect.selected.value !== "") {
				data = data.filter(denuncia => denuncia.estado === estadoSelect.selected.value);
			}

			// Aplicar filtro por fechas
			data = aplicarFiltroFechas(data);

			// Ordenar por fecha descendente
			data = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

			setList(prev => ({ ...prev, data, selected: [] }));
		} catch (error) {
			console.error("Error aplicando filtros/enriquecimiento a initialData:", error);
		}
	}, [initialData, estadoSelect.selected, fechaDesde, fechaHasta, estadosDenuncias.loaded, estadosDenuncias.data, aplicarFiltroFechas]);
	//#endregion

	//#region nueva seleccion
	const [newSelection, setNewSelection] = useState({
		reload: false,
		loading: null,
		params: {},
		error: null,
	});

	useEffect(() => {
		if (!newSelection.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando bloque 1...",
			error: null,
		};
		
		let params = {
			...newSelection.params,
			pageIndex: 1,
			pageSize: 1000, // Obtener muchos registros por bloque
		};

		// Aplicar filtro por estado si está seleccionado
		if (estadoSelect.selected && estadoSelect.selected.value) {
			params.estado = estadoSelect.selected.value;
		}

		const query = {
			action: "GetDenuncias",
			params: params,
		};

		query.onOk = async (response) => {
			try {
				let data = [];
				let currentIndex = 1;
				let totalPages = 1;
				
				if (response && typeof response === "object") {
					data = response.data || [];
					currentIndex = response.index || 1;
					totalPages = response.pages || 1;
				} else if (Array.isArray(response)) {
					data = response;
				}

				if (Array.isArray(data)) {
					// Aplicar filtro por ámbito si corresponde
					if (usuarioAmbito && applyAmbitoFilter) {
						try {
							data = await applyAmbitoFilter(data, usuarioAmbito, pushQuery);
						} catch (error) {
							console.warn("Error aplicando filtro de ámbito:", error);
						}
					}

					setList((o) => ({
						...o,
						selected: [...o.selected, ...data].filter(
							(v, i, a) => a.findIndex(r => r.id === v.id) === i
						),
					}));
				} else {
					console.error("Se esperaba un arreglo", response);
				}

				if (currentIndex < totalPages) {
					changes.loading = `Cargando bloque ${currentIndex + 1} de ${totalPages}...`;
					query.params = {
						...newSelection.params,
						pageIndex: currentIndex + 1,
						pageSize: 1000,
					};
					pushQuery({ ...query });
				} else {
					changes.loading = null;
				}
			} catch (error) {
				console.error("Error en selección masiva:", error);
				changes.loading = null;
				changes.error = error.toString();
			}
		};

		query.onError = async (error) => {
			changes.loading = null;
			changes.error = error.toString();
		};

		query.onFinally = async () =>
			setNewSelection((o) => ({ ...o, ...changes }));

		setNewSelection((o) => ({ ...o, ...changes }));
		pushQuery(query);
	}, [newSelection, pushQuery, usuarioAmbito, applyAmbitoFilter, estadoSelect.selected]);
	//#endregion nueva seleccion

	// Estado para el progreso de carga de novedades
	const [loadingNovedades, setLoadingNovedades] = useState(false);

	// Función para exportar con últimas novedades
	const onExport = () => {
		if (list.selected.length === 0) {
			alert("Debe seleccionar al menos un registro para exportar.");
			return;
		}

		if (estadosDenuncias.loading) {
			alert("Espere a que se carguen los estados de las denuncias...");
			return;
		}

		if (estadosDenuncias.error) {
			alert(`Error cargando estados: ${estadosDenuncias.error}. ¿Desea continuar sin las novedades?`);
		}

		setLoadingNovedades(`Procesando ${list.selected.length} denuncias...`);

		try {
			// Preparar datos para exportar usando los datos ya enriquecidos de la tabla
			const exportData = list.selected.map((denuncia) => {
				const fechaUltimaNovedadFormatted = denuncia.fechaUltimaNovedad ? FormatearFecha(denuncia.fechaUltimaNovedad) : "Sin fecha";

				const item = {};

				if (puedeVerTodosLosDatos) {
					// Incluir Nro. Denuncia en primer lugar si corresponde
					item["Nro. Denuncia"] = denuncia.id;
				}

				// Incluir numeroSeguimiento inmediatamente después de Nro. Denuncia
				item["numeroSeguimiento"] = denuncia.numeroSeguimiento;

				// Fecha de carga
				item["Fecha de carga"] = denuncia.fecha ? FormatearFecha(denuncia.fecha) : "";

				// Nueva columna: Fecha de ingreso (viene en la API como fechaIngreso)
				item["Fecha de ingreso"] = denuncia.fechaIngreso ? FormatearFecha(denuncia.fechaIngreso) : "";

				// Resto de columnas
				item["Denunciante"] = denuncia.nombre || "";
				item["Correo"] = denuncia.correo || "";
				item["Teléfono"] = denuncia.telefono || denuncia.telefonoContacto || "";
				item["Provincia"] = denuncia.provincia || "";
				item["Localidad"] = denuncia.localidad || "";
				// Seccional (campo exacto en la BD: seccional)
				item["Seccional"] = denuncia.seccional;
				item["Estado"] = denuncia.estado || "Sin estado";
				item["Fecha Ultima Novedad"] = fechaUltimaNovedadFormatted;
				item["Ultima Novedad"] = denuncia.ultimaNovedad || "Sin novedad";
				item["Empresa"] = denuncia.empleadorNombre || "";
				item["CUIT"] = denuncia.empleadorCUIT ? Formato.Cuit(denuncia.empleadorCUIT) : "";
				item["Ubicación"] = denuncia.ubicacion || "";
				item["Detalle de la Denuncia"] = denuncia.texto || "";
				item["Derivado A Tipo"] = denuncia.derivadoATipo || "";
				item["Derivado a Delegación"] = denuncia.derivadoDelegacion;
				item["Derivado a Seccional"] = denuncia.derivadoSeccional;

				return item;
			});
			
			// Cerrar modal y proceder con la exportación
			onClose(exportData, estadoSelect.selected);
		} catch (error) {
			console.error("Error procesando datos:", error);
			alert("Error al procesar los datos para exportación.");
		} finally {
			setLoadingNovedades(false);
		}
	};

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onExport(), "AltKey");

	// Si no hay usuario o contexto aún, mostrar loading
	if (!usuario) {
		return (
			<Modal size="xl" centered show>
				<Modal.Header className={modalCss.modalCabecera} closeButton onClick={onClose}>
					Exportar Denuncias
				</Modal.Header>
				<Modal.Body>
					<div style={{ textAlign: "center", padding: "20px" }}>
						Cargando permisos...
					</div>
				</Modal.Body>
			</Modal>
		);
	}

	// Si no tiene permisos, mostrar mensaje
	if (!tienePermisoExportar) {
		return (
			<Modal size="xl" centered show>
				<Modal.Header className={modalCss.modalCabecera} closeButton onClick={onClose}>
					Acceso Denegado
				</Modal.Header>
				<Modal.Body>
					<div style={{ textAlign: "center", padding: "20px", color: "red" }}>
						No tiene permisos para exportar denuncias.
						<br />
						Necesita ser Administrador o tener la tarea "Excel_Denuncias".
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button className="botonAmarillo" onClick={() => onClose()}>
						CERRAR
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera} closeButton onClick={onClose}>
				Exportar Denuncias con Última Novedad
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width gap="inherit">
						<SearchSelectMaterial
							id="estadoSelect"
							label="Filtro por Estado"
							error={!!estadoSelect.error}
							helperText={
								estadoSelect.loading ?? estadoSelect?.error
							}
							value={estadoSelect.selected}
							onChange={(selected) => {
								setEstadoSelect((o) => ({ ...o, selected }));
								// Si recibimos initialData, aplicamos filtros en cliente sin recargar
								if (initialData) {
									setList((o) => ({ ...o, data: initialData, selected: [] , pagination: { ...o.pagination, index: 1 } }));
								} else {
									setList((o) => ({
										...o,
										reload: true,
										data: [],
										selected: [],
										pagination: { ...o.pagination, index: 1 },
									}));
								}
							}}
							options={estadoSelect.options}
							onTextChange={(buscar) =>
								setEstadoSelect((o) => ({ ...o, buscar }))
							}
						/>
					</Grid>

					{/* Filtros de fecha */}
					<Grid width gap="10px">
						<DateTimePicker
							type="date"
							label="Fecha Desde"
							value={fechaDesde}
							onChange={(value) => {
								setFechaDesde(value);
								// Recargar la lista cuando cambie la fecha (si no usamos initialData)
								if (initialData) {
									setList(prev => ({ ...prev, data: initialData, selected: [] }));
								} else {
									setList(prev => ({ ...prev, reload: true, data: [], selected: [] }));
								}
							}}
							format="YYYY-MM-DD"
						/>

						<DateTimePicker
							type="date"
							label="Fecha Hasta"
							value={fechaHasta}
							onChange={(value) => {
								setFechaHasta(value);
								// Recargar la lista cuando cambie la fecha (si no usamos initialData)
								if (initialData) {
									setList(prev => ({ ...prev, data: initialData, selected: [] }));
								} else {
									setList(prev => ({ ...prev, reload: true, data: [], selected: [] }));
								}
							}}
							format="YYYY-MM-DD"
						/>

						<Button
							className="botonAzul"
							disabled={!fechaDesde && !fechaHasta}
							onClick={() => {
								setFechaDesde(null);
								setFechaHasta(null);
								// Recargar la lista al limpiar filtros
								if (initialData) {
									setList(prev => ({ ...prev, data: initialData, selected: [] }));
								} else {
									setList(prev => ({ ...prev, reload: true, data: [], selected: [] }));
								}
							}}
						>
							Limpiar Fechas
						</Button>
					</Grid>
					
					<Table
						keyField="id"
						data={list.data}
						mostrarBuscar={false}
						baseProps={{
							style: { textAlign: "center", overflowX: "scroll" },
						}}
						defaultSorted={[
							{
								dataField: "fecha",
								order: "desc"
							}
						]}
						pagination={{
							page: 1,
							sizePerPage: 10,
							totalSize: list.data.length,
							showTotal: true,
							sizePerPageList: [
								{ text: '10', value: 10 },
								{ text: '25', value: 25 },
								{ text: '50', value: 50 },
								{ text: '100', value: 100 }
							]
						}}
						noDataIndication={
							list.loading || list.error || "No existen datos para mostrar"
						}
						selection={{
							mode: "checkbox",
							hideSelectColumn: false,
							selected: list.selected.map((r) => r.id),
							onSelect: (row, isSelect) => {
								if (!isSelect === !list.selected.find((r) => r.id === row.id))
									return;
								setList((o) => {
									const selected = o.selected.filter((r) => r.id !== row.id);
									if (isSelect) selected.push(row);
									return { ...o, selected };
								});
							},
							onSelectAll: (isSelect, rows) =>
								setList((o) => {
									const selected = o.selected.filter(
										(s) => !rows.find((r) => r.id === s.id)
									);
									if (isSelect) selected.push(...rows);
									return { ...o, selected };
								}),
						}}
						columns={columns}

					/>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid width col gap="5px">
					<Grid width gap="20px">
						<Grid width="200px">
							<Button
								className="botonAmarillo"
								onClick={() => {
								if (initialData && Array.isArray(initialData) && initialData.length > 0) {
									// Si nos pasaron initialData, seleccionar todo desde la data actualmente filtrada
									setList((o) => ({ ...o, selected: [...o.data] }));
									return;
								}
								let params = {
									...list.params,
									sortBy: list.sort
								};
						
								// Aplicar filtro por estado si está seleccionado
								if (estadoSelect.selected && estadoSelect.selected.value) {
									params.estado = estadoSelect.selected.value;
								}
						
								setNewSelection((o) => ({
									...o,
									params: params,
									reload: true,
								}));
								}}
							>
								SELECCIONA TODO
							</Button>
						</Grid>
						<Grid width="200px">
							<Button
								className="botonAmarillo"
								disabled={list.selected.length === 0}
								onClick={() => setList((o) => ({ ...o, selected: [] }))}
							>
								LIMPIA SELECCION
							</Button>
						</Grid>
						<Grid col grow>
							<Grid justify="center">
								Denuncias seleccionadas: {list.selected.length}
								{estadoSelect.selected?.value && (
									<span style={{ fontSize: "0.9em", color: "#666", marginLeft: "10px" }}>
										(Estado: {estadoSelect.selected.label})
									</span>
								)}
							</Grid>
							{(newSelection.loading || newSelection.error || loadingNovedades || estadosDenuncias.loading || estadosDenuncias.error) && (
								<Grid justify="center" style={{ fontSize: "0.9em", marginTop: "5px" }}>
									{newSelection.loading && (
										<span style={{ color: "green" }}>{newSelection.loading}</span>
									)}
									{newSelection.error && (
										<span style={{ color: "red" }}>Error: {newSelection.error}</span>
									)}
									{loadingNovedades && (
										<span style={{ color: "blue" }}>{loadingNovedades}</span>
									)}
									{estadosDenuncias.loading && (
										<span style={{ color: "orange" }}>Cargando estados...</span>
									)}
									{estadosDenuncias.error && (
										<span style={{ color: "red" }}>Error estados: {estadosDenuncias.error}</span>
									)}
								</Grid>
							)}
						</Grid>
						<Grid width="150px">
							<Button
								className="botonAmarillo"
								disabled={list.selected.length === 0 || loadingNovedades}
								onClick={() => onExport()}
							>
								{loadingNovedades ? "PROCESANDO..." : "EXPORTAR"}
							</Button>
						</Grid>
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={() => onClose()}>
								CANCELAR
							</Button>
						</Grid>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default ExportModal;