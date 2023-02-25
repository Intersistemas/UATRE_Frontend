import React, { useState, useEffect } from "react";
import useHttp from "../../hooks/useHttp";
import Grid from "../../ui/Grid/Grid";
import EmpresaDetails from "./EmpresaDetails";
import EmpresasList from "./EmpresasList";
import styles from "./SiaruHandler.module.css";

const SiaruHandler = (props) => {
	const [empresas, setEmpresas] = useState([]);
	const [empresa, setEmpresa] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();

	useEffect(() => {
		// request(
		// 	{
		// 		baseURL: "SIARU",
		// 		endpoint: `/Empresas/${cuit}`,
		// 		method: "GET",
		// 	},
		// 	async (response) => setEmpresas(response)
		// );
		setEmpresas([
			{
				cuit: 34618764356,
				razonsocial: "HUAYRA SCA",
				localidad: "Rio Negro",
				domicilio: "AVELEYRA 338",
			},
			{
				cuit: 34617797587,
				razonsocial: "LUISITO SA",
				localidad: "Buenos Aires",
				domicilio: "JUJUY 766",
			},
			{
				cuit: 34610675923,
				razonsocial: "TAPE S.A.",
				localidad: "Buenos Aires",
				domicilio: "RODRIGUEZ PEÑA 616",
			},
			{
				cuit: 34560268019,
				razonsocial: "ASOC COOP DE LA EEA MZA-I",
				localidad: "Corrientes",
				domicilio: "SAN MARTIN 3853",
			},
		]);
	// }, [request]);
	}, []);

	// if (isLoading) return <h1>Cargando...</h1>;
	// if (error) return <h1>{error}</h1>;
	// if (empresa == null) return <></>;

	const fetchEmpresa = (cuit) => {
		if ((cuit ?? 0) == 0) {
			setEmpresa(null);
			return;
		}
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Empresas/${cuit}`,
				method: "GET",
			},
			async (response) => setEmpresa(response)
		);
	};

	return (
		<Grid col full>
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid full="width" style={{ paddingBottom: "5px" }}>
				<h2 className="subtitulo">Empresas</h2>
			</Grid>
			<Grid full="width" grow>
				<Grid width="50%">
					<EmpresasList
						config={{
							data: empresas,
							onSelect: (r) => fetchEmpresa(r?.cuit),
						}}
					/>
				</Grid>
				<Grid block width="50%" style={{ paddingLeft: "5px" }}>
					<EmpresaDetails config={{ data: empresa }} />
				</Grid>
			</Grid>
			{/* <EstablecimientosHandler config={{ empresa: empresa }} /> */}
		</Grid>
	);
};

export default SiaruHandler;
