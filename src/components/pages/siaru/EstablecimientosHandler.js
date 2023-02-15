import React, { useEffect, useState } from "react";
import useHttp from "../../hooks/useHttp";
import Button from "../../ui/Button/Button";
import Modal from "../../ui/Modal/Modal";
import BoletaPDF from "./BoletaPDF";
import BoletasHandler from "./BoletasHandler";
import EstablecimientoDetails from "./EstablecimientoDetails";
import EstablecimientosList from "./EstablecimientosList";
import GenerarBoletaForm from "./GenerarBoletaForm";
import { PDFViewer } from "@react-pdf/renderer";
import styles from "./EstablecimientosHandler.module.css";

const EstablecimientosHandler = (props) => {
	const config = props.config;
	const empresa = config.empresa;
	const empresaId = empresa ? empresa.id : 0;
	const [establecimientos, setEstablecimientos] = useState(null);
	const [pagination, setPagination] = useState({
		index: 1,
		size: 10,
		count: 0,
		pages: 0,
	});
	const [establecimiento, setEstablecimiento] = useState(null);
	const { isLoading, error, sendRequest: request } = useHttp();
	const [boletaForm, setBoletaForm] = useState(null);
	const [boletaPDF, setBoletaPDF] = useState(null);

	useEffect(() => {
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
				setEstablecimiento(null);
			}
		);
	}, [request, empresaId, pagination.index, pagination.size]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;
	if (establecimientos == null) return <></>;

	const handleEstablecimientosSelect = (establecimiento) =>
		setEstablecimiento(establecimiento);

	const handleGenerarBoletaConfirma = (datos) => {
		console.log("datos", datos);
		setBoletaPDF(
			<Modal onClose={() => setBoletaPDF(null)}>
				<PDFViewer style={{ width: "100%", height: "100%" }}>
					<BoletaPDF
						config={{
							empresa: empresa,
							establecimiento: establecimiento,
							data: datos,
						}}
					/>
				</PDFViewer>
			</Modal>
		);
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
				setEstablecimiento(null);
			}
		);
		setBoletaForm(null);
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

	let establecimientoHF = null;
	if (establecimiento != null) {
		establecimientoHF = (
			<>
				<Button onClick={handleGenerarBoletaClick}>Generar boleta</Button>

				<EstablecimientoDetails config={{ data: establecimiento }} />
				<BoletasHandler
					config={{ empresa: empresa, establecimiento: establecimiento }}
				/>
			</>
		);
	}

	const handlePaginationChange = (pageIndex, pageSize) =>
		setPagination({ ...pagination, index: pageIndex, size: pageSize });

	return (
		<>
			<h2 className="subtitulo">Establecimientos</h2>
			<EstablecimientosList
				config={{
					data: establecimientos,
					loading: isLoading,
					onSelect: handleEstablecimientosSelect,
					onPaginationChange: handlePaginationChange,
				}}
			/>
			{boletaForm}
			{boletaPDF}
			{establecimientoHF}
		</>
	);
};

export default EstablecimientosHandler;
