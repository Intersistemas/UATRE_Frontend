import React, { Fragment, useState } from "react";
import { Tab, Tabs } from "@mui/material";
import Formato from "../../../helpers/Formato";
import Table from "../../../ui/Table/Table";
import Grid from "components/ui/Grid/Grid";


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

      <Grid full col>
            <Grid className="titulo">
              <h1>Empresas</h1>
            </Grid>

            <div className="tabs">
              <text>{/*delegacionSelected?.nombre ? delegacionSelected.nombre  : " " */}</text>

              <Tabs
                value={selectedTab}
                onChange={handleChangeTab}
                >
                  <Tab
                    style={{ backgroundColor: "#186090" }}
                    label="Empresas"
                  />
                  
                  <Tab
                    style={{ backgroundColor: "#186090" }}
                    label="2"
                    //disabled={props.seccionalSeleccionada?.id ? false : true}
                  />
                  <Tab
                    style={{ backgroundColor: "#186090" }}
                    label="3"
                    //disabled={props.seccionalSeleccionada?.id ? false : true}
                  />
                </Tabs>
            </div> 
            <>
              {selectedTab === 0 && (
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
              )}

              {selectedTab === 1 && (
              <h1>11</h1>
              )}

              {selectedTab === 2 && (
              <h1>22</h1>
              )}     
            </>    
      </Grid>
    
    </>
  );
};

export default Empresas;
