import React from "react";
import Table from "components/ui/Table/Table";
import FormatearFecha from "components/helpers/FormatearFecha";
 
const UsuariosTable = ({
	columns: columnsInit = [],
	...x
} = {}) => {

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};

	//#region declaracion de columnas
	const columns = [
		
		{
			dataField: "id",
			text: "Id",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "100px" }),
			style: {...cs, textAlign: "center" },
			hidden: true
		},
		{
			dataField: "cuit",
			text: "CUIT/CUIL",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "10%" }),
			style: {...cs, textAlign: "rcenteright" },
		},

		{
			dataField: "userName",
			text: "Usuario",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "10%" }),
			style: {...cs, textAlign: "right" },
		},
		

		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			headerStyle: (_colum, _colIndex) => ({ width: "20%" }),
			style: {...cs, textAlign: "left" },
		},

		{
			dataField: "email",
			text: "Email",
			headerStyle: (_colum, _colIndex) => ({ width: "15%" }),
			style: {...cs, textAlign: "left" },
		},

		{
			dataField: "emailConfirmed",
			text: "Email Confirmado",
			headerStyle: (_colum, _colIndex) => ({ width: "10%" }),
			style: {...cs, textAlign: "center" },
			formatter: (value, row) => 
				 value ? 'Si' : 'No'
		},

		{
			dataField: "phoneNumber",
			text: "Teléfono",
			headerStyle: (_colum, _colIndex) => ({ width: "10%" }),
			style: {...cs, textAlign: "center" },
		},
		
		
		{
			headerTitle: (column, colIndex) => `Fecha Baja`,
			dataField: "deletedDate",
			text: "Fecha Baja",
			sort: true,
			formatter:FormatearFecha,
			headerStyle: (colum, colIndex) => {
			  return { width: "7rem", textAlign: "center" };
			},
		},
		...columnsInit
	];
	//#endregion

	return (
		<Table
			keyField="id"
			columns={columns}
			{...x}
		/>
	);
};

export default UsuariosTable;