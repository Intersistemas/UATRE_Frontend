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
					headerStyle: { width: "80px" },
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
					headerStyle: { width: "25%" },
					style: { textAlign: "left" },
				},
				{
					dataField: "provinciaDescripcion",
					text: "Provincia",
					sort: true,
					headerStyle: { width: "25%" },
					style: { textAlign: "left" },
				},
				{
					dataField: "deletedDate",
					text: "Fecha de baja",
					sort: true,
					headerStyle: { width: "150px" },
					formatter: Formato.Fecha,
					style: (v) => {
						const r = { textAlign: "center" };
						if (v) {
							r.background = "#ff6464cc";
							r.color = "#FFF";
						}
						return r;
					},
				},
				...columns,
			]}
			{...x}
		/>
	);
};

export default EstablecimientosTable;
