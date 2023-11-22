import React from "react";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const LiquidacionesCabeceraTable = ({
	columns: columnsInit = [],
	...x
} = {}) => {
	return (
		<Table
			keyField="id"
			columns={[
				{
					dataField: "id",
					text: "Número",
					formatter: Formato.Entero,
					sort: true,
					headerStyle: { width: "100px" },
					style: { textAlign: "right" },
				},
				{
					dataField: "periodo",
					text: "Periodo",
					formatter: Formato.Periodo,
					sort: true,
					headerStyle: { width: "100px" },
				},
				{
					dataField: "createdDate",
					text: "Fecha",
					formatter: Formato.Fecha,
					sort: true,
					headerStyle: { width: "100px" },
				},
				{
					dataField: "tipoLiquidacion",
					text: "Tipo",
					sort: true,
					formatExtraData: ["Periodo", "Acta"],
					formatter: (v, r, i, e) => e.at(v) ?? "",
					style: { textAlign: "left" },
				},
				{
					dataField: "fechaPagoEstimada",
					text: "Fecha de pago estimada",
					formatter: Formato.Fecha,
					sort: true,
					headerStyle: { width: "240px" },
				},
				{
					dataField: "fechaVencimiento",
					text: "Fecha de vencimiento",
					formatter: Formato.Fecha,
					sort: true,
					headerStyle: { width: "220px" },
				},
				{
					dataField: "deletedDate",
					text: "Fecha de baja",
					formatter: Formato.Fecha,
					sort: true,
					headerStyle: { width: "150px" },
					style: (v) => (v ? { background: "#ff6464cc", color: "#fff" } : {}),
				},
				...columnsInit,
			]}
			mostrarBuscar={false}
			{...x}
		/>
	);
};

export default LiquidacionesCabeceraTable;
