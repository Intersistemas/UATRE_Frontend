import React from "react";
import Formato from "components/helpers/Formato";
import Table from "components/ui/Table/Table";

const LiquidacionesNominaTable = ({ columns: columnsInit = [], ...x } = {}) => {
	const columnsDef = [
		{
			dataField: "cuil",
			text: "CUIL",
			sort: true,
			headerStyle: { width: "150px" },
			formatter: Formato.Cuit,
		},
		{
			dataField: "nombre",
			text: "Nombre",
			sort: true,
			style: { textAlign: "left" },
		},
		{
			dataField: "afiliadoId",
			text: "Es Afiliado",
			sort: true,
			headerStyle: { width: "120px" },
			formatter: (value) =>
				Formato.Booleano(value != null ? value !== 0 : null),
			style: { textAlign: "center" },
		},
		{
			dataField: "esRural",
			text: "Es Rural",
			sort: true,
			headerStyle: { width: "100px" },
			formatter: Formato.Booleano,
			style: { textAlign: "center" },
		},
		{
			dataField: "remuneracionImponible",
			text: "Remuneración",
			sort: true,
			headerStyle: { width: "155px" },
			formatter: Formato.Moneda,
			style: { textAlign: "right" },
		},
	];

	const columns = columnsInit.length
		? columnsInit.map((r) => ({
				...columnsDef.find((d) => d.dataField === r.dataField),
				...r,
		  }))
		: columnsDef;
	return <Table keyField="id" columns={columns} mostrarBuscar={false} {...x} />;
};

export default LiquidacionesNominaTable;
