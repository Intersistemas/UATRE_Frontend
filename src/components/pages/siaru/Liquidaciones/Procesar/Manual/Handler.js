import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
	handleModuloEjecutarAccion,
	handleModuloSeleccionar,
} from "redux/actions";
import useHttp from "components/hooks/useHttp";
import Tentativas from "../Tentativas/Handler";
import Grid from "components/ui/Grid/Grid";
import NominaTable from "./NominaTable";
import Formato from "components/helpers/Formato";
import NominaForm from "./NominaForm";
import Button from "components/ui/Button/Button";
import { Alert } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import { Collapse, IconButton } from "@mui/material";
import { AlertTitle } from "@mui/lab";

const Handler = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const empresa = useMemo(
		() => (location.state?.empresa ? location.state.empresa : {}),
		[location.state?.empresa]
	);
	const periodo = location.state?.periodo;
  if (empresa.id == null || periodo == null) navigate("/ingreso");


	const { sendRequest } = useHttp();

	const [tentativas, setTentativas] = useState(null);

	const [alerts, setAlerts] = useState([]);
	let alertsRender = null;
	if (alerts.length > 0) {
		alertsRender = (
			<Grid gap="15px" full="width">
				<Grid col grow>
					{alerts?.map((r, ix) => (
						<Collapse key={ix} in={true} style={{ width: "100%" }}>
							<Alert
								severity={r.severity}
								action={
									<IconButton
										aria-label="close"
										color="inherit"
										size="small"
										onClick={() => {
											const newAlerts = [...alerts];
											newAlerts.splice(ix, 1);
											setAlerts(newAlerts);
										}}
									>
										<CloseIcon fontSize="inherit" />
									</IconButton>
								}
								sx={{ mb: 2 }}
								style={{ marginBottom: "0" }}
							>
								<AlertTitle>{r.title}</AlertTitle>
								{r.message}
							</Alert>
						</Collapse>
					))}
				</Grid>
			</Grid>
		);
	}

	const [nomina, setNomina] = useState({
		list: [],
		selected: {},
		form: null,
	});

	//#region despachar Informar Modulo
	const moduloInfo = {
		nombre: "SIARU",
		acciones: [
			{ name: `Empresas` },
			{ name: `Liquidaciones` },
			{ name: `Procesar liquidaciones` },
		],
	};

	const descTrabajador = `${Formato.Cuit(nomina.selected.row?.cuil)}`;
	if (tentativas == null) {
			moduloInfo.acciones.push({ name: `Agregar trabajador` });
			if (descTrabajador) {
			moduloInfo.acciones.push({
				name: `Modificar trabajador ${descTrabajador}`,
			});
			moduloInfo.acciones.push({ name: `Borrar trabajador ${descTrabajador}` });
		}
	}

	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		const abreFormularioTrabajador = (request = "") =>
			setNomina((old) => ({
				...old,
				form: (
					<NominaForm
						data={request === "A" ? null : old.selected.row}
						request={request}
						onClose={({ request, data }) =>
							setNomina((old) => {
								const newData = {
									...old,
									list: [...old.list],
									form: null,
								};
								switch (request) {
									case "A":
										newData.selected = {
											index: newData.list.length,
											row: data,
										};
										newData.list.push(data);
										break;
									case "M":
										newData.selected = {
											...newData.selected,
											row: data,
										};
										newData.list.splice(newData.selected.index, 1, data);
										break;
									case "B":
										let i = newData.selected.index;
										newData.list.splice(i, 1);
										if (i === 0) i = newData.list.length > 0 ? 1 : 0;
										i -= 1;
										if (i < 0) newData.selected = {};
										else
											newData.selected = {
												index: i,
												row: { ...newData.list[newData.selected.index] },
											};
										break;
									default:
										break;
								}
								return newData;
							})
						}
					/>
				),
			}));
		switch (moduloAccion) {
			case `Empresas`:
				navigate("/siaru", { state: { empresa: empresa } });
				break;
			case `Liquidaciones`:
				navigate("/siaru/liquidaciones", { state: { empresa: empresa } });
				break;
			case `Procesar liquidaciones`:
				navigate("/siaru/liquidaciones/procesar", {
					state: { empresa: empresa },
				});
				break;
			case `Agregar trabajador`:
				abreFormularioTrabajador("A");
				break;
			case `Modificar trabajador ${descTrabajador}`:
				abreFormularioTrabajador("M");
				break;
			case `Borrar trabajador ${descTrabajador}`:
				abreFormularioTrabajador("B");
				break;
			default:
				break;
		}
		dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	}, [moduloAccion, empresa, descTrabajador, navigate, dispatch]);
	//#endregion

	//#region requests a APIs
	const [apiQuery, setApiQuery] = useState({
		action: "",
		query: [],
		body: null,
		timeStamp: new Date(),
	});
	useEffect(() => {
		switch (apiQuery.action) {
			case "SolicitarTentativas":
				setTentativas({ loading: true });
				sendRequest(
					{
						method: "POST",
						baseURL: "SIARU",
						endpoint: [
							`/Liquidaciones/TentativasManual`,
							apiQuery.query?.filter((e) => e).join("&"),
						]
							.filter((e) => e)
							.join("?"),
						body: apiQuery.body,
					},
					async (res) => setTentativas({ data: res }),
					async (err) => {
						setAlerts((old) => [
							...old,
							{
								severity: "error",
								title: `${err.type} cargando tentativas de liquidacion`,
								message: err.message,
							},
						]);
						setTentativas({ error: err });
					}
				);
				break;
			default:
				break;
		}
	}, [apiQuery, sendRequest]);
	//#endregion

	let contenido = null;
	if (tentativas?.data != null) {
		contenido = (
			<Tentativas
				empresa={empresa}
				periodo={periodo}
				tentativas={tentativas.data}
			/>
		);
	} else {
		contenido = (
			<Grid
				col
				full
				style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
			>
				<h2 className="subtitulo">
					Generación manual de liquidaciones de
					{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""} `}
					para el período
					{` ${Formato.Periodo(periodo)}`}
				</h2>
				<Grid width="full">
					<NominaTable
						records={nomina.list}
						mostrarBuscar={false}
						selected={[nomina.selected.row]}
						onSelect={(selected) =>
							setNomina((old) => ({ ...old, selected: selected }))
						}
					/>
					{nomina.form}
				</Grid>
				{alertsRender}
				<Grid gap="15px">
					<Grid grow />
					<Grid>
						<Button
							disabled={!descTrabajador}
							onClick={() =>
								setApiQuery({
									action: "SolicitarTentativas",
									body: {
										cuit: empresa.cuit,
										periodo: periodo,
										nominas: nomina.list,
									},
									timeStamp: new Date(),
								})
							}
						>
							Iniciar
						</Button>
					</Grid>
				</Grid>
			</Grid>
		);
	}

	return (
		<>
			<div className="titulo">
				<h1>Sistema de Aportes Rurales</h1>
			</div>
			<div className="contenido">{contenido}</div>
		</>
	);
};

export default Handler;
