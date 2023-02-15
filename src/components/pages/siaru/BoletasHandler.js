import React, { useEffect, useState } from "react";
import useHttp from "../../hooks/useHttp";
import BoletaDetails from "./BoletaDetails";
import BoletasList from "./BoletasList";
import Button from "../../ui/Button/Button";
import Modal from "../../ui/Modal/Modal";
import { Renglon, Celda } from "../../ui/Grilla/Grilla";
import BoletaPDF from "./BoletaPDF";
import { PDFViewer } from "@react-pdf/renderer";
import styles from "./BoletasHandler.module.css";
import GenerarBoletaForm from "./GenerarBoletaForm";

const BoletasHandler = (props) => {
	const config = props.config;
	const empresa = config.empresa;
	const establecimiento = config.establecimiento;
	const establecimientoId = establecimiento?.id ?? 0;
	const [boletas, setBoletas] = useState(null);
	const [boletaForm, setBoletaForm] = useState(null);
	const [boletaPDF, setBoletaPDF] = useState(null);
	const [pagination, setPagination] = useState({
		index: 1,
		size: 2,
		count: 0,
		pages: 0,
	});
	const [boleta, setBoleta] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();

	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_BoletasDeposito/Paginado?EmpresasEstablecimientosId=${establecimientoId}&Page=${pagination.index},${pagination.size}`,
				method: "GET",
			},
			async (response) => {
				setBoletas(response.data);
				setPagination({
					index: response.index,
					size: response.size,
					count: response.count,
					pages: response.pages,
				});
				setBoleta(null);
			}
		);
	}, [request, establecimientoId, pagination.index, pagination.size]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;
	if (boletas == null) return <></>;

	const handleBoletasSelect = (boleta) => setBoleta(boleta);

	const handleImprimir = (data) => {
		setBoletaPDF(
			<Modal onClose={() => setBoletaPDF(null)}>
				<Renglon style={{ height: "calc(100% - 6%)" }}>
					<PDFViewer style={{ width: "100%", height: "100%" }}>
						<BoletaPDF
							config={{
								empresa: empresa,
								establecimiento: establecimiento,
								data: data,
							}}
						/>
					</PDFViewer>
				</Renglon>
				<Renglon abajo>
					<Celda width={85}> </Celda>
					<Celda width={15}>
						<Button className="botonBlanco" onClick={() => setBoletaPDF(null)}>
							Cerrar
						</Button>
					</Celda>
				</Renglon>
			</Modal>
		);
	};

	const handleGenerarBoletaConfirma = (datos) => {
		setBoletaForm(null);
		handleImprimir(datos);
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_BoletasDeposito/Paginado?EmpresasEstablecimientosId=${establecimientoId}&Page=${pagination.index},${pagination.size}`,
				method: "GET",
			},
			async (response) => {
				setBoletas(response.data);
				setPagination({
					index: response.index,
					size: response.size,
					count: response.count,
					pages: response.pages,
				});
				setBoleta(datos);
			}
		);
	};

	const handleGenerarBoletaClick = () =>
		setBoletaForm(
			<GenerarBoletaForm
				config={{
					empresa: empresa,
					establecimiento: establecimiento,
					onCancela: () => setBoletaForm(null),
					onConfirma: handleGenerarBoletaConfirma,
				}}
			/>
		);

	let boletaHF = null;
	if (boleta != null) {
		boletaHF = (
			<>
				<BoletaDetails config={{ data: boleta }} />
				<Button onClick={() => handleImprimir(boleta)}>Imprimir boleta numero {boleta.id}</Button>
			</>
		);
	}

	const handlePaginationChange = (pageIndex, pageSize) =>
		setPagination({ ...pagination, index: pageIndex, size: pageSize });

	return (
		<>
			<Button onClick={handleGenerarBoletaClick}>Generar boleta para establecimiento {establecimiento.nombre}</Button>
			{boletaForm}
			{boletaPDF}
			<h2 className="subtitulo">
				Boletas del establecimiento Nro. {establecimiento.nroSucursal} -{" "}
				{establecimiento.nombre}
			</h2>
			<BoletasList
				config={{
					data: boletas,
					pagination: pagination,
					loading: isLoading,
					onSelect: handleBoletasSelect,
					onPaginationChange: handlePaginationChange,
				}}
			/>
			{boletaHF}
		</>
	);
};

export default BoletasHandler;
