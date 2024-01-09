import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import Grid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato";
import useEstablecimientos from "components/establecimientos/useEstablecimientos";
import Action from "components/helpers/Action";
import KeyPress from "components/keyPress/KeyPress";
import EstablecimientoDetails from "./EstablecimientoDetails";
import InputMaterial from "components/ui/Input/InputMaterial";
import useQueryQueue from "components/hooks/useQueryQueue";

const EstablecimientosHandler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetEstablecimientos": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});

	const empresa = useSelector((state) => state.empresa);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);

	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "Siaru" });
	}, [empresa]);

	//#region contenido Establecimientos
	const [
		establecimientosContent,
		establecimientosChanger,
		establecimientosSelected,
	] = useEstablecimientos();
	const [acciones, setAcciones] = useState([]);
	useEffect(() => {
		const createAction = ({ action, request, ...x }) =>
			new Action({
				name: action,
				onExecute: (action) =>
					establecimientosChanger("selected", {
						request,
						action,
						record: { empresaId: empresa.id },
					}),
				combination: "AltKey",
				...x,
			});
		const actions = [
			createAction({
				action: `Agrega Establecimiento`,
				request: "A",
				tarea: "Establecimiento_Agrega",
				keys: "a",
				underlineindex: 0,
			}),
		];
		const desc = establecimientosSelected?.nroSucursal;
		if (!desc) {
			setAcciones(actions);
			return;
		}
		actions.push(
			createAction({
				action: `Consulta Establecimiento ${desc}`,
				request: "C",
				keys: "o",
				underlineindex: 1,
			})
		);
		actions.push(
			createAction({
				action: `Modifica Establecimiento ${desc}`,
				request: "M",
				disabled: !!establecimientosSelected.deletedDate,
				tarea: "Establecimiento_Modifica",
				keys: "m",
				underlineindex: 0,
			})
		);
		if (establecimientosSelected.deletedDate) {
			actions.push(
				createAction({
					action: `Reactiva Establecimiento ${desc}`,
					request: "R",
					tarea: "Establecimiento_Reactiva",
					keys: "r",
					underlineindex: 0,
				})
			);
		} else {
			actions.push(
				createAction({
					action: `Baja Establecimiento ${desc}`,
					request: "B",
					tarea: "Establecimiento_Baja",
					keys: "b",
					underlineindex: 0,
				})
			);
		}
		setAcciones(actions);
	}, [establecimientosChanger, establecimientosSelected, empresa?.id]);

	const [establecimientosParams, setEstablecimientosParams] = useState({
		empresaId: empresa.id,
	});

	useEffect(() => {
		if (!establecimientosParams.empresaId)
			return establecimientosChanger("list", { clear: true });
		establecimientosChanger("list", {
			params: establecimientosParams,
			pagination: { size: 10 },
		});
	}, [establecimientosChanger, establecimientosParams]);
	//#endregion

	//#region declaracion y carga de stats
	const [stats, setStats] = useState({ loading: null, total: 0, bajas: 0 });
	useEffect(() => {
		if (!stats.loading) return;
		if (!empresa.id) {
			setStats({
				loading: null,
				total: 0,
				bajas: 0,
			});
			return;
		}
		const query = {
			action: "GetEstablecimientos",
			params: {
				empresaId: empresa.id,
				pageIndex: 1,
				pageSize: 1,
			},
		};
		pushQuery({
			...query,
			onOk: async ({ count }) =>
				setStats((o) => ({ ...o, loading: null, total: count })),
			onError: async (_) =>
				setStats((o) => ({ ...o, loading: null, total: 0 })),
		});
		pushQuery({
			...query,
			params: { ...query.params, bajas: true },
			onOk: async ({ count }) =>
				setStats((o) => ({ ...o, loading: null, bajas: count })),
			onError: async (_) => 
				setStats((o) => ({ ...o, loading: null, bajas: 0 })),
			});
	}, [
		stats,
		empresa.id,
		pushQuery,
	]);

	useEffect(() => {
		setStats((o) => ({ ...o, loading: "Cargando..." }));
	}, [establecimientosSelected])
	//#endregion

	//#region modulo y acciones
	useEffect(() => {
		dispatch(handleModuloSeleccionar({ nombre: "SIARU", acciones }));
	}, [dispatch, acciones]);
	//#endregion

	return (
		<Grid col height="100vh" gap="10px">
			<Grid className="titulo" width="full">
				<h1>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid className="contenido" width="full" grow>
				<Grid
					col
					full
					style={{ position: "absolute", left: 0, top: 0, padding: "10px" }}
				>
					<Grid width="full">
						<h2 className="subtitulo" style={{ margin: 0 }}>
							{[
								"Establecimientos",
								[Formato.Cuit(empresa.cuit), empresa.razonSocial]
									.filter((r) => r)
									.join(" "),
							].join(" de ")}
						</h2>
					</Grid>
					<Grid width="full" col grow gap="5px">
						<Grid width="full" justify="between">
							<Grid col height="full" justify="end">
								<h5 style={{ margin: 0 }}>
									{/* {[
										stats.total
											? `Cantidad de establecimientos: ${stats.total}`
											: null,
										stats.bajas ? `de baja: ${stats.bajas}` : null,
									].join(", ")} */}
									{stats.total
										? `Cantidad de establecimiento Activos: ${
												stats.total - stats.bajas
										  }`
										: null}
								</h5>
							</Grid>
							<Grid width="260px">
								<InputMaterial
									value={establecimientosParams.filtro}
									label="Filtro de establecimientos"
									onChange={(filtro) =>
										setEstablecimientosParams((o) => ({ ...o, filtro }))
									}
								/>
							</Grid>
						</Grid>
						<Grid grow>{establecimientosContent()}</Grid>
						<EstablecimientoDetails data={establecimientosSelected} />
						<KeyPress items={acciones} />
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default EstablecimientosHandler;
