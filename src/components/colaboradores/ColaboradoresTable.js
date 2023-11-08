import React from "react";
import Table from "components/ui/Table/Table";
import Formato from "components/helpers/Formato";

const ColaboradoresTable = ({ columns = [], ...x }) => {
	return (
		<Table
			remote
			keyField="id"
			mostrarBuscar={false}
			columns={[
				{
					dataField: "afiliadoNombre",
					text: "Afiliado",
					headerStyle: (_colum, _colIndex) => ({
						width: "100px",
						textAlign: "left",
					}),
					style: { textAlign: "left" },
				},
				{
					dataField: "esAuxiliar",
					text: "Es Auxiliar",
					headerStyle: (_colum, _colIndex) => ({ width: "10px" }),
					formatter: Formato.Booleano,
				},
				{
					dataField: "deletedDate",
					text: "Baja",
					headerStyle: (_colum, _colIndex) => ({ width: "10px" }),
					formatter: Formato.Fecha,
					style: { color: "red" },
				},
				...columns,
			]}
			{...x}
		/>
	);
};

export default ColaboradoresTable;
