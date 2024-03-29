import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Tab, Tabs } from "@mui/material";
import useQueryQueue from "components/hooks/useQueryQueue";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import JoinOjects from "components/helpers/JoinObjects";
import Round from "components/helpers/Round";
import Grid from "components/ui/Grid/Grid";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import InputMaterial from "components/ui/Input/InputMaterial";
import Button from "components/ui/Button/Button";
import FormaPagoPrint from "../../impresion/FormaPagoPrint";
import useLiquidaciones from "../../useLiquidaciones";
import useLiquidacionesNomina from "../../useLiquidacionesNomina";

const RangoDias = (desde, hasta) => {
	const dias = dayjs(hasta).diff(desde, "days");
	if (dias < 0) return 0;
	return dias;
};

const calculosLiquidacion = ({ liquidacion = {}, cabecera = {} }) => {
	const calculos = {};
	calculos.interesNeto = Round(
		liquidacion.totalRemuneraciones * (liquidacion.interesPorcentaje / 100),
		2
	);
	calculos.interesImporte = Round(
		liquidacion.totalRemuneraciones *
			(cabecera.interesesDiariosPosteriorVencimiento / 100) *
			(cabecera.diasVencimiento ?? 0),
		2
	);
	calculos.importeTotal = Round(
		calculos.interesImporte + calculos.interesNeto,
		2
	);
	return calculos;
};

//#region Controles personalizados
const onChangeDef = (changes) => {};
const LiquidacionCabecera = ({
	data = {},
	disabled = {},
	errors = {},
	onChange = onChangeDef,
	onGenera = () => {},
} = {}) => {
	data ??= {};
	disabled ??= {};
	errors ??= {};

	onChange ??= onChangeDef;

	const tiposLiquidaciones = [
		{ label: "Periodo", value: 0 },
		{ label: "Acta", value: 1 },
	];

	return (
		<Grid
			col
			width="full"
			gap="inherit"
			style={{
				backgroundColor: "#ffffffb3",
				color: "#186090",
				padding: "10px",
				border: "solid 1px",
				borderRadius: "20px",
			}}
		>
			<Grid
				width="full"
				style={{
					fontWeight: "bold",
					borderBottom: "dashed 1px",
				}}
			>
				{errors.data ?? "Datos liquidacion"}
			</Grid>
			<Grid width="full" gap="inherit">
				<SelectMaterial
					name="tipoLiquidacion"
					label="Tipo de liquidación"
					value={data.tipoLiquidacion}
					options={tiposLiquidaciones}
					disabled
				/>
				<DateTimePicker
					type="month"
					label="Período"
					disableFuture
					minDate="1994-01-01"
					maxDate={dayjs().format("YYYY-MM-DD")}
					value={Formato.Mascara(data.periodo, "####-##-01")}
					disabled
				/>
				<DateTimePicker
					type="date"
					label="Fecha de vencimiento"
					value={data.fechaVencimiento}
					disabled
				/>
				<DateTimePicker
					type="date"
					label="Fecha pago estimada"
					minDate={dayjs().format("YYYY-MM-DD")}
					value={data.fechaPagoEstimada}
					disabled={!!disabled.fechaPagoEstimada}
					error={errors.fechaPagoEstimada}
					required
					onChange={(f) =>
						onChange({ fechaPagoEstimada: f?.format("YYYY-MM-DD") })
					}
				/>
				<InputMaterial
					type="number"
					label="% Interes diario Post. Venc."
					value={data.interesesDiariosPosteriorVencimiento}
					disabled={!!disabled.fechaPagoEstimada}
					error={errors.fechaPagoEstimada}
					onChange={(interesesDiariosPosteriorVencimiento) =>
						onChange({ interesesDiariosPosteriorVencimiento })
					}
				/>
			</Grid>
			<Grid width="full" gap="inherit">
				<InputMaterial
					type="number"
					label="Cantidad de trabajadores"
					value={data.cantidadTrabajadores}
					disabled
					// disabled={!!disabled.cantidadTrabajadores}
					// error={!!errors.cantidadTrabajadores}
					// helperText={errors.cantidadTrabajadores}
					// onChange={(value) =>
					// 	onChange({ cantidadTrabajadores: Formato.Entero(value) })
					// }
				/>
				<InputMaterial
					type="number"
					label="Total remuneraciones"
					value={data.totalRemuneraciones}
					disabled
					// disabled={!!disabled.totalRemuneraciones}
					// error={!!errors.totalRemuneraciones}
					// helperText={errors.totalRemuneraciones}
					// onChange={(value) =>
					// 	onChange({ totalRemuneraciones: Formato.Decimal(value) })
					// }
				/>
			</Grid>
			<Grid style={{ fontWeight: "bold" }}>Subtotales</Grid>
			<Grid width="full" gap="inherit">
				<InputMaterial
					label="Total sindical"
					value={Formato.Moneda(data.totalSindical)}
					disabled
				/>
				<InputMaterial
					label="Total solidario"
					value={Formato.Moneda(data.totalSolidario)}
					disabled
				/>
			</Grid>
			<Grid style={{ fontWeight: "bold" }}>Totales</Grid>
			<Grid width="full" gap="inherit">
				<InputMaterial
					label="Aporte"
					value={Formato.Moneda(data.totalAporte)}
					disabled
				/>
				<InputMaterial
					label="Intereses"
					value={Formato.Moneda(data.totalIntereses)}
					disabled
				/>
				<InputMaterial
					label="Total a pagar"
					value={Formato.Moneda(data.totalImporte)}
					disabled
				/>
			</Grid>
			<Grid width="full" justify="end">
				<Grid width="200px">
					<Button
						className="botonAmarillo"
						tarea="Siaru_EmpresaLiquidacionGenera"
						onClick={onGenera}
						disabled={disabled.genera}
					>
						Genera liquidación
					</Button>
				</Grid>
			</Grid>
		</Grid>
	);
};
const ruralidadDef = [
	{ label: "Rural", value: true },
	{ label: "No Rural", value: false },
];
const LiquidacionNomina = ({
	data = {},
	disabled = {},
	errors = {},
	dependencies = {
		establecimientos: [],
		ruralidad: ruralidadDef,
	},
	onChange = onChangeDef,
} = {}) => {
	data ??= {};
	disabled ??= {};
	errors ??= {};

	dependencies ??= {};
	const { establecimientos = [], ruralidad = ruralidadDef } = dependencies;
	const establecimientosOptions = establecimientos.map(
		({ id: value, nombre: label }) => ({ value, label })
	);

	onChange ??= onChangeDef;

	return (
		<Grid
			col
			width="full"
			gap="inherit"
			style={{
				backgroundColor: "#ffffffb3",
				color: "#186090",
				padding: "10px",
				border: "solid 1px",
				borderRadius: "20px",
			}}
		>
			<Grid
				width="full"
				style={{
					fontWeight: "bold",
					borderBottom: "dashed 1px",
				}}
			>
				{[errors.data, `DDJJ seleccionadas: ${data.length}`]
					.filter((r) => r)
					.join(" ")}
			</Grid>
			<Grid width="full" gap="inherit">
				<Grid width="25%">
					<InputMaterial label="CUIL" value={Formato.Cuit(data.cuil)} />
				</Grid>
				<Grid width="50%">
					<InputMaterial label="Nombre" value={data.nombre} />
				</Grid>
				<Grid width="25%">
					<InputMaterial
						label="Remuneración imponible"
						value={Formato.Moneda(data.remuneracionImponible)}
					/>
				</Grid>
			</Grid>
			<Grid width="full" gap="inherit">
				<SelectMaterial
					name="empresaEstablecimientoId"
					label="Establecimiento"
					value={data.empresaEstablecimientoId}
					options={establecimientosOptions}
					disabled={!!disabled.empresaEstablecimientoId}
					onChange={(id) => {
						const establecimiento = establecimientos.find((r) => r.id === id);
						onChange({
							empresaEstablecimientoId: establecimiento.id,
							empresaEstablecimiento_Nombre: establecimiento.nombre,
						});
					}}
				/>
				<SelectMaterial
					name="esRural"
					label="Ruralidad"
					value={data.esRural}
					options={ruralidad}
					disabled={!!disabled.esRural}
					onChange={(esRural) => onChange({ esRural })}
				/>
			</Grid>
		</Grid>
	);
};
//#endregion

const Handler = ({ periodo, tentativas = [] }) => {
	const navigate = useNavigate();

	const empresa = useSelector((state) => state.empresa);
	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);
	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "/Inicio/Empresas" });
	}, [empresa]);

	const [tab, setTab] = useState(0);
	const tabs = [];

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetLiquidacionTipoPago": {
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/v1/LiquidacionesTiposPagos`,
					},
				};
			}
			case "CreateCabecera": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: "/LiquidacionesCabecera",
						method: "POST",
					},
				};
			}
			case "GetCabecera": {
				const { id, ...x } = params;
				params = x;
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesCabecera/${id}`,
						method: "GET",
					},
					params,
				};
			}
			case "GetEstablecimientosByEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
					},
				};
			}
			case "GetParameter": {
				const { paramName, ...paramOthers } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Parametros/${paramName}`,
						method: "GET",
					},
					params: paramOthers,
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region Cargo parametros
	const [params, setParams] = useState({
		loading: "Cargando...",
		data: {
			InteresesDiariosPosteriorVencimiento: 0,
			LiquidacionTipoPagoIdSindical: 0,
			LiquidacionTipoPagoIdSolidario: 0,
		},
		error: {},
	});
	useEffect(() => {
		if (!params.loading) return;
		const pending = Object.keys(params.data);
		const changes = { loading: null, data: { ...params.data }, error: null };
		const formatParamValue = (param, value) => {
			switch (param) {
				case "InteresesDiariosPosteriorVencimiento":
				case "LiquidacionTipoPagoIdSindical":
				case "LiquidacionTipoPagoIdSolidario":
					return Formato.Decimal(value) ?? changes.data[param];
				default:
					return value ?? changes.data[param];
			}
		};
		const queryParam = (param) =>
			pushQuery({
				action: "GetParameter",
				params: { paramName: param },
				onOk: async (res) => {
					changes.data[param] = formatParamValue(param, res.valor);
				},
				onError: async (error) => {
					changes.error ??= {};
					changes.error[param] = error;
				},
				onFinally: async () => {
					pending.splice(pending.indexOf(param), 1);
					if (pending.length) return;
					setParams((o) => ({ ...o, ...changes }));
				},
			});
		pending.forEach((param) => queryParam(param));
	}, [pushQuery, params]);
	//#endregion

	//#region declaracion y carga de tipos de liquidacion
	const [tiposPagos, setTiposPagos] = useState({
		loading: "Cargando...",
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!tiposPagos.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
		};
		pushQuery({
			action: "GetLiquidacionTipoPago",
			onOk: async (data) => {
				if (Array.isArray(data)) {
					changes.data.push(...data);
				} else {
					console.error("Se esperaba un arreglo", data);
				}
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => setTiposPagos((o) => ({ ...o, ...changes })),
		});
	}, [pushQuery, tiposPagos]);
	//#endregion

	//#region Cargo establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: "Cargando...",
		params: { empresaId: empresa?.id, bajas: false },
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!establecimientos.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
		};
		const query = {
			action: "GetEstablecimientosByEmpresa",
			params: establecimientos.params,
		};
		query.onOk = async ({ index, size, pages, data }) => {
			if (Array.isArray(data)) {
				changes.data.push(...data);
			} else {
				console.error("Se esperaba un arreglo", data);
			}
			if (index < pages) {
				changes.loading = "Cargando...";
				query.params = {
					...establecimientos.params,
					pageIndex: index + 1,
					pageSize: size,
				};
				pushQuery(query);
			} else {
				changes.loading = null;
			}
		};
		query.onError = async (error) => {
			changes.loading = null;
			changes.error = error;
		};
		query.onFinally = async () => {
			if (changes.loading) return;
			changes.data.unshift({ id: 0, nombre: "Sin establecimiento" });
			setEstablecimientos((o) => ({ ...o, ...changes }));
		};
		pushQuery(query);
	}, [establecimientos, pushQuery]);
	//#endregion

	//#region Cargo estado
	const [estado, setEstado] = useState({
		loading: "Cargando...",
		processing: null,
		cabecera: {
			empresaCUIT: empresa.cuit,
			tipoLiquidacion: 0,
			periodo,
			acta: 0,
			rectificativa: 0,
			fechaVencimiento: dayjs(Formato.Mascara(periodo, "####-##-15"))
				.add(1, "month")
				.format("YYYY-MM-DD"),
			fechaPagoEstimada: dayjs().format("YYYY-MM-DD"),
			interesesDiariosPosteriorVencimiento: 0,
			diasVencimiento: 0,
			cantidadTrabajadores: 0,
			totalRemuneraciones: 0,
			totalAporte: 0,
			totalIntereses: 0,
			totalImporte: 0,
			totalSindical: 0,
			totalSolidario: 0,
			liquidaciones: [],
		},
		liquidaciones: {
			todas: [],
			lastId: 0,
			tipoPagoSindical: { id: 0, porcentaje: 0 },
			tipoPagoSolidario: { id: 0, porcentaje: 0 },
			retocadas: [],
		},
		nominas: {
			todas: [],
			sinEstablecimiento: 0,
			ruralesSinEstablecimiento: 0,
			cantidadTrabajadores: 0,
			totalRemuneraciones: 0,
		},
	});
	useEffect(() => {
		if (!estado.loading) return;
		if (params.loading) return;
		if (tiposPagos.loading) return;
		const getTipoPago = (id = 0, base = {}) => {
			id = Number(id);
			return tiposPagos.data.find((r) => r.id === id) ?? { ...base, id };
		};
		const changes = {
			...estado,
			loading: null,
			processing: "Calculando...",
			cabecera: {
				...estado.cabecera,
				interesesDiariosPosteriorVencimiento:
					params.data.InteresesDiariosPosteriorVencimiento ?? 0,
			},
			liquidaciones: {
				...estado.liquidaciones,
				todas: [],
				lastId: 0,
				tipoPagoSindical: getTipoPago(
					params.data.LiquidacionTipoPagoIdSindical,
					estado.liquidaciones.tipoPagoSindical
				),
				tipoPagoSolidario: getTipoPago(
					params.data.LiquidacionTipoPagoIdSolidario,
					estado.liquidaciones.tipoPagoSolidario
				),
			},
			nominas: {
				...estado.nominas,
				todas: [],
				sinEstablecimiento: 0,
				ruralesSinEstablecimiento: 0,
				cantidadTrabajadores: 0,
				totalRemuneraciones: 0,
			},
		};
		tentativas.forEach((tentativa) => {
			// Si tiene establecimiento y tipo de pago, entonces es una sugerencia de liquidacion válida
			// En caso contrario, es solo a modo informativo de nomina
			const nominas = AsArray(tentativa.nominas);
			nominas.forEach((nomina) => {
				changes.nominas.todas.push({
					...nomina,
					id: nomina.cuil,
					esRural: !!nomina.esRural,
					afiliadoId: nomina.afiliadoId ?? 0,
					empresaEstablecimientoId: tentativa.empresaEstablecimientoId,
					empresaEstablecimiento_Nombre:
						tentativa.empresaEstablecimiento_Nombre,
				});
			});
		});
		setEstado(changes);
	}, [estado, params, tiposPagos, tentativas]);
	//#endregion

	//#region Calculo estado
	useEffect(() => {
		if (!estado.processing) return;

		//Genero Cabecera
		const cabecera = {
			interesesDiariosPosteriorVencimiento:
				estado.cabecera.interesesDiariosPosteriorVencimiento,
			diasVencimiento: RangoDias(
				estado.cabecera.fechaVencimiento,
				estado.cabecera.fechaPagoEstimada
			),
			cantidadTrabajadores: 0,
			totalRemuneraciones: 0,
			totalAporte: 0,
			totalIntereses: 0,
			totalImporte: 0,
			totalSindical: 0,
			totalSolidario: 0,
			liquidaciones: [],
		};

		// Genero liquidaciones a partir de nominas
		const liquidaciones = {
			...estado.liquidaciones,
			todas: [],
			retocadas: [],
		};

		const retocadas = estado.liquidaciones.retocadas.filter(
			(v, i, a) =>
				estado.liquidaciones.todas.find(({ id }) => v.id === id) &&
				a.map(({ id }) => id).indexOf(v.id) === i
		);

		let sinEstablecimiento = 0;
		let ruralesSinEstablecimiento = 0
		let cantidadTrabajadores = 0;
		let totalRemuneraciones = 0;
		estado.nominas.todas.forEach((nomina) => {
			if (!nomina.empresaEstablecimientoId) {
				sinEstablecimiento += 1;
				if (nomina.esRural) ruralesSinEstablecimiento += 1;
			}
			cantidadTrabajadores += 1;
			totalRemuneraciones += nomina.remuneracionImponible ?? 0;

			if (!nomina.empresaEstablecimientoId) return;
			if (!nomina.esRural) return;

			const tipoPago = nomina.afiliadoId
				? liquidaciones.tipoPagoSindical
				: liquidaciones.tipoPagoSolidario;

			let liquidacionAntes = estado.liquidaciones.todas.find(
				(r) =>
					r.empresaEstablecimientoId === nomina.empresaEstablecimientoId &&
					r.liquidacionTipoPagoId === tipoPago.id
			);
			let liquidacion = {
				id: Number(liquidacionAntes?.id ?? 0),
				empresaEstablecimientoId: Number(nomina.empresaEstablecimientoId),
				empresaEstablecimiento_Descripcion:
					nomina.empresaEstablecimiento_Nombre,
				liquidacionTipoPagoId: tipoPago.id,
				cantidadTrabajadores: 0,
				totalRemuneraciones: 0,
				interesPorcentaje: Number(tipoPago.porcentaje),
				interesNeto: 0,
				tipoLiquidacion: 0,
				nominas: [],
			};
			const liqFind = liquidaciones.todas.find(
					(r) =>
						r.empresaEstablecimientoId ===
							liquidacion.empresaEstablecimientoId &&
						r.liquidacionTipoPagoId === liquidacion.liquidacionTipoPagoId
				)
			if (liqFind != null) liquidacion = liqFind;
			if (!liquidacion.id) {
				liquidaciones.lastId += 1;
				liquidacion.id = liquidaciones.lastId;
			}
			liquidacion.nominas.push(nomina);

			const retocada = retocadas.find(({id}) => id === liquidacion.id);

			liquidacion.cantidadTrabajadores += 1;
			liquidacion.cantidadTrabajadores = Round(retocada?.cantidadTrabajadores ?? liquidacion.cantidadTrabajadores);
			liquidacion.totalRemuneraciones += Number(nomina.remuneracionImponible);
			liquidacion.totalRemuneraciones = Round(retocada?.totalRemuneraciones ?? liquidacion.totalRemuneraciones, 2);
			liquidacion.interesPorcentaje = Round(retocada?.interesPorcentaje ?? liquidacion.interesPorcentaje, 2);

			const calculos = calculosLiquidacion({ liquidacion, cabecera });
			liquidacion.interesNeto = calculos.interesNeto;
			liquidacion.interesImporte = calculos.interesImporte;
			liquidacion.importeTotal = calculos.importeTotal;

			if (liqFind == null) {
				liquidaciones.todas.push(liquidacion);
				if (retocada) liquidaciones.retocadas.push(retocada);
			}
		});

		liquidaciones.todas
			.filter(({ id }) =>
				estado.cabecera.liquidaciones.find((r) => r.id === id)
			)
			.forEach((liquidacion) => {
				cabecera.cantidadTrabajadores += liquidacion.cantidadTrabajadores;
				cabecera.totalRemuneraciones += liquidacion.totalRemuneraciones;
				cabecera.totalAporte += liquidacion.interesNeto;
				cabecera.totalIntereses += liquidacion.interesImporte;
				cabecera.totalImporte += liquidacion.importeTotal;

				switch (liquidacion.liquidacionTipoPagoId) {
					case liquidaciones.tipoPagoSindical.id: {
						cabecera.totalSindical += liquidacion.importeTotal;
						break;
					}
					case liquidaciones.tipoPagoSolidario.id: {
						cabecera.totalSolidario += liquidacion.importeTotal;
						break;
					}
					default:
						break;
				}
				cabecera.liquidaciones.push(liquidacion);
			});
		cabecera.cantidadTrabajadores = Round(cabecera.cantidadTrabajadores);
		cabecera.totalRemuneraciones = Round(cabecera.totalRemuneraciones, 2);
		cabecera.totalAporte = Round(cabecera.totalAporte, 2);
		cabecera.totalIntereses = Round(cabecera.totalIntereses, 2);
		cabecera.totalImporte = Round(cabecera.totalImporte, 2);
		cabecera.totalSindical = Round(cabecera.totalSindical, 2);
		cabecera.totalSolidario = Round(cabecera.totalSolidario, 2);

		totalRemuneraciones = Round(totalRemuneraciones, 2);
		
		setEstado((o) => ({
			...o,
			processing: null,
			cabecera: { ...o.cabecera, ...cabecera },
			nominas: {
				...o.nominas,
				sinEstablecimiento,
				ruralesSinEstablecimiento,
				cantidadTrabajadores,
				totalRemuneraciones,
			},
			liquidaciones: {
				...o.liquidaciones,
				...liquidaciones,
			},
		}));
	}, [estado]);
	//#endregion

	const leyendas = (
		<>
			<Grid width="full" style={{ color: "blue" }}>
				{[
					"Cantidad de trabajadores:",
					estado.nominas.cantidadTrabajadores,
				].join(" ")}
			</Grid>
			<Grid width="full" style={{ color: "blue" }}>
				{[
					"Total remuneraciones:",
					Formato.Moneda(estado.nominas.totalRemuneraciones),
				].join(" ")}
			</Grid>
			{estado.nominas.ruralesSinEstablecimiento ? (
				<Grid width="full" style={{ color: "red" }}>
					{[
						"No es posible generar la liquidación",
						`porque existen (${estado.nominas.ruralesSinEstablecimiento})`,
						"empleados Rurales que no tienen establecimiento asignado",
					].join(" ")}
				</Grid>
			) : null}
		</>
	)

	//#region Tab Nominas
	const {
		render: liqNomRender,
		request: liqNomChanger,
		selected: liqNomSel,
	} = useLiquidacionesNomina({
		remote: false,
		multi: true,
		hideSelectColumn: false,
		mostrarBuscar: true,
		columns: [
			{ dataField: "cuil" },
			{ dataField: "nombre" },
			{
				dataField: "empresaEstablecimiento_Nombre",
				text: "Establecimiento",
				sort: true,
				style: { textAlign: "left" },
			},
			{ dataField: "esRural" },
			{ dataField: "afiliadoId" },
			{ dataField: "remuneracionImponible" },
		],
	});
	const liqNomEdit = JoinOjects(liqNomSel, {
		length: liqNomSel?.length ?? 0,
	});
	liqNomEdit.empresaEstablecimientoId ??= "";
	liqNomEdit.esRural ??= "";
	useEffect(() => {
		liqNomChanger("list", { data: estado.nominas.todas });
	}, [liqNomChanger, estado.nominas.todas]);

	tabs.push({
		header: () => <Tab label="Nomina" />,
		body: () => (
			<Grid col full gap="inherit">
				<Grid col width="full">
					{liqNomRender()}
				</Grid>
				{leyendas}
				<Grid col full="width" gap="inherit">
					<LiquidacionNomina
						data={liqNomEdit}
						dependencies={{ establecimientos: establecimientos.data }}
						onChange={(changes) => {
							if (!liqNomEdit.length) return;
							setEstado((o) => {
								const todas = [...o.nominas.todas];
								liqNomSel?.forEach((s) => {
									const nomina = todas.find((r) => r.id === s.id);
									if (nomina == null) return;
									todas.splice(todas.indexOf(nomina), 1, {
										...nomina,
										...changes,
									});
								});
								return {
									...o,
									processing: "Calculando...",
									nominas: { ...o.nominas, todas },
								};
							});
						}}
					/>
				</Grid>
			</Grid>
		),
	});
	//#endregion

	//#region Tab Liquidacion
	const {
		render: liqRender,
		request: liqChanger,
		selected: liqSel,
	} = useLiquidaciones({
		remote: false,
		multi: true,
		hideSelectColumn: false,
		columns: (def, { request }) => [
			...def,
			{
				dataField: "_acciones",
				text: "Acciones",
				isDummyField: true,
				formatter: () => (
					<Button className="botonAmarillo" style={{ padding: 0 }} tarea="Siaru_EmpresaRuralidadModifica">
						Modifica
					</Button>
				),
				headerStyle: { width: "110px" },
				events: {
					onClick: (e, column, columnIndex, row, rowIndex) => {
						e.stopPropagation();
						request("selected", {
							request: "M",
							record: row,
							action: "Genera liquidacion",
						});
					},
				},
			},
		],
		onDataChange: (data) =>
			setEstado((o) => ({
				...o,
				processing: "Calculando...",
				liquidaciones: {
					...o.liquidaciones,
					todas: data,
					retocadas: data
						.map((actual) => {
							const previa = o.liquidaciones.todas.find(
								({ id }) => id === actual.id
							);
							let retocada = o.liquidaciones.retocadas.find(
								({ id }) => id === actual.id
							);

							if (
								!previa ||
								(previa.cantidadTrabajadores === actual.cantidadTrabajadores &&
									previa.totalRemuneraciones === actual.totalRemuneraciones &&
									previa.interesPorcentaje === actual.interesPorcentaje)
							)
								return retocada;

							retocada ??= { id: actual.id };

							if (previa.cantidadTrabajadores !== actual.cantidadTrabajadores)
								retocada.cantidadTrabajadores = actual.cantidadTrabajadores;

							if (previa.totalRemuneraciones !== actual.totalRemuneraciones)
								retocada.totalRemuneraciones = actual.totalRemuneraciones;

							if (previa.interesPorcentaje !== actual.interesPorcentaje)
								retocada.interesPorcentaje = actual.interesPorcentaje;

							return retocada;
						})
						.filter((v, i, a) => v && a.indexOf(v) === i),
				},
			})),
		onEditChange: ({ edit, changes }) => {
			if (!("interesPorcentaje" in changes || "totalRemuneraciones" in changes))
				return true;
			
			const liquidacion = { ...edit, ...changes };
			const cabecera = { ...estado.cabecera };

			const calculos = calculosLiquidacion({ liquidacion, cabecera });
			changes.interesNeto = calculos.interesNeto;
			changes.interesImporte = calculos.interesImporte;
			changes.importeTotal = calculos.importeTotal;

			return true;
		},
	});
	useEffect(() => {
		liqChanger("list", { data: estado.liquidaciones.todas });
	}, [liqChanger, estado.liquidaciones.todas]);

	//#region Cambio seleccion, reproceso cabecera
	useEffect(() => {
		const liquidaciones = liqSel ?? [];
		const process = () => {
			setEstado((o) => ({
				...o,
				processing: "Calculando...",
				cabecera: { ...o.cabecera, liquidaciones },
			}));
		};

		if (estado.processing) return;

		const viejo = estado.cabecera.liquidaciones.map((r) => r.id);
		const nuevo = liquidaciones.map((r) => r.id);

		if (viejo.length !== nuevo.length) return process();
		if (viejo.filter((r) => !nuevo.includes(r)).length) return process();
	}, [liqSel, estado]);
	//#endregion

	const [liqCab, setLiqCab] = useState({
		loading: null,
		body: null,
		imprime: null,
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!liqCab.loading) return;
		const changes = { loading: null, data: null, error: null };

		// pushQuery({
		// 	action: "GetCabecera",
		// 	params: { id: 7 },
		// 	onOk: async (data) => (changes.data = data),
		// 	onError: async (error) => (changes.error = error),
		// 	onFinally: async () => setLiqCab((o) => ({ ...o, ...changes })),
		// });
		
		pushQuery({
			action: "CreateCabecera",
			config: { body: liqCab.body },
			onOk: async (data) => (changes.data = data),
			onError: async (error) => (changes.error = error),
			onFinally: async () => setLiqCab((o) => ({ ...o, ...changes })),
		});
	}, [liqCab, pushQuery]);

	tabs.push({
		header: () => <Tab label="Liquidacion" />,
		body: () => (
			<Grid col width="full" gap="inherit">
				<Grid width="full">{liqRender()}</Grid>
				{leyendas}
				<Grid col full="width" gap="inherit">
					<LiquidacionCabecera
						data={estado.cabecera}
						disabled={{
							genera:
								!estado.cabecera.liquidaciones?.length ||
								!!estado.nominas.ruralesSinEstablecimiento,
						}}
						onChange={(changes) =>
							setEstado((o) => ({
								...o,
								processing: "Calculando...",
								cabecera: { ...o.cabecera, ...changes },
							}))
						}
						onGenera={() =>
							setLiqCab((o) => ({
								...o,
								loading: "Cargando...",
								body: estado.cabecera,
							}))
						}
					/>
				</Grid>
				{!liqCab.data ? null : (
					<FormaPagoPrint
						liquidacionCabecera={liqCab.data}
						onClose={() =>
							setRedirect({ to: "/Inicio/Empresas/Liquidaciones" })
						}
					/>
				)}
			</Grid>
		),
	});
	//#endregion

	return (
		<Grid col full gap="15px">
			<Grid full="width">
				<h2 className="subtitulo" style={{ margin: 0 }}>
					Liquidar periodo {Formato.Periodo(periodo)} de
					{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""}`}
				</h2>
			</Grid>
			<Grid width="full">
				<Tabs value={tab} onChange={(_, v) => setTab(v)}>
					{tabs.map((r) => r.header())}
				</Tabs>
			</Grid>
			{tabs[tab].body()}
		</Grid>
	);
};

export default Handler;
