import React, { useState, useEffect } from "react";
import useHttp from "../../hooks/useHttp";
import Button from "../../ui/Button/Button";
import Grid from "../../ui/Grid/Grid";
import EmpresaDetails from "./Empresas/EmpresaDetails";
import EmpresasList from "./Empresas/EmpresasList";
import EmpresaForm from "./Empresas/EmpresaForm";
import styles from "./SiaruHandler.module.css";
import { useNavigate } from "react-router-dom";

const SiaruHandler = (props) => {
	const [empresas, setEmpresas] = useState([]);
	const [empresa, setEmpresa] = useState(null);
	const [formEmpresa, setFormEmpresa] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();
	const navigate = useNavigate();

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

	let botones = [
		<Button
			onClick={() =>
				setFormEmpresa(
					<EmpresaForm
						config={{
							action: "A",
							data: {},
							onCancela: () => setFormEmpresa(null),
							onConfirma: (data) => setFormEmpresa(null),
						}}
					/>
				)
			}
		>
			Agrega Empresa
		</Button>,
	];
	if (empresa) {
		botones = [
			...botones,
			<Button
				onClick={() =>
					setFormEmpresa(
						<EmpresaForm
							config={{
								action: "M",
								data: empresa,
								onCancela: () => setFormEmpresa(null),
								onConfirma: (data) => setFormEmpresa(null),
							}}
						/>
					)
				}
			>
				Modifica Empresa
			</Button>,
			<Button
				onClick={() =>
					setFormEmpresa(
						<EmpresaForm
							config={{
								action: "B",
								data: empresa,
								onCancela: () => setFormEmpresa(null),
								onConfirma: (data) => setFormEmpresa(null),
							}}
						/>
					)
				}
			>
				Baja Empresa
			</Button>,
			<Button
				onClick={() =>
					setFormEmpresa(
						<EmpresaForm
							config={{
								action: "C",
								data: empresa,
								onCancela: () => setFormEmpresa(null),
								onConfirma: (data) => setFormEmpresa(null),
							}}
						/>
					)
				}
			>
				Consulta Empresa
			</Button>,
			<Button
				onClick={() =>
					navigate("/siaru/establecimientos", {
						state: { empresa: empresa },
					})
				}
			>
				Establecimientos
			</Button>,
		];
	}

	return (
		<Grid col full>
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid full="width">
				<h2 className="subtitulo">Empresas</h2>
			</Grid>
			<Grid full="width" gap="10px" style={{ padding: "5px" }}>
				{botones.map((boton, ix) => <Grid key={ix}>{boton}</Grid>)}
				{formEmpresa}
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
		</Grid>
	);
};

export default SiaruHandler;
