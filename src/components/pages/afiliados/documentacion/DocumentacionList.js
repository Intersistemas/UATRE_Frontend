import React, { useEffect, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Table from "../../../ui/Table/Table";

const DocumentacionList = ({ config }) => {
	const data = config.data ? [...config.data] : [];
	const onSelect = config.onSelect ?? ((registro) => {});
	const noData = config.noData ?? <h4>No hay informacion para mostrar</h4>

	const { sendRequest: request } = useHttp();

	//#region declaracion y carga de lista de tipos de documentacion
	const [tipoList, setTipoList] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "Comunes",
				endpoint: `/RefTipoDocumentacion/GetAll`,
				method: "GET",
			},
			async (res) => setTipoList({ data: res }),
			async (err) => setTipoList({ error: err })
		);
	}, [request]);
	//#endregion

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "refTipoDocumentacionId",
			text: "Tipo documentacion",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "100px" }),
			formatter: (v) => tipoList.data?.find(r => r.id === v).descripcion ?? "",
			style: { ...cs },
		},
		{
			dataField: "archivoNombre",
			text: "Nombre del archivo",
			sort: true,
			headerStyle: (colum, colIndex) => ({ width: "100px" }),
			style: { ...cs },
		},
	];

	return (
		<Table
			keyField="id"
			loading={config.loading}
			data={data}
			columns={columns}
			noDataIndication={noData}
			onSelected={onSelect}
		/>
	);
};

export default DocumentacionList;
