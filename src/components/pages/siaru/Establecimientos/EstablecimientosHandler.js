import React, { useEffect, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Button from "../../../ui/Button/Button";
import EstablecimientoDetails from "./EstablecimientoDetails";
import EstablecimientosList from "./EstablecimientosList";
import Form from "./EstablecimientoForm";
import styles from "./EstablecimientosHandler.module.css";
import { redirect, useLocation } from "react-router-dom";
import Grid from "../../../ui/Grid/Grid";

const EstablecimientosHandler = (props) => {
	const location = useLocation();
	const empresa = location.state?.empresa;
	if (empresa?.id == null) {
		redirect("/");
	}

	const empresaId = empresa ? empresa.id : 0;
	const [establecimientos, setEstablecimientos] = useState(null);
	const [pagination, setPagination] = useState({
		index: 1,
		size: 2,
		count: 0,
		pages: 0,
	});
	const [establecimiento, setEstablecimiento] = useState(null);
	const [form, setForm] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();

	const recargarEstablecimientos = (despliega = null) => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/EmpresasEstablecimientos/Paginado?EmpresasId=${empresaId}&Page=${pagination.index},${pagination.size}`,
				method: "GET",
			},
			async (response) => {
				setEstablecimientos(response.data);
				setPagination({
					index: response.index,
					size: response.size,
					count: response.count,
					pages: response.pages,
				});
				setEstablecimiento(despliega);
			}
		);
	}

	useEffect(() => {
		recargarEstablecimientos();
	}, [empresaId, pagination.index, pagination.size]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;
	if (establecimientos == null) return <></>;

	let botones = [
		<Button
			onClick={() =>
				setForm(
					<Form
						config={{
							action: "A",
							data: { empresasId: empresa.id },
							onCancela: () => setForm(null),
							onConfirma: (data) => {
								recargarEstablecimientos(data);
								setForm(null);
							},
						}}
					/>
				)
			}
		>
			Agrega Establecimiento
		</Button>,
	];
	if (establecimiento) {
		botones = [
			...botones,
			<Button
				onClick={() =>
					setForm(
						<Form
							config={{
								action: "M",
								data: establecimiento,
								onCancela: () => setForm(null),
								onConfirma: (data) => {
									recargarEstablecimientos(data);
									setForm(null);
								},
							}}
						/>
					)
				}
			>
				Modifica Establecimiento
			</Button>,
			<Button
				onClick={() =>
					setForm(
						<Form
							config={{
								action: "B",
								data: establecimiento,
								onCancela: () => setForm(null),
								onConfirma: (data) => {
									recargarEstablecimientos(data);
									setForm(null);
								},
							}}
						/>
					)
				}
			>
				Baja Establecimiento
			</Button>,
			<Button
				onClick={() =>
					setForm(
						<Form
							config={{
								action: "C",
								data: establecimiento,
								onCancela: () => setForm(null),
								onConfirma: (data) => {
									recargarEstablecimientos(data);
									setForm(null);
								},
							}}
						/>
					)
				}
			>
				Consulta Establecimiento
			</Button>,
		];
	}

	return (
		<Grid col full>
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid full="width">
				<h2 className="subtitulo">Establecimientos</h2>
			</Grid>
			<Grid full="width" gap="10px" style={{ padding: "5px" }}>
				{botones.map((boton, ix) => <Grid key={ix}>{boton}</Grid>)}
				{form}
			</Grid>
			<Grid full="width" grow>
				<Grid width="50%">
					<EstablecimientosList
						config={{
							data: establecimientos,
							onSelect: (r) => setEstablecimiento(r),
						}}
					/>
				</Grid>
				<Grid block width="50%" style={{ paddingLeft: "5px" }}>
					<EstablecimientoDetails config={{ data: establecimiento }} />
				</Grid>
			</Grid>
		</Grid>
	);
};

export default EstablecimientosHandler;
