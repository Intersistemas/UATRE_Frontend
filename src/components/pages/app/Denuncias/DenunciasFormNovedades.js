import React, {
	useMemo,
	useState,
	useEffect,
	useCallback,
	useRef,
} from "react";
import dayjs from "dayjs";
import Grid from "components/ui/Grid/Grid";
import SearchSelectMaterial, {
	mapOptions,
} from "components/ui/Select/SearchSelectMaterial";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import Button from "components/ui/Button/Button";
import Table from "components/ui/Table/Table";
import Formato from "components/helpers/Formato";

const DenunciasFormNovedades = ({
	mode,
	estadosList,
	docsByEstadoId,
	documentacionList,
	setDocumentacionList,
	selectedEstado,
	setSelectedEstado,
	overrideDocsPorNuevoEstado,
	setOverrideDocsPorNuevoEstado,
	loadDocumentacion,
	loadDocumentacionCacheOnly,
	sendRequest,
}) => {
	// 🔹 Cache de usuarios y estados (solo para Novedades)
	const [usuariosCache, setUsuariosCache] = useState({});
	const usuariosPending = useRef(new Set());

	const [estadoDetailsCache, setEstadoDetailsCache] = useState({});
	const estadosPending = useRef(new Set());

	const fetchUsuarioById = useCallback(
		(id) => {
			if (!id) return;
			if (usuariosPending.current.has(id)) return;
			usuariosPending.current.add(id);
			sendRequest(
				{
					baseURL: "Seguridad",
					endpoint: `/Usuario/GetAll?id=${encodeURIComponent(id)}`,
					method: "GET",
					errorType: "response",
				},
				(ok) => {
					try {
						console.debug("[fetchUsuarioById] ok response for", id, ok);
						let first = null;
						if (Array.isArray(ok) && ok.length) first = ok[0];
						else if (ok && Array.isArray(ok.data) && ok.data.length)
							first = ok.data[0];
						else if (ok && Array.isArray(ok.items) && ok.items.length)
							first = ok.items[0];
						else if (
							ok &&
							typeof ok === "object" &&
							(ok.nombre || ok.Nombre || ok.userName || ok.user)
						)
							first = ok;
						const nombre = first
							? first.nombre ??
							  first.Nombre ??
							  first.userName ??
							  first.user ??
							  String(id)
							: String(id);
						setUsuariosCache((prev) => ({ ...prev, [id]: nombre }));
					} finally {
						usuariosPending.current.delete(id);
					}
				},
				() => {
					setUsuariosCache((prev) => ({ ...prev, [id]: String(id) }));
					usuariosPending.current.delete(id);
				}
			);
		},
		[sendRequest]
	);

	const fetchEstadoById = useCallback(
		(id) => {
			if (!id) return;
			if (estadosPending.current.has(id)) return;
			estadosPending.current.add(id);
			sendRequest(
				{
					baseURL: "App",
					endpoint: `/DenunciasEstados/${encodeURIComponent(id)}`,
					method: "GET",
					errorType: "response",
				},
				(ok) => {
					try {
						let data = null;
						if (ok && !Array.isArray(ok) && typeof ok === "object") data = ok;
						else if (Array.isArray(ok) && ok.length) data = ok[0];
						else if (ok && Array.isArray(ok.data) && ok.data.length)
							data = ok.data[0];
						else if (ok && Array.isArray(ok.items) && ok.items.length)
							data = ok.items[0];
						const createdBy =
							data?.createdBy ??
							data?.createdById ??
							data?.creadoPor ??
							data?.createdByUser ??
							null;
						const createdDate = data?.createdDate ?? data?.fecha ?? null;
						setEstadoDetailsCache((prev) => ({
							...prev,
							[id]: { createdBy, createdDate },
						}));
					} finally {
						estadosPending.current.delete(id);
					}
				},
				() => {
					setEstadoDetailsCache((prev) => ({ ...prev, [id]: null }));
					estadosPending.current.delete(id);
				}
			);
		},
		[sendRequest]
	);

	// Dataset para la grilla de Novedades
	const novedadesRows = useMemo(() => {
		const out = [];
		(Array.isArray(estadosList) ? estadosList : []).forEach(
			(estado, eIndex) => {
				const estadoId = Number(estado?.id ?? estado?.Id ?? 0) || 0;
				const docs = docsByEstadoId[estadoId];
				if (Array.isArray(docs) && docs.length) {
					docs.forEach((doc, dIndex) => {
						out.push({
							...estado,
							_doc: doc,
							rowKey: `${estadoId}-${dIndex}`,
						});
					});
				} else {
					out.push({
						...estado,
						_doc: null,
						rowKey: `${estadoId}-0-${eIndex}`,
					});
				}
			}
		);
		return out;
	}, [estadosList, docsByEstadoId]);

	// Filtros de Novedades
	const estadoTodosOption = useMemo(
		() => ({ label: "Todos los estados" }),
		[]
	);

	const [novEstadoSelect, setNovEstadoSelect] = useState({
		buscar: "",
		data: [
			{ value: "Registrada", label: "Registrada" },
			{ value: "Completada", label: "Completada" },
			{ value: "Derivada", label: "Derivada" },
			{ value: "En Planificacion", label: "En Planificacion" },
			{ value: "Gestion con Empleador", label: "Gestion con Empleador" },
			{ value: "Inspeccionada", label: "Inspeccionada" },
			{ value: "Relevamiento App", label: "Relevamiento App" },
			{ value: "Finalizada", label: "Finalizada" },
		],
		options: [],
		selected: estadoTodosOption,
		error: null,
		loading: null,
		origen: "",
	});

	useEffect(() => {
		const options = mapOptions({
			data: novEstadoSelect.data,
			map: (r) => ({ value: r.value, label: r.label, record: r }),
			start: [estadoTodosOption],
			filter: (r) =>
				r.label
					.toLowerCase()
					.includes((novEstadoSelect.buscar || "").toLowerCase()),
		});
		setNovEstadoSelect((s) => ({ ...s, options }));
	}, [novEstadoSelect.buscar, novEstadoSelect.data, estadoTodosOption]);

	const [novFechaDesde, setNovFechaDesde] = useState(null);
	const [novFechaHasta, setNovFechaHasta] = useState(null);

	const novedadesFilteredRows = useMemo(() => {
		let rows = Array.isArray(novedadesRows) ? [...novedadesRows] : [];
		const selEstado = novEstadoSelect?.selected?.value || null;
		if (selEstado) rows = rows.filter((r) => (r?.estado ?? "") === selEstado);
		const toDayValue = (d) => {
			const m = dayjs(d);
			return m.isValid() ? m.startOf("day").valueOf() : NaN;
		};
		if (novFechaDesde) {
			const dFrom = toDayValue(novFechaDesde);
			rows = rows.filter((r) => {
				const rf = toDayValue(r?.fecha);
				return !Number.isNaN(rf) && rf >= dFrom;
			});
		}
		if (novFechaHasta) {
			const dTo = toDayValue(novFechaHasta);
			rows = rows.filter((r) => {
				const rf = toDayValue(r?.fecha);
				return !Number.isNaN(rf) && rf <= dTo;
			});
		}
		return rows;
	}, [novedadesRows, novEstadoSelect?.selected?.value, novFechaDesde, novFechaHasta]);

	const novedadesDisplayRows = useMemo(() => {
		return (Array.isArray(novedadesFilteredRows) ? novedadesFilteredRows : []).map(
			(r) => {
				const estadoId = Number(r?.id ?? r?.Id ?? 0) || 0;
				const doc = r?._doc;
				const det = estadoDetailsCache[estadoId];
				const createdBy =
					doc?.createdBy ?? r?.createdBy ?? (det ? det.createdBy : "");
				const createdDate =
					doc?.createdDate ?? r?.createdDate ?? (det ? det.createdDate : null);
				const usuarioNombre = createdBy
					? usuariosCache[createdBy] ?? createdBy
					: "";
				return { ...r, usuarioNombre, createdBy, createdDate };
			}
		);
	}, [novedadesFilteredRows, usuariosCache, estadoDetailsCache]);

	// Cargar nombres de usuarios faltantes
	useEffect(() => {
		if (!Array.isArray(novedadesFilteredRows)) return;
		const faltantes = new Set();
		novedadesFilteredRows.forEach((r) => {
			const id = r?._doc?.createdBy ?? r?.createdBy ?? "";
			if (id && !usuariosCache[id] && !usuariosPending.current.has(id)) {
				faltantes.add(id);
			}
		});
		Object.values(estadoDetailsCache).forEach((det) => {
			if (det && det.createdBy) {
				const id = det.createdBy;
				if (id && !usuariosCache[id] && !usuariosPending.current.has(id)) {
					faltantes.add(id);
				}
			}
		});
		faltantes.forEach((id) => fetchUsuarioById(id));
	}, [novedadesFilteredRows, usuariosCache, estadoDetailsCache, fetchUsuarioById]);

	// Cargar detalles de estados faltantes (cuando no hay doc asociado)
	useEffect(() => {
		if (!Array.isArray(novedadesFilteredRows)) return;
		const faltantesEstados = new Set();
		novedadesFilteredRows.forEach((r) => {
			const estadoId = Number(r?.id ?? r?.Id ?? 0) || 0;
			const doc = r?._doc;
			if (
				!doc &&
				estadoId &&
				estadoDetailsCache[estadoId] === undefined &&
				!estadosPending.current.has(estadoId)
			) {
				faltantesEstados.add(estadoId);
			}
		});
		faltantesEstados.forEach((id) => fetchEstadoById(id));
	}, [novedadesFilteredRows, estadoDetailsCache, fetchEstadoById]);

	// Row seleccionada en la tabla
	const selectedKeys = useMemo(() => {
		if (!selectedEstado) return [];
		const exists = (Array.isArray(novedadesFilteredRows)
			? novedadesFilteredRows
			: []
		).some((r) => r && r.rowKey === selectedEstado.rowKey);
		return exists ? [selectedEstado.rowKey] : [];
	}, [selectedEstado, novedadesFilteredRows]);

	// Si cambian los filtros y la row seleccionada desaparece, re-seleccionar algo coherente
	useEffect(() => {
		if (!selectedEstado) return;
		const filtered = Array.isArray(novedadesFilteredRows)
			? novedadesFilteredRows
			: [];
		const exists = filtered.some((r) => r && r.rowKey === selectedEstado.rowKey);
		if (exists) return;

		const selId = Number(selectedEstado?.id ?? selectedEstado?.Id ?? 0) || 0;
		if (selId) {
			const sameIdRow = filtered.find(
				(r) => Number(r?.id ?? r?.Id ?? 0) === selId
			);
			if (sameIdRow) {
				setSelectedEstado(sameIdRow);
				return;
			}
		}
		setSelectedEstado(filtered[0] || null);
	}, [novedadesFilteredRows, selectedEstado, setSelectedEstado]);

	// En C/M, sin filtros y sin selección, autoseleccionar el último estado
	useEffect(() => {
		if (!(mode === "C" || mode === "M")) return;
		if (mode === "M" && overrideDocsPorNuevoEstado) return;
		if (selectedEstado) return;
		const filtroActivo =
			!!(novEstadoSelect?.selected?.value) || !!novFechaDesde || !!novFechaHasta;
		if (filtroActivo) return;
		if (!novedadesRows.length || !estadosList.length) return;

		let last = null;
		try {
			last = estadosList
				.slice()
				.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
				.at(-1) || null;
		} catch {
			last = estadosList.at(-1) || null;
		}
		const lastId = Number(last?.id ?? last?.Id ?? 0);
		if (!lastId) return;
		const row = novedadesRows.find(
			(r) => Number(r?.id ?? r?.Id ?? 0) === lastId
		);
		if (!row) return;
		setSelectedEstado(row);
		// La combinación de documentación la hace el efecto de DenunciasForm
	}, [
		mode,
		selectedEstado,
		novedadesRows,
		estadosList,
		novEstadoSelect?.selected?.value,
		novFechaDesde,
		novFechaHasta,
		overrideDocsPorNuevoEstado,
		setSelectedEstado,
	]);

	return (
		<Grid full col gap="10px">
			<Grid grid="auto / 1fr 180px 180px 150px" gap="inherit">
				<SearchSelectMaterial
					label="Estado de Denuncia"
					error={!!novEstadoSelect.error}
					helperText={novEstadoSelect.loading ?? novEstadoSelect.error}
					value={novEstadoSelect.selected}
					onChange={(selected = {}) =>
						setNovEstadoSelect((o) => ({ ...o, selected, origen: "option" }))
					}
					options={novEstadoSelect.options}
					onTextChange={(buscar) =>
						setNovEstadoSelect((o) => ({ ...o, buscar, origen: "text" }))
					}
					freeSolo={false}
					inputReadOnly={true}
				/>
				<DateTimePicker
					type="date"
					label="Fecha Desde"
					value={novFechaDesde}
					onChange={setNovFechaDesde}
					format="YYYY-MM-DD"
				/>
				<DateTimePicker
					type="date"
					label="Fecha Hasta"
					value={novFechaHasta}
					onChange={setNovFechaHasta}
					format="YYYY-MM-DD"
				/>
				<Button
					className="botonAzul"
					disabled={
						!novEstadoSelect.selected?.value && !novFechaDesde && !novFechaHasta
					}
					onClick={() => {
						setNovEstadoSelect((o) => ({
							...o,
							selected: estadoTodosOption,
							buscar: "",
						}));
						setNovFechaDesde(null);
						setNovFechaHasta(null);
					}}
				>
					Limpia filtros
				</Button>
			</Grid>

			<Table
				keyField="rowKey"
				data={novedadesDisplayRows}
				mostrarBuscar={false}
				pagination={{ size: 10 }}
				noDataIndication={
					novedadesDisplayRows.length === 0
						? "No existen novedades para mostrar"
						: null
				}
				selection={{
					mode: "radio",
					clickToSelect: true,
					hideSelectColumn: true,
					selected: selectedKeys,
					onSelect: (row) => {
						setSelectedEstado(row);
						setOverrideDocsPorNuevoEstado(false);
						if (mode === "C" || mode === "M") {
							const estadoNombre = row?.estado ?? "";
							if (estadoNombre) {
								const mismos = (Array.isArray(estadosList) ? estadosList : [])
									.filter((e) => (e?.estado ?? "") === estadoNombre)
									.map((e) => Number(e?.id ?? e?.Id ?? 0))
									.filter((id) => Number.isFinite(id) && id > 0);

								mismos.forEach((id) => {
									if (!docsByEstadoId[id]) {
										loadDocumentacionCacheOnly(id);
									}
								});

								// Combinar documentación ya presente en memoria con la cacheada por estado
								let combinados = [
									...(Array.isArray(documentacionList)
										? documentacionList
										: []),
								];
								mismos.forEach((id) => {
									const docs = Array.isArray(docsByEstadoId[id])
										? docsByEstadoId[id]
										: [];
									docs.forEach((doc) => {
										const key = doc.id
											? `ID-${doc.id}`
											: `FN-${(doc.nombreArchivo || doc.fileName || "")
													.trim()}`;
										if (
											!combinados.some(
												(d) =>
													(d.id
														? `ID-${d.id}`
														: `FN-${(
																d.nombreArchivo ||
																d.fileName ||
																""
														  ).trim()}`) === key
											)
										) {
											combinados.push(doc);
										}
									});
								});
								setDocumentacionList(combinados);
								return;
							}
						}
						const entidadId = Number(row?.id ?? row?.Id ?? 0);
						if (entidadId) loadDocumentacion(entidadId);
					},
				}}
				columns={[
					{
						dataField: "fecha",
						text: "Fecha estado",
						formatter: (v) => Formato.Fecha(v),
					},
					{
						dataField: "estado",
						text: "Estado",
						sort: true,
						style: { textAlign: "left" },
					},
					{
						dataField: "observaciones",
						text: "Observaciones",
						style: { textAlign: "left" },
						formatter: (v) => {
							if (!v) return "";
							return String(v);
						},
					},
					{
						dataField: "documento",
						text: "Documento",
						isDummyField: true,
						formatter: (_c, row) => {
							const doc = row?._doc;
							if (!doc) return "";
							const tipo = doc?.refTipoDocumentacion ?? "";
							return String(tipo || "");
						},
						headerStyle: { width: "220px", textAlign: "center" },
						style: { textAlign: "left" },
					},
					{
						dataField: "createdBy",
						text: "Usuario",
						formatter: (_value, row) => row?.usuarioNombre ?? "",
						style: { textAlign: "left" },
					},
					{
						dataField: "createdDate",
						text: "Fecha creación",
						formatter: (value, row) => {
							const doc = row?._doc;
							const fecha = doc?.createdDate ?? value;
							return Formato.Fecha(fecha);
						},
						headerStyle: { width: "160px", textAlign: "center" },
						style: { textAlign: "left" },
					},
				]}
			/>
		</Grid>
	);
};

export default DenunciasFormNovedades;
