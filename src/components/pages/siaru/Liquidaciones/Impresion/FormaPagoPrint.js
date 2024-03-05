import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";
import FormaPagoViewer0 from "./0/FormaPagoViewer";
import FormaPagoViewer1 from "./1/FormaPagoViewer";
import dayjs from "dayjs";
import Formato from "components/helpers/Formato";

const onCloseDef = () => {};
/**
 *
 * @param {object} props
 * @param {object} props.liquidacionCabecera
 * @param {onCloseDef} props.onClose
 * @returns
 */
const FormaPagoPrint = ({ liquidacionCabecera, onClose = onCloseDef }) => {
	//#region configuraciones API
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetFormasPago": {
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefFormasPago`,
						method: "GET",
					},
				};
			}
			case "GetLiquidacionFormasPago": {
				const { liquidacionCabeceraId, ...others } = params;
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesFormasPago/LiqCabId/${liquidacionCabeceraId}`,
						method: "GET",
					},
					params: others,
				};
			}
			case "CreateLiquidacionFormasPago": {
				return {
					config: {
						baseURL: "SIARU",
						endpoint: `/LiquidacionesFormasPago`,
						method: "POST",
					},
				};
			}
			default:
				return null;
		}
	});
	//#endregion configuraciones API

	const sinFechaVencimiento = liquidacionCabecera.fechaVencimiento == null;
	const vencido = sinFechaVencimiento || dayjs(liquidacionCabecera.fechaVencimiento) < dayjs();

	//#region dependencias

	//#region formasPago
	const [formasPago, setFormasPago] = useState({
		reload: !vencido,
		loading: null,
		liquidacionCabeceraId: liquidacionCabecera.id,
		data: [],
		error: null,
	});

	useEffect(() => {
		if (!formasPago.reload) return;
		const changes = {
			reload: false,
			loading: "Cargando formas de pago...",
			data: [],
			error: null,
		};
		setFormasPago((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "GetFormasPago",
			onOk: async (data) => {
				if (Array.isArray(data)) {
					changes.loading = "Cargando formas de pago generadas ...";
					setFormasPago((o) => ({ ...o, ...changes }));
					pushQuery({
						action: "GetLiquidacionFormasPago",
						params: { liquidacionCabeceraId: formasPago.liquidacionCabeceraId },
						onOk: async (ok) => {
							if (!Array.isArray(ok))
								return console.error("Se esperaba un arreglo.", { ok });
							ok.forEach((r) => {
								let fp = data.find((d) => d.id === r.refFormasPagoId);
								if (fp == null) {
									fp = {
										id: r.refFormasPagoId,
										descripcion: `Forma pago ${r.refFormasPagoId}`,
									};
									data.push(fp);
								}
								fp.cabeceras ??= [];
								fp.cabeceras.push(r);
							});
						},
						onError: async (error) => {
							changes.error = [changes.error, error.toString()]
								.filter((e) => e)
								.join("\n");
						},
						onFinally: async () => {
							changes.loading = null;
							changes.data = data;
							setFormasPago((o) => ({ ...o, ...changes }));
						},
					});
				} else {
					changes.loading = null;
					console.error("Se esperaba un arreglo.", { data });
				}
			},
			onError: async (error) => {
				changes.loading = null;
				changes.error = error.toString();
			},
			onFinally: async () => setFormasPago((o) => ({ ...o, ...changes })),
		});
	}, [formasPago, pushQuery]);
	//#endregion FormasPago

	//#endregion dependencias

	//#region select formaPago
	const [formaPagoSelect, setFormaPagoSelect] = useState({
		loading: vencido ? null : "Cargando...",
		buscar: "",
		data: [],
		options: [],
		selected: { value: 0, label: "", data: null },
		error: null,
	});
	// Inicio
	useEffect(() => {
		if (formasPago.reload || formasPago.loading) return;
		if (!formaPagoSelect.loading) return;
		const data = formasPago.data.map((r) => ({
			value: r.id,
			label: r.descripcion,
			data: {
				...r,
				modeloImpresionLiquidacion: { InterBanking: 1 }[r.descripcion] ?? 0, //ToDo: una vez que se implemente el campo modeloImpresionLiquidacion, solo asignar `data: r`
			},
		}));
		const changes = {
			loading: null,
			buscar: "",
			data,
			options: data,
			selected: { value: 0, label: "" },
			error: formasPago.error,
		};
		setFormaPagoSelect((o) => ({ ...o, ...changes }));
	}, [formasPago, formaPagoSelect]);
	// Buscador
	useEffect(() => {
		if (formaPagoSelect.loading) return;
		const options = formaPagoSelect.data.filter((r) =>
			formaPagoSelect.buscar !== ""
				? r.label.toLowerCase().includes(formaPagoSelect.buscar.toLowerCase())
				: true
		);
		setFormaPagoSelect((o) => ({ ...o, options }));
	}, [formaPagoSelect.loading, formaPagoSelect.data, formaPagoSelect.buscar]);
	//#endregion select formaPago

	const [formaPago, setFormaPago] = useState({
		loading: null,
		data: null,
		error: null,
	});

	const onImprime = () => {
		//No seleccionó opcion
		if ((formaPagoSelect.selected?.value ?? 0) === 0) return;
		//Se está cargando la forma de pago
		if (formaPago.loading) return;
		//Ya se cargó la forma de pago
		if (formaPago.data != null) return;

		if (formaPagoSelect.selected.data?.cabeceras) {
			// La Liq. ya tiene generadas la forma de pago seleccionada
			return setFormaPago((o) => ({
				...o,
				loading: null,
				data: formaPagoSelect.selected.data.cabeceras,
				error: null,
			}));
		}

		// Hay que generar la forma de pago seleccionada para la Liq.
		const changes = { loading: "Cargando...", data: null, error: null };
		setFormaPago((o) => ({ ...o, ...changes }));
		pushQuery({
			action: "CreateLiquidacionFormasPago",
			config: {
				body: {
					liquidacionCabeceraId: liquidacionCabecera.id,
					refFormasPagoId: formaPagoSelect.selected.value,
				}
			},
			onOk: async (data) => (changes.data = data),
			onError: async (error) => (changes.error = error.toString()),
			onFinally: async () => {
				changes.loading = null;
				setFormaPago((o) => ({ ...o, ...changes }));
			},
		});
	};

	let contenido = null;
	if (sinFechaVencimiento) {
		contenido = (
			<text
				style={{ color: "red" }}
			>{`No se puede imprimir porque la boleta no tiene fecha de vencimiento`}</text>
		);
	} else if (vencido) {
		contenido = (
			<text
				style={{ color: "red" }}
			>{`No se puede imprimir una boleta vencida (Fecha de vencimiento: ${Formato.Fecha(
				liquidacionCabecera.fechaVencimiento
			)})`}</text>
		);
	} else if (formasPago.loading || formaPago.loading) {
		contenido = <text>Cargando...</text>;
	} else if (formaPago.data == null) {
		contenido = (
			<Grid width col>
				<SearchSelectMaterial
					label="Forma de pago"
					error={!!formaPagoSelect.error}
					helperText={formaPagoSelect.loading ?? formaPagoSelect.error ?? ""}
					value={formaPagoSelect.selected}
					onChange={(selected) =>
						setFormaPagoSelect((o) => ({ ...o, selected }))
					}
					options={formaPagoSelect.options}
					onTextChange={(buscar) =>
						setFormaPagoSelect((o) => ({ ...o, buscar }))
					}
					required
				/>
				{formaPagoSelect.error == null ? null : (
					<text style={{ color: "red" }}>{formaPagoSelect.error}</text>
				)}
			</Grid>
		);
	} else {
		const Viewer =
			{ 1: FormaPagoViewer1 }[
				formaPagoSelect.selected.data.modeloImpresionLiquidacion
			] ?? FormaPagoViewer0;
		contenido = (
			<Viewer cabecera={liquidacionCabecera} formasPago={formaPago.data} />
		);
	}

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onImprime(), "AltKey");

	return (
		<Modal size="xl" centered show onHide={() => onClose()}>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				Imprime liquidación
			</Modal.Header>
			<Modal.Body style={{ height: "70vh" }}>
				<Grid col full gap="15px">
					{contenido}
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid col gap="5px">
					<Grid gap="20px" justify="end">
						<Grid width="250px">
							{formaPago.data != null ? null : (
								<Button
									className="botonAmarillo"
									disabled={
										(formaPagoSelect.selected?.value ?? 0) === 0 || vencido
									}
									loading={formaPago.loading}
									onClick={() => onImprime()}
								>
									IMPRIME
								</Button>
							)}
						</Grid>
						<Grid width="150px">
							<Button className="botonAmarillo" onClick={() => onClose()}>
								FINALIZA
							</Button>
						</Grid>
					</Grid>
					{formaPago.error == null ? null : (
						<text style={{ color: "red" }}>{formaPago.error}</text>
					)}
				</Grid>
			</Modal.Footer>
		</Modal>
	);
};

export default FormaPagoPrint;
