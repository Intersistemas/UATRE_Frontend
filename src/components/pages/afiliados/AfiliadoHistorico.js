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
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
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

	//#region list
	const [list, setList] = useState({
		reload: !!afiliado.guid,
		loading: null,
		pagination: { index: 1, size: 12 },
		params: { GUIDRegistro: afiliado.guid, sort: "-fechaHoraAuditoria" },
		data: [],
		error: null,
		selected: [],
	});

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
				pageNumber: list.pagination.index,
				pageSize: list.pagination.size,
				...list.params,
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
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () =>
				setList((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [list, pushQuery]);
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
