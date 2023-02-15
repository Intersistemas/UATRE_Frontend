import React, { useEffect, useState } from "react";
import useHttp from "../../hooks/useHttp";
import BoletaDetails from "./BoletaDetails";
import BoletasList from "./BoletasList";
import Button from "../../ui/Button/Button";
import Modal from "../../ui/Modal/Modal";
import BoletaPDF from "./BoletaPDF";
import { PDFViewer } from "@react-pdf/renderer";
import styles from "./BoletasHandler.module.css";

const BoletasHandler = (props) => {
	const config = props.config;
	const empresa = config.empresa;
	const establecimiento = config.establecimiento;
	const establecimientoId = establecimiento?.id ?? 0;
	const [boletas, setBoletas] = useState(null);
	const [boletaPDF, setBoletaPDF] = useState(null);
	const [pagination, setPagination] = useState({
		index: 1,
		size: 10,
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

	const handleImprimir = () => {
		setBoletaPDF(
			<Modal onClose={() => setBoletaPDF(null)}>
				<PDFViewer style={{ width: "100%", height: "100%"}}>
					<BoletaPDF
						config={{
							empresa: empresa,
							establecimiento: establecimiento,
							data: boleta,
						}}
					/>
				</PDFViewer>
			</Modal>
		);
	};

	let boletaHF = null;
	if (boleta != null) {
		boletaHF = (
			<>
				<Button onClick={handleImprimir}>Imprimir</Button>
				<BoletaDetails config={{ data: boleta }} />
				{boletaPDF}
			</>
		);
	}

	const handlePaginationChange = (pageIndex, pageSize) =>
		setPagination({ ...pagination, index: pageIndex, size: pageSize });

	return (
		<>
			<h2 className="subtitulo">
				Boletas del establecimiento Nro. {establecimiento.nroSucursal} -{" "}
				{establecimiento.nombre}
			</h2>
			<BoletasList
				config={{
					data: boletas,
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
