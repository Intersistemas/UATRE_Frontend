import React, { useEffect, useState } from "react";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "components/ui/Table/Table";
import Grid from "components/ui/Grid/Grid";
import Notebook from "components/ui/Notebook/Notebook";

const columns = [
	{
		dataField: "fechaHoraAuditoria",
		text: "Fecha y hora de movimiento",
		// sort: true,
		headerStyle: { width: "17em", textAlign: "center" },
		formatter: (v) => Formato.FechaHora(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "accion",
		text: "Acción",
		headerStyle: { width: "8em", textAlign: "center" },
		style: { textAlign: "center" },
	},
	{
		dataField: "usuario",
		text: "Usuario",
		headerStyle: { textAlign: "left" },
		style: { textAlign: "left" },
	},
];

const AfiliadoHistorico = ({ afiliado = {} }) => {
	const [afiliadoCompleto, setAfiliadoCompleto] = useState(null);
	
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetAfiliado": {
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Afiliado/GetAfiliadoByCUIL?CUIL=${afiliado.cuil}`,
						method: "GET",
					},
				};
			}
			case "GetData": {
				return {
					config: {
						baseURL: "Auditoria",
						endpoint: `/AuditoriasDatos`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region Obtener GUID del afiliado si no está disponible
	useEffect(() => {
		if (!afiliado.cuil) return;
		
		// Si ya tiene guid, usar directamente
		if (afiliado.guid) {
			setAfiliadoCompleto(afiliado);
			return;
		}
		
		// Si no tiene guid, obtener objeto completo del afiliado
		pushQuery({
			action: "GetAfiliado",
			config: {
				errorType: "response",
			},
			onOk: async (data) => {
				setAfiliadoCompleto(data);
			},
			onError: async (error) => {
				console.error("Error obteniendo afiliado:", error);
			},
		});
	}, [afiliado.cuil, afiliado.guid, pushQuery]);
	//#endregion

	//#region list
	const [list, setList] = useState({
		reload: false,
		loading: null,
		pagination: { index: 1, size: 12 },
		params: {},
		data: [],
		error: null,
		selected: [],
	});

	// Detectar cuando el afiliadoCompleto tiene GUID y cargar auditorías
	useEffect(() => {
		if (!afiliadoCompleto?.guid) return;
		
		setList((o) => ({
			...o,
			reload: true,
			pagination: { index: 1, size: 12 },
			params: { GUIDRegistro: afiliadoCompleto.guid, sort: "-fechaHoraAuditoria" },
		}));
	}, [afiliadoCompleto?.guid]);

	useEffect(() => {
		if (!list.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: [],
			error: null,
			pagination: list.pagination,
			selected: list.selected,
		};
		setList((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetData",
			params: {
				PageNumber: list.pagination.index,
				PageSize: list.pagination.size,
				GUIDRegistro: afiliadoCompleto.guid,
				sort: "-fechaHoraAuditoria",
			},
			config: {
				errorType: "response",
			},
			onOk: async ({ data, ...pagination }) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data.map((r) => ({
					...r,
					detalle: r.cambios?.split("\r\n").filter((r) => r),
				}));
				changes.pagination = pagination;
				if (changes.selected.length === 0 && changes.data.length)
					changes.selected = [changes.data[0]];
			},
			onError: async (error) => {
				changes.error = error.toString();
			},
			onFinally: async () =>
				setList((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [list, pushQuery, afiliadoCompleto?.guid]);
	//#endregion

	return (
		<Grid col height justify="between">
			<Grid width>
				<Table
					keyField="id"
					remote
					data={list.data}
					mostrarBuscar={false}
					noDataIndication={
						list.loading || list.error || "No existen datos para mostrar "
					}
					pagination={{
						...list.pagination,
						onChange: ({ index, size }) =>
							setList((o) => ({
								...o,
								reload: true,
								pagination: { index, size },
								data: [],
							})),
					}}
					selection={{
						selected: list.selected.map(({ id }) => id),
						onSelect: (row) =>
							setList((o) => ({
								...o,
								selected: [row],
							})),
					}}
					columns={columns}
				/>
			</Grid>
			<Notebook width height="16em" pagination={{ size: 10 }}>
				{list.selected[0]?.detalle}
			</Notebook>
		</Grid>
	);
};

export default AfiliadoHistorico;
