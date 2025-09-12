import React from "react";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Round from "components/helpers/Round";
import Table from "components/ui/Table/Table";
import useTareasUsuario from "components/hooks/useTareasUsuario";

const LiquidacionesCabeceraTable = ({ columns, ...x } = {}) => {
	const tarea = useTareasUsuario();	
	const hideUsuario = !tarea.hasTarea("Siaru_LiquidacionesVerTodas");

	const columnsDef = [
    {
      dataField: "boletaId",
      text: "Id Boleta",
      sort: true,
      headerStyle: { width: "130px" },
      style: { textAlign: "center" },
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
      headerStyle: { width: "120px" },
    },
    {
      dataField: "createdByName",
      text: "Usuario",
      sort: false,
      hidden: !!hideUsuario,
      style: { textAlign: "left" },
    },
    {
      dataField: "cantidadTrabajadores",
      text: "Cant. Trab.",
      sort: false,
      // headerStyle: { width: "140px" },
      style: { textAlign: "center" },
    },
    {
      dataField: "totalRemuneraciones",
      text: "T. Remun.",
      formatter: (v) => Formato.Moneda(v),
      sort: false,
      headerStyle: { width: "200px" },
      style: { textAlign: "right" },
    },
    {
      dataField: "totalAporte",
      text: "Capital",
      formatter: (v) => Formato.Moneda(v),
      sort: false,
      headerStyle: { width: "120px" },
      style: { textAlign: "right" },
    },
    {
      dataField: "totalIntereses",
      text: "T. intereses",
      formatter: (v) => Formato.Moneda(v),
      sort: false,
      headerStyle: { width: "140px" },
      style: { textAlign: "right" },
    },
    {
      dataField: "totalImporte",
      text: "T. importe",
      isDummyField: true,
      formatter: (_v, r) =>
        Formato.Moneda(Round(r.totalAporte + r.totalIntereses, 2)),
      sort: false,
      headerStyle: { width: "200px" },
      style: { textAlign: "right" },
    },
    {
      dataField: "fechaPagoEstimada",
      text: "F. pago",
      formatter: Formato.Fecha,
      sort: true,
      headerStyle: { width: "120px" },
    },
    {
      dataField: "fechaVencimiento",
      text: "F. vencimiento",
      formatter: Formato.Fecha,
      sort: true,
      headerStyle: { width: "160px" },
    },
    {
      dataField: "deletedDate",
      text: "F. baja",
      formatter: Formato.Fecha,
      sort: true,
      headerStyle: { width: "100px" },
      style: (v) => {
        const r = { textAlign: "center" };
        if (v) {
          r.background = "#ff6464cc";
          r.color = "#FFF";
        }
        return r;
      },
    },
  ];

	return (
		<Table
			keyField="id"
			columns={
				typeof columns === "function"
					? AsArray(columns(columnsDef.map((r) => ({ ...r }))), true)
					: Array.isArray(columns) && columns.length
					? columns.map((r) => ({
							...columnsDef.find((d) => d.dataField === r.dataField),
							...r,
					  }))
					: columnsDef
			}
			mostrarBuscar={false}
			{...x}
		/>
	);
};

export default LiquidacionesCabeceraTable;
