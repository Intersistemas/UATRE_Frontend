import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import { Tabs, Tab } from "@mui/material";
import Grid from "components/ui/Grid/Grid";
import Action from "components/helpers/Action";
import useDocumentaciones from "components/Documentacion/useDocumentaciones";
import useAutoridades from "components/pages/administracion/seccionales/autoridades/useAutoridades";
import KeyPress from "components/keyPress/KeyPress";
import useSeccionales from "../administracion/seccionales/useSeccionales";
import Formato from "components/helpers/Formato";
import useQueryQueue from "components/hooks/useQueryQueue";
import Table from "components/ui/Table/Table";


const columns = [
	{
		dataField: "codigo",
		text: "Código",
		headerTitle: () => `Codigo Seccional`,
		headerStyle: { width: "6rem" },
	},
	{
		dataField: "descripcion",
		text: "Nombre",
		headerTitle: () => `Nombre Seccional`,
	},
	{
		dataField: "seccionalEstadoDescripcion",
		text: "Estado",
		headerStyle: { width: "5rem" },
		formatter: (value, row) =>
			row.deletedDate ? `Baja - (${Formato.Fecha(row.deletedDate)})` : value,
	},
	{
		dataField: "domicilio",
		text: "Dirección",
	},
	
	{
		dataField: "id",
		text: "id",
		headerStyle: { width: "4rem" },
		hidden: true,
	},
	{
		dataField: "localidadNombre",
		text: "Localidad",
		headerTitle: () => `Localidad Seccional`,
	},
	{
		dataField: "observaciones",
		text: "Observaciones",
		formatter: (value, row) => (
			value?.replace(/\*/g, " ")
		  ),
		
	},
	{
		dataField: "deletedDate",
		text: "deletedDate",
		hidden: true,
	},
	{
		dataField: "refDelegacionDescripcion",
		text: "Delegación",
	},
]

const AfiliadosSeccionales = ({ afiliado = {}, onSeleccionRegistro}) => {
    //#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetData": {
				const { id, ...others } = params;
				return {
					config: {
						baseURL: "Afiliaciones",
						endpoint: `/Seccional/${id}`,
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
		params: { id: afiliado.seccionalId},
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
				console.log("AfiliadoSeccionales_data",data)
				changes.data = [data];
			},
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () =>
				(console.log("change",changes),
				setList((o) => ({ ...o, ...changes, loading: null })),
				onSeleccionRegistro(changes.data[0])
				)
		});
	}, [list, pushQuery]);
	//#endregion

	const selectRow = {
		selected: [1],
	  };

	return (
		<Table
			keyField="id"

			noDataIndication={
				list.loading || list.error || "No existen datos para mostrar**"
			}
			data={list.data}
			pagination={list.pagination}
			columns={columns}
		/>
	);
};
export default AfiliadosSeccionales