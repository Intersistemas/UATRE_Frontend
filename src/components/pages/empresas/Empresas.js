import React, { Fragment, useState } from "react";
import { Tab, Tabs } from "@mui/material";
import styles from "./Empresas.module.css";
import Formato from "../../helpers/Formato";
import Table from "../../ui/Table/Table";


const Empresas = ({
	data = [],
	loading,
	noData,
	pagination = {},
	selection = {},
}) => {
	data ??= [];
	pagination ??= {};
	selection ??= {};

	const cs = {
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "nowrap",
	};
	const columns = [
		{
			dataField: "cuitEmpresa",
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
			dataField: "localidadDescripcion",
			text: "Localidad",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: {...cs, textAlign: "left"}
		},
		{
			dataField: "provinciaDescripcion",
			text: "Provincia",
			sort: true,
      headerStyle: (_colum, _colIndex) => ({ width: "25%" }),
			style: {...cs, textAlign: "left"}
		},
	];
    const [selectedTab, setSelectedTab] = useState(0)

    const handleChangeTab = (event, newValue) => {
      setSelectedTab(newValue);
    };
  return (
    <>
      <div>
        <h1 className="titulo">Empresas</h1>
      </div>

      <div>
        <Tabs
          value={selectedTab}
          onChange={handleChangeTab}
          className={styles.tabs}
        >
          <Tab
            className={styles.tab}
            style={{ backgroundColor: "#186090" }}
            label="Empresas"
          />
          
          <Tab
            className={styles.tab}
            style={{ backgroundColor: "#186090" }}
            label="2"
            //disabled={props.seccionalSeleccionada?.id ? false : true}
          />
          <Tab
            className={styles.tab}
            style={{ backgroundColor: "#186090" }}
            label="3"
            //disabled={props.seccionalSeleccionada?.id ? false : true}
          />
        </Tabs>
      </div>
      {selectedTab === 0 && (
        <div>

        <Table
              remote
              keyField="cuitEmpresa"
              loading={loading}
              data={data}
              columns={columns}
              pagination={pagination}
              selection={selection}
              noDataIndication={noData}
            />
        </div>
      )}

      {selectedTab === 1 && (
       <h1>11</h1>
      )}

      {selectedTab === 2 && (
       <h1>22</h1>
      )}
    </>
  );
};

export default Empresas;
