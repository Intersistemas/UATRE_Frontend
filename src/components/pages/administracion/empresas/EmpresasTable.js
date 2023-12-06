import Table from "components/ui/Table/Table";
import React from "react";
import Formato from "components/helpers/Formato";
import FormatearFecha from "components/helpers/FormatearFecha";

const SeccionalesTable = ({
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
			dataField: "cuit",
			text: "CUIT",
			sort: true,
			formatter: Formato.Cuit,
      		headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			style: {...cs}
		},
		{
			dataField: "razonSocial",
			text: "Razon Social",
			sort: true,
			style: {...cs, textAlign: "left"}
		},
		{
			dataField: "actividadPrincipalDescripcion",
			text: "Actividad Principal",
			style: {...cs, textAlign: "left"}
		},
		{
			dataField: "domicilioCalle",
			text: "Domicilio",
			style: {...cs, textAlign: "left"}
		},
		{
			dataField: "telefono",
			headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
			text: "Teléfono",
			style: {...cs, textAlign: "left"}
		},

		{
			dataField: "deletedDate",
			text: "Fecha Baja",
			formatter: FormatearFecha,
			hidden: false,
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

export default SeccionalesTable;