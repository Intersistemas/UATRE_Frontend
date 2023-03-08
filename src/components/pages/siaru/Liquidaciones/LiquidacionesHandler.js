import React, { useEffect, useState } from "react";
import styles from "./LiquidacionesHandler.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import useHttp from "../../../hooks/useHttp";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "../../../../redux/actions";
import Grid from "../../../ui/Grid/Grid";
import Formato from "../../../helpers/Formato";
import Select from "../../../ui/Select/Select";
import LiquidacionesList from "./LiquidacionesList";

const LiquidacionesHandler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = location.state?.empresa ? location.state.empresa : {};
	if (empresa.id == null) navigate("/");

	const [liquidaciones, setLiquidaciones] = useState([]);
	const [liquidacion, setLiquidacion] = useState(null);
	const [pagination, setPagination] = useState({
		index: 1,
		size: 10,
		count: 0,
		pages: 0,
	});
	const [periodos, setPeriodos] = useState([{ descipcion: "Todos", valor: 0 }]);
	const [periodo, setPeriodo] = useState(0);
	const [establecimientos, setEstablecimientos] = useState([
		[{ descipcion: "Todos", valor: { id: 0 } }],
	]);
	const [establecimiento, setEstablecimiento] = useState({ id: 0 });
	const { isLoading, error, sendRequest: request } = useHttp();

	const recargarLiquidaciones = (registro = null) => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_Liquidaciones/Paginado?EmpresasId=${empresa.id}&Page=${pagination.index},${pagination.size}`,
				method: "GET",
			},
			async (response) => {
				setLiquidaciones(response.data);
				setPagination({
					index: response.index,
					size: response.size,
					count: response.count,
					pages: response.pages,
				});
				setLiquidacion(registro);
			}
		);
	};

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [{ nombre: `Empresas` }],
	};
	dispatch(handleModuloSeleccionar(moduloInfo));
	//#endregion

	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/Siaru_Liquidaciones/Periodos?EmpresasId=${empresa.id ?? 0}`,
				method: "GET",
			},
			async (response) =>
				setPeriodos([
					{ descipcion: "Todos", valor: 0 },
					...response.map((r) => ({
						descipcion: Formato.Periodo(r),
						valor: r,
					})),
				])
		);
		request(
			{
				baseURL: "SIARU",
				endpoint: `/EmpresasEstablecimientos?EmpresasId=${empresa.id ?? 0}`,
				method: "GET",
			},
			async (response) =>
				setEstablecimientos([
					{ descipcion: "Todos", valor: { id: 0 } },
					...response.map((r) => ({ descipcion: r.nombre, valor: r })),
				])
		);

		recargarLiquidaciones(liquidacion);

		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru");
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [request, empresa, pagination.index, pagination.size, moduloAccion]);

	if (isLoading) return <h1>Cargando...</h1>;
	if (error) return <h1>{error}</h1>;

	return (
		<Grid col full gap="5px">
			<Grid full="width">
				<h1 className={styles.titulo}>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid full="width">
				<h2 className="subtitulo">
					Liquidaciones de
					{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""}`}
				</h2>
			</Grid>
			<Grid
				full="width"
				gap="5px"
				style={{ background: "#ffffffe0", padding: "5px" }}
			>
				<Grid width="50%">
					<Select
						name="periodo"
						label="Periodo"
						value={periodo}
						options={periodos.map((r) => ({
							label: r.descipcion,
							value: r.valor,
						}))}
						onChange={(value) =>
							setPeriodo(periodos.find((r) => r.valor === value).valor)
						}
					/>
				</Grid>
				<Grid width="50%">
					<Select
						name="establecimiento"
						label="Establecimiento"
						value={establecimiento.id}
						options={establecimientos.map((r) => ({
							label: r.descipcion,
							value: r.valor?.id,
						}))}
						onChange={(value) =>
							setEstablecimiento(
								establecimientos.find((r) => r.valor.id === value).valor
							)
						}
					/>
				</Grid>
			</Grid>
			<Grid full="width">
				<LiquidacionesList
					config={{
						data: liquidaciones,
						onSelect: (r) => setLiquidacion(r),
					}}
				/>
			</Grid>
		</Grid>
	);
};

export default LiquidacionesHandler;
