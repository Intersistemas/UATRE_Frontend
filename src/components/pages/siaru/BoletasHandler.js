import React, { useEffect, useState } from "react";
import useHttp from "../../hooks/useHttp";
import BoletaDetails from "./BoletaDetails";
import BoletasList from "./BoletasList";

const BoletasHandler = (props) => {
	const config = props.config;
	const establecimiento = config.establecimiento;
	const establecimientoId = establecimiento ? establecimiento.id : 0;
	const [boletas, setBoletas] = useState(null);
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

	const handleBoletasSelect = (ix) => setBoleta(boletas[ix]);

	let boletaHF = null;
	if (boleta != null) {
		boletaHF = <BoletaDetails config={{ data: boleta }} />;
	}

	const handlePaginationChange = (pageIndex, pageSize) =>
		setPagination({ ...pagination, index: pageIndex, size: pageSize });

	return (
		<>
			<h2>
				Boletas del establecimiento Nro. {establecimiento.nroSucursal} -{" "}
				{establecimiento.nombre}
			</h2>
			<BoletasList
				config={{
					data: boletas,
					onSelect: handleBoletasSelect,
					onPaginationChange: handlePaginationChange,
				}}
			/>
			{boletaHF}
		</>
	);
};

export default BoletasHandler;
