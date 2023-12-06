import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Tabs, Tab } from "@mui/material";
import { Modal } from "react-bootstrap";
import useQueryQueue from "components/hooks/useQueryQueue";
import AsArray from "components/helpers/AsArray";
import Formato from "components/helpers/Formato";
import Round from "components/helpers/Round";
import UseKeyPress from "components/helpers/UseKeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import InputMaterial from "components/ui/Input/InputMaterial";
import useLiquidacionesNomina from "./useLiquidacionesNomina";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const LiquidacionesForm = ({
	data = {},
	cabecera = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	cabecera ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	const empresa = useSelector((state) => state.empresa);
	if (empresa?.id == null) onClose();

	const nominas = AsArray(data.nominas);
	
	//#region Inicializacion campos calculados
	if (data.cantidadTrabajadores == null && nominas.length) {
		onChange({ cantidadTrabajadores: nominas.lenght });
	}

	if (data.totalRemuneraciones == null && nominas.lenght) {
		let totalRemuneraciones = 0;
		nominas.forEach((r) => (totalRemuneraciones += r.totalRemuneraciones ?? 0));
		totalRemuneraciones = Round(totalRemuneraciones, 2);
		onChange({ totalRemuneraciones });
	}
	//#endregion

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action) => {
		switch (action) {
			case "GetEstablecimientosByEmpresa": {
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
					},
				};
			}
			case "GetLiquidacionesTiposPago": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/v1/LiquidacionesTiposPagos`,
						method: "GET",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region Cargo establecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: "Cargando...",
		params: { empresaId: empresa?.id /*, bajas: false*/ },
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
				changes.data.push(
					...data.map(({ nombre, deletedDate, id }) => ({
						label: [nombre, deletedDate ? "Establecimiento de baja" : ""]
							.filter((r) => r)
							.join(" - "),
						value: id,
					}))
				);
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
				pushQuery({...query});
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
			setEstablecimientos((o) => ({ ...o, ...changes }));
		};
		pushQuery(query);
	}, [establecimientos, pushQuery]);
	//#endregion

	//#region Cargo tipos pago
	const [tiposPago, setTiposPago] = useState({
		loading: "Cargando...",
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!tiposPago.loading) return;
		const changes = {
			loading: null,
			data: [],
			error: null,
		};
		pushQuery({
			action: "GetLiquidacionesTiposPago",
			onOk: async (data) => {
				if (Array.isArray(data)) {
					changes.data.push(
						...data.map(({ descripcion, id }) => ({
							label: descripcion,
							value: id,
						}))
					);
				} else {
					console.error("Se esperaba un arreglo", data);
				}
			},
			onError: async (error) => (changes.error = error),
			onFinally: async () => {
				if (changes.loading) return;
				setTiposPago((o) => ({ ...o, ...changes }));
			},
		});
	}, [pushQuery, tiposPago]);
	//#endregion

	const [tab, setTab] = useState(0);
	const tabs = [];

	//#region Tab Datos generales
	tabs.push({
		header: () => <Tab label="Datos generales" />,
		body: () => (
			<>
				<Grid width="full">
					{hide.empresaEstablecimientoId ? null : (
						<SelectMaterial
							name="empresaEstablecimientoId"
							label="Establecimiento"
							value={data.empresaEstablecimientoId ?? 0}
							error={
								!!(errors.empresaEstablecimientoId || establecimientos.error)
							}
							helperText={[
								errors.empresaEstablecimientoId,
								establecimientos.loading,
								establecimientos.error,
							]
								.filter((r) => r)
								.join(" ")}
							options={establecimientos.data}
							disabled={!!disabled.empresaEstablecimientoId}
							onChange={(empresaEstablecimientoId) =>
								onChange({ empresaEstablecimientoId })
							}
						/>
					)}
				</Grid>
				<Grid width="full" gap="inherit">
					<Grid width="full">
						{hide.liquidacionTipoPagoId ? null : (
							<SelectMaterial
								name="liquidacionTipoPagoId"
								label="Tipo de pago"
								value={data.liquidacionTipoPagoId ?? 0}
								error={!!(errors.liquidacionTipoPagoId || tiposPago.error)}
								helperText={[
									errors.liquidacionTipoPagoId,
									tiposPago.loading,
									tiposPago.error,
								]
									.filter((r) => r)
									.join(" ")}
								options={tiposPago.data}
								disabled={!!disabled.liquidacionTipoPagoId}
								onChange={(liquidacionTipoPagoId) =>
									onChange({ liquidacionTipoPagoId })
								}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.interesPorcentaje ? null : (
							<InputMaterial
								type="number"
								label="% interes tipo de pago"
								value={data.interesPorcentaje}
								error={!!errors.interesPorcentaje}
								helperText={errors.interesPorcentaje}
								disabled={!!disabled.interesPorcentaje}
								onChange={(value) =>
									onChange({ interesPorcentaje: Formato.Decimal(value) })
								}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.cantidadTrabajadores ? null : (
							<InputMaterial
								type="number"
								label="Cantidad de trabajadores"
								value={data.cantidadTrabajadores}
								error={!!errors.cantidadTrabajadores}
								helperText={errors.cantidadTrabajadores}
								disabled={!!disabled.cantidadTrabajadores}
								onChange={(value) =>
									onChange({ cantidadTrabajadores: Formato.Entero(value) })
								}
							/>
						)}
					</Grid>
					<Grid width="full">
						{hide.totalRemuneraciones ? null : (
							<InputMaterial
								type="number"
								label="Total remuneraciones"
								value={data.totalRemuneraciones}
								error={!!errors.totalRemuneraciones}
								helperText={errors.totalRemuneraciones}
								disabled={!!disabled.totalRemuneraciones}
								onChange={(value) =>
									onChange({ totalRemuneraciones: Formato.Decimal(value) })
								}
							/>
						)}
					</Grid>
				</Grid>
				<Grid width="full" gap="inherit">
					<h4>Subtotales</h4>
				</Grid>
				<Grid width="full" gap="inherit">
					<Grid width="full">
						<InputMaterial
							label="Aporte"
							value={Formato.Moneda(data.interesNeto)}
							disabled
						/>
					</Grid>
					<Grid width="full">
						<InputMaterial
							label="Intereses"
							value={Formato.Moneda(data.interesImporte)}
							disabled
						/>
					</Grid>
					<Grid width="full">
						<InputMaterial
							label="Total a pagar"
							value={Formato.Moneda(data.importeTotal)}
							disabled
						/>
					</Grid>
				</Grid>
			</>
		),
		// actions: [],
	});
	//#endregion

	//#region Tab Nomina
	const { render: liqNomRender, request: liqNomChanger/*, selected: liqNomSelected*/ } =
		useLiquidacionesNomina({
			remote: false,
			data: nominas,
		});
	useEffect(() => {
		liqNomChanger("list");
	}, [liqNomChanger]);

	tabs.push({
		header: () => <Tab label="Nomina" />,
		body: () => liqNomRender(),
		// actions: [],
	});
	//#endregion

	return (
		<Modal size="xl" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				<Grid col width="full" gap="5px">
					<Grid>{title}</Grid>
					<Grid gap="inherit">
						<Grid>
							<h5 style={{ margin: "0" }}>Empresa</h5>
						</Grid>
						<Grid>{Formato.Cuit(empresa.cuit)}</Grid>
						<Grid>{empresa.razonSocial}</Grid>
					</Grid>
				</Grid>
			</Modal.Header>
			<Modal.Body>
				<Grid col width="full" gap="15px">
					<Grid width="full">
						<Tabs value={tab} onChange={(_, v) => setTab(v)}>
							{tabs.map((r) => r.header())}
						</Tabs>
					</Grid>
					<Grid col width="full" gap="inherit">
						{tabs.at(tab)?.body()}
					</Grid>
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

export default LiquidacionesForm;
