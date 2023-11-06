import React from "react";
import Table from "components/ui/Table/Table";
import Formato from "components/helpers/Formato";

const ColaboradoresTable = ({ ...x }) => {
	return (
		<Table
			remote
			keyField="id"
			mostrarBuscar={false}
			columns={[
				{
					dataField: "afiliadoId",
					text: "Afiliado",
					headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
				},
				{
					dataField: "esAuxiliar",
					text: "Es Auxiliar",
					headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
					formatter: Formato.Booleano,
				},
			]}
			{...x}
		/>
	);
};

export default ColaboradoresTable;
