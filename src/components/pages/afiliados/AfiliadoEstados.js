import React, { useEffect, useState } from "react";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "components/ui/Table/Table";

const columns = [
	{
		dataField: "createdDate",
		text: "Movimiento fecha y hora",
		sort: true,
		headerStyle: { width: "15em", textAlign: "center" },
		formatter: (v) => Formato.FechaHora(v),
		style: { textAlign: "center" },
	},
	{
		dataField: "estadoSolicitudDescripcion",
		text: "Situación del Afiliado",
		sort: true,
		headerStyle: { textAlign: "center" },
		style: (v) => {
			const style = { textAlign: "left" };
			switch (v) {
				case "Pendiente": {
					style.background = "#ffff64cc";
					break;
				}
				case "No Activo": {
					style.background = "#ff6464cc";
					style.color = "#FFF";
					break;
				}
				case "Rechazado": {
					style.background = "#f08c32cc";
					style.color = "#FFF";
					break;
				}
				default:
					break;
			}
			return style;
		},
	},
];

const AfiliadoEstados = ({ afiliado = {} }) => {
	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetData": {
				const { afiliadoId, ...others } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/AfiliadoEstadoSolicitud/${afiliadoId}`,
						method: "GET",
					},
					params: others,
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region list
	const [list, setList] = useState({
		reload: true,
		loading: null,
		pagination: { index: 1, size: 12 },
		params: { afiliadoId: afiliado.id, sort: "-createdDate" },
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!list.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando...",
			data: [],
			error: null,
		};
		setList((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetData",
			params: list.params,
			config: {
				errorType: "response",
			},
			onOk: async (data) => {
				if (!Array.isArray(data))
					return console.error("Se esperaba un arreglo", data);
				changes.data = data;
			},
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () =>
				setList((o) => ({ ...o, ...changes, loading: null })),
		});
	}, [list, pushQuery]);
	//#endregion

	return (
		<Table
			keyField="id"
			data={list.data}
			noDataIndication={
				list.loading || list.error || "No existen datos para mostrar "
			}
			pagination={list.pagination}
			columns={columns}
		/>
	);
};

export default AfiliadoEstados;
