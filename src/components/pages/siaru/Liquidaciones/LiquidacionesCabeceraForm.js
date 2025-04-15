import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Modal } from "react-bootstrap";
import { Tab, Tabs } from "@mui/material";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Round from "components/helpers/Round";
import UseKeyPress from "components/helpers/UseKeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";
import Button from "components/ui/Button/Button";
import DateTimePicker from "components/ui/DateTimePicker/DateTimePicker";
import Grid from "components/ui/Grid/Grid";
import InputMaterial, { EnteroMask, InteresesMask, PesosMask } from "components/ui/Input/InputMaterial";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import useLiquidaciones from "./useLiquidaciones";
import useLiquidacionesNomina from "./useLiquidacionesNomina";
import useCalculoResarcitorios from "components/hooks/useCalculoResarcitorios";

const dependeciesDef = {
	motivosBaja: {
		loading: "",
		data: [{ label: "", value: 0 }],
		error: null,
	},
};
const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const LiquidacionesCabeceraForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	dependecies = dependeciesDef,
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	const { calculo: calculoResarcitorios } = useCalculoResarcitorios();

	data ??= {};
	data.totalImporte = Round(
		(data.totalAporte ?? 0) + (data.totalIntereses ?? 0),
		2
	);

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	dependecies ??= {};
	dependecies = dependecies === dependeciesDef ? {} : { ...dependecies };

	dependecies.motivosBaja ??= { data: [] };
	const motivosBaja = dependecies.motivosBaja;

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	const tiposLiquidaciones = [
		{ label: "Periodo", value: 0 },
		{ label: "Acta", value: 1 },
	];

	const [tab, setTab] = useState(0);
	const tabs = [];

	//#region Cabecera
	tabs.push({
		header: () => <Tab label="Liquidacion" />,
		body: () => (
			<Grid col full gap="inherit">
				<Grid width="full" gap="inherit">
					<Grid width="full">
						{hide.tipoLiquidacion ? null : (
							<SelectMaterial
								name="tipoLiquidacion"
								label="Tipo de liquidación"
								value={data.tipoLiquidacion ?? 0}
								options={tiposLiquidaciones}
								error={errors.tipoLiquidacion}
								disabled={disabled.tipoLiquidacion}
								onChange={(tipoLiquidacion) => onChange({ tipoLiquidacion })}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.periodo ? null : (
							<DateTimePicker
								type="month"
								label="Período"
								value={Formato.Mascara(data.periodo, "####-##-01")}
								minDate="1994-01-01"
								maxDate={dayjs().format("YYYY-MM-DD")}
								disableFuture
								disabled={disabled.periodo}
								onChange={(f) =>
									onChange({ periodo: Formato.Entero(f?.format("YYYYMM")) })
								}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.fechaVencimiento ? null : (
							<DateTimePicker
								type="date"
								label="Fecha de vencimiento"
								value={data.fechaVencimiento}
								minDate={dayjs().format("YYYY-MM-DD")}
								disabled={disabled.fechaVencimiento}
								onChange={(f) => {
									const changes = {
										fechaVencimiento: f?.format("YYYY-MM-DD"),
										totalIntereses: 0,
										diasVencimiento: 0,
									};
									calculoResarcitorios(changes.fechaVencimiento, data.fechaPagoEstimada, data.totalAporte ?? 0)
										.forEach(({ interes, dias }) => {
											changes.totalIntereses += interes;
											changes.diasVencimiento += dias;
										});
									changes.totalIntereses = Round(changes.totalIntereses, 2);
									changes.diasVencimiento = Round(changes.diasVencimiento);
									changes.liquidaciones = AsArray(data.liquidaciones).map(
										(l) => {
											const r = { ...l, interesImporte: 0 };
											calculoResarcitorios(changes.fechaVencimiento, data.fechaPagoEstimada, r.interesNeto ?? 0)
												.forEach(({ interes }) => r.interesImporte += interes);
											r.interesImporte = Round(r.interesImporte, 2);
											r.importeTotal = Round((r.interesNeto ?? 0) + r.interesImporte, 2);
											return r;
										}
									);
									onChange(changes);
								}}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.fechaPagoEstimada ? null : (
							<DateTimePicker
								type="date"
								label="Fecha pago estimada"
								value={data.fechaPagoEstimada}
								minDate={dayjs().format("YYYY-MM-DD")}
								disabled={disabled.fechaPagoEstimada}
								onChange={(f) => {
									const changes = {
										fechaPagoEstimada: f?.format("YYYY-MM-DD"),
										totalIntereses: 0,
										diasVencimiento: 0,
									};
									calculoResarcitorios(data.fechaVencimiento, changes.fechaPagoEstimada, data.totalAporte ?? 0)
										.forEach(({ interes, dias }) => {
											changes.totalIntereses += interes;
											changes.diasVencimiento += dias;
										});
									changes.totalIntereses = Round(changes.totalIntereses, 2);
									changes.diasVencimiento = Round(changes.diasVencimiento);
									changes.liquidaciones = AsArray(data.liquidaciones).map(
										(l) => {
											const r = { ...l, interesImporte: 0 };
											calculoResarcitorios(data.fechaVencimiento, changes.fechaPagoEstimada, r.interesNeto ?? 0)
												.forEach(({ interes }) => r.interesImporte += interes);
											r.interesImporte = Round(r.interesImporte, 2);
											r.importeTotal = Round((r.interesNeto ?? 0) + r.interesImporte, 2);
											return r;
										}
									);
									onChange(changes);
								}}
							/>
						)}
					</Grid>
				</Grid>
				<Grid width="full" gap="inherit">
					<Grid width="full">
						{hide.cantidadTrabajadores ? null : (
							<InputMaterial
								label="Cantidad de trabajadores"
								value={data.cantidadTrabajadores}
								disabled={!!disabled.cantidadTrabajadores}
								error={!!errors.cantidadTrabajadores}
								helperText={errors.cantidadTrabajadores}
								mask={EnteroMask}
								onChange={(cantidadTrabajadores) => onChange({ cantidadTrabajadores })}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.totalRemuneraciones ? null : (
							<InputMaterial
								label="Total remuneraciones"
								value={data.totalRemuneraciones}
								disabled={!!disabled.totalRemuneraciones}
								error={!!errors.totalRemuneraciones}
								helperText={errors.totalRemuneraciones}
								mask={PesosMask}
								onChange={(value) => onChange({ totalRemuneraciones: Number(value) })}
							/>
						)}
					</Grid>
				</Grid>
				{/* <Grid style={{ fontWeight: "bold" }}>Subtotales</Grid>
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
				<Grid style={{ fontWeight: "bold" }}>Totales</Grid> */}
				<Grid width="full" gap="inherit">
					<Grid width="full">
						{hide.totalAporte ? null : (
							<InputMaterial
								label="Aporte"
								value={data.totalAporte}
								disabled={!!disabled.totalAporte}
								error={!!errors.totalAporte}
								helperText={errors.totalAporte}
								mask={PesosMask}
								onChange={(value) => onChange({ totalAporte: Number(value) })}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.totalIntereses ? null : (
							<InputMaterial
								label="Intereses"
								value={data.totalIntereses}
								disabled={!!disabled.totalIntereses}
								error={!!errors.totalIntereses}
								helperText={errors.totalIntereses}
								mask={InteresesMask}
								onChange={(value) => onChange({ totalIntereses: Number(value) })}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.totalImporte ? null : (
							<InputMaterial
								label="Total a pagar"
								value={data.totalImporte}
								disabled={!!disabled.totalImporte}
								error={!!errors.totalImporte}
								helperText={errors.totalImporte}
								mask={PesosMask}
								onChange={(value) => onChange({ totalImporte: Number(value) })}
							/>
						)}
					</Grid>
				</Grid>
				<Grid col width="full" gap="inherit">
					<Grid width="full" gap="inherit">
						{hide.refMotivoBajaId ? null : (
							<SelectMaterial
								name="refMotivoBajaId"
								label="Motivo de baja"
								options={motivosBaja.data}
								value={data.refMotivoBajaId ?? 0}
								error={
									motivosBaja.loading ??
									motivosBaja.error?.message ??
									errors.refMotivoBajaId ??
									""
								}
								disabled={disabled.refMotivoBajaId}
								onChange={(refMotivoBajaId) => onChange({ refMotivoBajaId })}
							/>
						)}
					</Grid>
					<Grid width="full" gap="inherit">
						{hide.deletedObs ? null : (
							<InputMaterial
								label="Observaciones de baja"
								value={data.deletedObs}
								disabled={!!disabled.deletedObs}
								error={!!errors.deletedObs}
								helperText={errors.deletedObs}
								onChange={(deletedObs) => onChange({ deletedObs })}
							/>
						)}
					</Grid>
				</Grid>
			</Grid>
		),
	});
	//#endregion

	//#region Liquidaciones
	const { render: liqRender, request: liqRequest, selected: liqSelected } = useLiquidaciones({
		remote: false,
		columns: (def) => [
			...def,
			{
				dataField: "interesImporte",
				text: "Total Intereses",
				formatter: (v) => Formato.Moneda(v),
				headerStyle: { width: "150px" },
				style: { textAlign: "right" },
			},
		],
	});
	useEffect(() => {
		liqRequest("list", { data: AsArray(data.liquidaciones) });
	}, [liqRequest, data.liquidaciones]);

	//#region Nominas
	const { render: nomRender, request: nomRequest } = useLiquidacionesNomina({
		remote: false,
	});
	useEffect(() => {
		nomRequest("list", { data: AsArray(liqSelected?.nominas) });
	}, [nomRequest, liqSelected]);
	//#endregion

	tabs.push({
		header: () => <Tab label="Establecimientos" />,
		body: () => (
			<Grid col full gap="inherit">
				{liqRender()}
				{nomRender()}
			</Grid>
		),
	});
	//#endregion

	return (
		<Modal size="xl" centered show >
			<Modal.Header className={modalCss.modalCabecera} closeButton>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full">
						<Tabs value={tab} onChange={(_, v) => setTab(v)}>
							{tabs.map((r) => r.header())}
						</Tabs>
					</Grid>
					{tabs[tab].body()}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid gap="20px">
					<Grid width="150px">
						<Button className="botonAzul" onClick={() => onClose(true)}>
							CONFIRMA
						</Button>
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={() => onClose()}>
							CANCELA
						</Button>
					</Grid>
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default LiquidacionesCabeceraForm;
