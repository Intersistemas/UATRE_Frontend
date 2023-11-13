import React from "react";
import Table from "components/ui/Table/Table";
import Formato from "components/helpers/Formato";

const EstablecimientosTable = ({ columns = [], ...x }) => {
	return (
		<Table
			remote
			keyField="id"
			columns={[
				{
					dataField: "nroSucursal",
					text: "Nro.",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "80px" }),
					formatter: Formato.Entero,
				},
				{
					dataField: "nombre",
					text: "Nombre",
					sort: true,
					style: { textAlign: "left" },
				},
				{
					dataField: "localidadDescripcion",
					text: "Localidad",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
					style: { textAlign: "left" },
				},
				{
					dataField: "provinciaDescripcion",
					text: "Provincia",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
					style: { textAlign: "left" },
				},
				{
					dataField: "deletedDate",
					text: "Fecha de baja",
					sort: true,
					headerStyle: (_colum, _colIndex) => ({ width: "150px" }),
					formatter: (value) => {
						const style = {};
						value = Formato.Fecha(value);
						if (value) {
							style.background = "#ff6464cc";
							style.color = "#FFF";
						}
						return <div style={style}>{value}</div>;
					},
					style: { textAlign: "center" },
				},
				...columns,
			]}
			{...x}
		/>
	);
};

export default EstablecimientosTable;
