import React, { useCallback, useEffect, useState, useRef } from "react";
import dayjs from "dayjs";
import { matchIsValidTel } from "mui-tel-input";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import JoinOjects from "components/helpers/JoinObjects";
import { pick } from "components/helpers/Utils";
import useQueryQueue from "components/hooks/useQueryQueue";
import ValidarCUIT from "components/validators/ValidarCUIT";
import ValidarEmail from "components/validators/ValidarEmail";
import AfiliadoFormulariosAfiliacionTable from "./AfiliadoFormulariosAfiliacionTable";
import AfiliadoFormulariosAfiliacionIncorporacion from "./AfiliadoFormulariosAfiliacionIncorporacion";
import SolicitudAfiliacionForm from "./SolicitudAfiliacionForm";
import AfiliadosAgregar from "components/pages/afiliados/AfiliadoAgregar";
import { Modal } from "react-bootstrap";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";

const selectionDef = {
	action: "",
	request: "",
	index: null,
	record: null,
	edit: null,
	apply: [],
	errors: null,
};

export const onLoadSelectFirst = ({ data, multi, record }) => {
	const dataArray = AsArray(data);
	if (multi) {
		record = AsArray(record);
		let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
		if (retorno.length === 0) retorno = [dataArray.at(0)].filter((r) => r);
		return retorno.length ? retorno : null;
	}
	return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectSame = ({ data, multi, record }) => {
	const dataArray = AsArray(data);
	if (multi) {
		record = AsArray(record);
		let retorno = dataArray.filter((d) => record.find((r) => r.id === d.id));
		return retorno.length ? retorno : null;
	}
	return dataArray.find((r) => r.id === record?.id) ?? dataArray.at(0);
};

export const onLoadSelectKeep = ({ record }) => record;

export const onLoadSelectKeepOrFirst = ({ data, multi, record }) => record ?? onLoadSelectFirst({ data, multi, record });

export const onDataChangeDef = (data = []) => { };

const parseTelefonoAR = (raw = "") => {
	const digits = String(raw || "").replace(/\D+/g, "");
	let pais = "+54";
	let rest = digits;
	if (rest.startsWith("549")) rest = rest.slice(3);
	else if (rest.startsWith("54")) rest = rest.slice(2);
	if (rest.startsWith("9")) rest = rest.slice(1);
	const numero = rest.slice(-7);
	const area = rest.slice(0, Math.max(0, rest.length - 7)) || "";
	return { telefonoPais: pais, telefonoArea: area, telefonoNumero: numero };
};

// Modal de confirmación para rechazo
const RechazoModal = ({ row, onClose, onConfirm, loading }) => {
	const [obs, setObs] = useState(row?.deletedObs ?? "");
	return (
		<Modal centered show onHide={() => onClose()}>
			<Modal.Header closeButton>Rechazar solicitud</Modal.Header>
			<Modal.Body>
				<div style={{ marginBottom: 10 }}>
					¿Confirmás rechazar la solicitud del CUIL <b>{Formato.Cuit(row?.cuil)}</b>?
				</div>
				<InputMaterial
					id="rechazoObs"
					label="Motivo / Observaciones (opcional)"
					value={obs}
					onChange={(v) => setObs(v)}
				/>
			</Modal.Body>
			<Modal.Footer>
				<Button className="botonAzul" loading={!!loading} onClick={() => onConfirm(obs)}>
					CONFIRMAR RECHAZO
				</Button>
				<Button className="botonAmarillo" onClick={() => onClose()}>
					CANCELAR
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

const useAfiliadoFormulariosAfiliacion = ({
	remote: remoteInit = true,
	data: dataInit = [],
	loading,
	error,
	params: paramsInit = {},
	multi: multiInit = false,
	pagination: paginationInit = { index: 1, size: 15 },
	onLoadSelect: onLoadSelectInit = onLoadSelectFirst,
	onDataChange: onDataChangeInit = onDataChangeDef,
	columns,
	hideSelectColumn = true,
	mostrarBuscar = false,
} = {}) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		console.log("action_useAfiliadoFormulario", action)
		switch (action) {

			case "GetList": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/AfiliadoFormulariosAfiliacion/GetAfiliadosFAWithSpec`,
						method: "POST",
					},
				};
			}
			case "GetAfiliadoByCUIL": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado/GetAfiliadoByCUIL`,
						method: "GET",
					},
				};
			}
			case "Resuelve": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/AfiliadoFormulariosAfiliacion/ResuelveFormularioAfiliacion`,
						method: "PATCH",
					},
				};
			}
			case "Delete": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/DarDeBaja`,
						method: "PATCH",
					},
				};
			}
			case "Reactiva": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Empresas/Reactivar`,
						method: "PATCH",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion
	// Para no resincronizar la misma fila múltiples veces
	const syncedIdsRef = useRef(new Set());

	//#region declaracion y carga list y selected
	const [list, setList] = useState({
		loading: null,
		remote: remoteInit,
		loadingOverride: loading,
		params: { ...paramsInit },
		pagination: { index: 1, size: 5, ...paginationInit },
		data: [...AsArray(dataInit, true)],
		error,
		selection: {
			...selectionDef,
			multi: multiInit,
		},
		onLoadSelect:
			onLoadSelectInit === onLoadSelectFirst && multiInit
				? onLoadSelectSame
				: onLoadSelectInit,
		onDataChange: onDataChangeInit ?? onDataChangeDef,
	});
	useEffect(() => {
		if (!list.loading) return;
		const changes = { loading: null, error: null };
		if (!list.remote) {
			const data = list.data;
			const error = list.error;
			const multi = list.selection.multi;
			const record = list.selection.record;
			changes.data = data;
			changes.error = error;
			changes.selection = {
				...list.selection,
				...selectionDef,
				record: list.onLoadSelect({ data, multi, record }),
			};

			changes.selection.index = multi
				? changes.selection.record?.map((r) => changes.data.indexOf(r))
				: changes.data.indexOf(changes.selection.record);
			setList((o) => ({ ...o, ...changes }));
			return;
		}
		changes.data = [];

		pushQuery({
			action: "GetList",
			config: {
				body: {
					...list.params,
					pageIndex: list.pagination.index,
					pageSize: list.pagination.size,
				},
			},
			onOk: async ({ index, size, count, data }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				// changes.data = data;
				// Orden
				const rank = (r) => (r?.deletedDate ? 2 : (r?.afiliadoIdAsignado ? 1 : 0));
				const noHayOrdenDelUsuario = !list?.params?.orderBy; // si no clicaron ordenar
				const ordenado = noHayOrdenDelUsuario
					? [...data].sort((a, b) =>
						rank(a) - rank(b) ||
						// dentro de cada estado, más recientes primero
						dayjs(b?.fecha).valueOf() - dayjs(a?.fecha).valueOf()
					)
					: data;
				changes.data = ordenado;


				const multi = list.selection.multi;
				const record = list.selection.record;
				changes.pagination = { index, size, count };
				changes.selection = {
					...list.selection,
					...selectionDef,
					record: list.onLoadSelect({ data, multi, record }),
				};

				changes.selection.index = multi
					? changes.selection.record?.map((r) => changes.data.indexOf(r))
					: changes.data.indexOf(changes.selection.record);

				list.onDataChange(changes.data);
			},
			onError: async (error) => {
				if (error.code === 404) return;
				changes.error = error;
				changes.selection = { ...list.selection, ...selectionDef };
			},
			onFinally: async () => setList((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, list]);
	//#endregion

	const request = useCallback((type, payload = {}) => {
		switch (type) {
			case "selected": {
				return setList((o) => {
					const apply = [];
					if (payload.request !== "A") {
						apply.push(
							...AsArray(
								"record" in payload ? payload.record : o.selection.record,
								true
							)
								.map(({ id }) => id)
								.filter((r) => r)
						);
					}
					const edit = {
						...(payload.request === "A"
							? {}
							: JoinOjects(o.selection.record)),
						...JoinOjects(payload.record),
					};
					return {
						...o,
						selection: {
							...o.selection,
							request: payload.request,
							action: payload.action,
							edit,
							apply,
						},
					};
				});
			}
			case "list": {
				return setList((o) => {
					const changes = {
						loading: null,
						data:
							"data" in payload && Array.isArray(payload.data)
								? [...payload.data]
								: payload.clear
									? []
									: o.data,
						loadingOverride: payload.loading,
						error: payload.error,
						onLoadSelect:
							"onLoadSelect" in payload
								? payload.onLoadSelect
								: o.onLoadSelect,
						selection: {
							...o.selection,
							multi: "multi" in payload ? !!payload.multi : o.selection.multi,
						},
					};
					if (payload.params) {
						changes.params = {
							...pick(o.params, paramsInit),
							...payload.params
						};
					}
					if (payload.pagination)
						changes.pagination = { ...o.pagination, ...payload.pagination };
					if (payload.clear) {
						const data = changes.data;
						const multi = changes.selection.multi;
						const record = o.selection.record;
						changes.selection = {
							...changes.selection,
							...selectionDef,
							record: changes.onLoadSelect({ data, multi, record }),
						};
						changes.selection.index = multi
							? changes.selection.record?.map((r) => changes.data.indexOf(r))
							: changes.data.indexOf(changes.selection.record);
					} else {
						changes.loading = "Cargando...";
					}
					return { ...o, ...changes };
				});
			}
			default:
				return;
		}
	}, [pushQuery]);

	// Auto-sincroniza estados al cargar/refrescar la lista
	useEffect(() => {
		if (!Array.isArray(list.data) || list.data.length === 0) return;

		// Tomamos solo las pendientes, que no fueron rechazadas ni aceptadas,
		// y que aún no procesamos en este ciclo de vida.
		const pendientes = list.data.filter(
			(r) =>
				!r?.deletedDate && 
				!r?.afiliadoIdAsignado && 
				!syncedIdsRef.current.has(r.id) 
		);
		if (pendientes.length === 0) return;

		setList((o) => ({ ...o, loadingOverride: "Sincronizando estados..." }));


		const run = async () => {
			for (const row of pendientes) {
				syncedIdsRef.current.add(row.id);
				const cuilDigits = String(row?.cuil ?? "").replace(/\D/g, "");


				await new Promise((resolve) => {
					pushQuery({
						action: "GetAfiliadoByCUIL",
						params: { CUIL: cuilDigits, IncludeRelatedTables: false },
						onOk: async (afiliado) => {
							if (afiliado?.id) {
								// Existe → marcar Aceptado
								await pushQuery({
									action: "Resuelve",
									config: { body: { id: row.id, afiliadoIdAsignado: afiliado.id } },
								});
							}
						},
						// Si 404 → queda Pendiente
						onFinally: async () => resolve(),
					});
				});
			}

			setList((o) => ({
				...o,
				loadingOverride: null,
				loading: "Cargando...",
				data: o.remote ? [] : o.data,
			}));
		};

		run();
	}, [list.data, pushQuery]);




	let form = null;

	if (list.selection.request) {
		const row = list.selection.edit ?? list.selection.record ?? {};


		const handleClose = () => {
			setList((o) => ({
				...o,
				selection: {
					...o.selection,
					...selectionDef,
					index: o.selection.index,
					record:
						!o.selection.multi && o.selection.index > -1
							? o.data.at(o.selection.index)
							: o.selection.record,
				},
			}));
		};

		switch (list.selection.request) {
			// Acepta Solicitud → abrir alta prefillada con CUIL, celular y email
			case "I": {
				const cuilDigits = String(row.cuil ?? "").replace(/\D+/g, "");
				const email = row.email ?? row.correo ?? "";
				const telRaw = row.celular ?? row.telefono ?? "";
				const { telefonoPais, telefonoArea, telefonoNumero } = parseTelefonoAR(telRaw);

				// forzamos remount para que el form tome estos valores iniciales
				const prefillKey = `alta-${cuilDigits}-${telefonoPais}-${telefonoArea}-${telefonoNumero}-${email}`;

				form = (
					<AfiliadosAgregar
						key={prefillKey}
						title="Agrega Afiliado"
						//ESTO ENVIAR A ALEX
						accion="Agrega"
						data={{
							cuil: cuilDigits,
							telefonoPais,
							telefonoArea,
							telefonoNumero,
							email,
						}}
						disabled={{ cuil: true }}
						onClose={handleClose}
					/>
				);
				break;
			}


			// Consulta → ver formulario prefillado, solo lectura
			case "C": {
				const row = list.selection.edit ?? list.selection.record ?? {};
				form = (
					<SolicitudAfiliacionForm
						title={`Consulta Solicitud ${row.cuil ?? ""}`}
						data={row}
						readOnly
						hidePrint
						onClose={handleClose}
					/>
				);
				break;
			}
			// Rechazo
			case "B": {
				form = (
					<RechazoModal
						row={row}
						onClose={handleClose}
						loading={list.loadingOverride}
						onConfirm={(obs) => {
							const body = {
								id: row?.id,
								afiliadoIdAsignado: 0,
								deletedObs: obs || "",
							};
							pushQuery({
								action: "Resuelve",
								config: { body },
								onOk: async () => {
									// dispara recarga de lista manteniendo filtros/paginación
									setList((o) => ({ ...o, loading: "Cargando...", data: o.remote ? [] : o.data }));
									handleClose();
								},
								onError: async (error) => {
									console.error("Error al rechazar:", error);
								},
							});
						}}
					/>
				);
				break;
			}




			default: {
				form = (
					<SolicitudAfiliacionForm
						onClose={(confirm) => {
							if (!confirm) handleClose();
						}}
					/>
				);
			}
		}
	}





	const render = () => (
		<>
			<AfiliadoFormulariosAfiliacionTable
				remote={list.remote}
				data={list.data}
				loading={!!list.loading || !!list.loadingOverride}
				noDataIndication={
					list.loading ??
					list.loadingOverride ??
					list.error?.message ??
					"No existen datos para mostrar"
				}
				columns={columns}
				mostrarBuscar={mostrarBuscar}
				pagination={{
					...list.pagination,
					onChange: ({ index, size }) =>
						setList((o) => ({
							...o,
							loading: "Cargando...",
							pagination: { index, size },
							data: o.remote ? [] : o.data,
						})),
				}}
				selection={{
					mode: list.selection.multi ? "checkbox" : "radio",
					hideSelectColumn: hideSelectColumn,
					selected: AsArray(list.selection.record, !list.selection.multi)
						.filter((r) => r)
						.map((r) => r.id),
					onSelect: (record, isSelect, rowIndex, e) => {
						if (rowIndex == null) return;
						setList((o) => {
							let index = o.data.findIndex((r) => r.id === record.id);
							if (o.selection.multi) {
								const newIndex = [];
								const newRecord = [];
								o.selection.record?.forEach((r, i) => {
									if (!isSelect && r.id === record.id) return;
									newIndex.push(o.selection.index[i]);
									newRecord.push(r);
								});
								if (isSelect && !newIndex.includes(index)) {
									newIndex.push(index);
									newRecord.push(record);
								}
								if (newIndex.length) {
									index = newIndex;
									record = newRecord;
								} else {
									index = null;
									record = null;
								}
							}
							return {
								...o,
								selection: {
									...o.selection,
									...selectionDef,
									index,
									record,
								},
							};
						});
					},
					onSelectAll: (isSelect, rows, e) => {
						if (!list.selection.multi) return;
						setList((o) => {
							let index = [];
							let record = [];
							if (isSelect) {
								o.data.forEach((r, i) => {
									record.push(r);
									index.push(i);
								});
							} else {
								index = null;
								record = null;
							}
							return {
								...o,
								selection: {
									...o.selection,
									...selectionDef,
									index,
									record,
								},
							};
						});
					},
				}}
				onTableChange={(type, newState) => {
					switch (type) {
						case "sort": {
							let { sortField, sortOrder } = newState;
							sortField = { fecha: "Fecha" }[sortField] ?? sortField;
							return setList((o) => ({
								...o,
								loading: "Cargando...",
								params: {
									...o.params,
									orderBy: `${sortField}${sortOrder === "desc" ? "Desc" : ""}`,
								},
							}));
						}
						default:
							return;
					}
				}}
			/>
			{form}
		</>
	);

	return { render, request, selected: list.selection.record };
};

export default useAfiliadoFormulariosAfiliacion;
