import React, { useEffect, useState } from "react";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Button from "components/ui/Button/Button";
import LoadingButtonCustom from "components/ui/LoadingButtonCustom/LoadingButtonCustom";
import Formato from "components/helpers/Formato";
import InputMaterial from "components/ui/Input/InputMaterial";
import ValidarCUIT from "components/validators/ValidarCUIT";
import useQueryQueue from "components/hooks/useQueryQueue";
import NominaDetailsAFIP from "./NominaDetailsAFIP";

const dataDef = {
	cuil: 0,
	nombre: "",
	remuneracion: 0,
};

const NominaForm = ({
	data: initData = dataDef,
	request = null,
	onClose = ({ request = null, data = null } = {}) => {},
} = {}) => {
	const [data, setData] = useState({ ...dataDef, ...initData });
	const [errores, setErrores] = useState({});

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "ConsultaAFIP":
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: "/AFIPConsulta",
					},
				};
			default:
				return null;
		}
	});

	const validar = () => {
		if (!["A", "M", "B"].includes(request)) return;

		const validData = { ...data };
		validData.remuneracion = Formato.Decimal(validData.remuneracion);

		const newErrores = {};
		if (request !== "B") {
			if (!ValidarCUIT(validData.cuil))
				newErrores.cuil = "Debe ingresar un CUIL válido";
			if (validData.remuneracion === 0)
				newErrores.remuneracion = "Debe ingresar una remuneración";
		}

		setErrores(newErrores);
		if (Object.keys(newErrores).length > 0) return;

		onClose({ request: request, data: validData });
	};

	let titulo;
	switch (request) {
		case "A":
			titulo = "Agrega Trabajador";
			break;
		case "B":
			titulo = "Borra Trabajador";
			break;
		case "M":
			titulo = "Modifica Trabajador";
			break;
		default:
			titulo = "Trabajador";
			break;
	}

	const [datosAFIP, setDatosAFIP] = useState({
		loading: data.cuil ? "Cargando..." : null,
		data: { cuit: data.cuil, nombre: "", documento: "", domicilio: "" },
		error: null,
	});
	useEffect(() => {
		if (!datosAFIP.loading) return;
		pushQuery({
			action: "ConsultaAFIP",
			params: { cuit: datosAFIP.data.cuit },
			onOk: ({
				apellido = "",
				nombre = "",
				tipoDocumento,
				numeroDocumento,
				domicilios = [],
			}) => {
				const newDatosAFIP = {
					...datosAFIP,
					loading: null,
					data: {
						cuit: datosAFIP.data.cuit,
						nombre: [apellido, nombre].filter((r) => r).join(", "),
						documento: [tipoDocumento, Formato.DNI(numeroDocumento)]
							.filter((r) => r != null)
							.join(" "),
						domicilio: [
							domicilios.find((r) => r.tipoDomicilio === "LEGAL/REAL") ??
								(domicilios.length ? domicilios[0] : {}),
						]
							.map((r) =>
								[r.direccion, r.localidad, r.descripcionProvincia]
									.filter((e) => e)
									.join(" - ")
							)
							.join(),
					}
				}
				setDatosAFIP(newDatosAFIP);
				setData((old) => {
					if (old.nombre) return old;
					return {
						...old,
						nombre: newDatosAFIP.data.nombre,
					};
				});
			},
			onError: (err) =>
				setDatosAFIP((old) => ({
					...old,
					loading: null,
					data: { cuit: old.data.cuit },
					error: err,
				})),
		});
	}, [pushQuery, datosAFIP]);

	return (
		<Modal onClose={onClose}>
			<Grid col full gap="15px">
				<Grid className={modalCss.modalCabecera} full="width" justify="center">
					<h3>{titulo}</h3>
				</Grid>
				<Grid width="full" gap="inherit">
					<Grid width="25%">
						<InputMaterial
							label="CUIL"
							error={!!errores.cuil}
							helperText={errores.cuil ?? ""}
							value={Formato.Cuit(data.cuil)}
							onChange={(value, _id) => {
								const v = Formato.Decimal(`${value}`.replace(/[-.]/g, ""));
								if (`${v}`.length > 11) return;
								if (v === data.cuil) return;
								setData((old) => ({ ...old, cuil: v }));
								const newDatosAFIP = { data: { cuit: v } };
								if (ValidarCUIT(v)) newDatosAFIP.loading = "Cargando...";
								setDatosAFIP(newDatosAFIP);
							}}
						/>
					</Grid>
					<Grid width="75%">
						<InputMaterial
							label="Nombre"
							error={!!errores.nombre}
							helperText={errores.nombre ?? ""}
							value={data.nombre}
							onChange={(value, _id) =>
								setData((old) => ({
									...old,
									nombre: `${value}`,
								}))
							}
						/>
					</Grid>
				</Grid>
				<Grid width="full">
					<InputMaterial
						type="number"
						label="Remuneracion"
						error={!!errores.remuneracion}
						helperText={errores.remuneracion ?? ""}
						value={data.remuneracion}
						onChange={(value, _id) => {
							const nuevo = Formato.Decimal(value);
							if (nuevo < 0) return;
							setData((old) => ({
								...old,
								remuneracion: nuevo,
							}));
						}}
					/>
				</Grid>
				<NominaDetailsAFIP
					data={datosAFIP.data}
					loading={datosAFIP.loading}
					error={datosAFIP.error}
				/>
				<Grid gap="200px" justify="center">
					<Grid width="150px">
						<Button className="botonAzul" onClick={validar}>
							Confirma
						</Button>
					</Grid>
					<Grid width="150px">
						<Button className="botonAmarillo" onClick={onClose}>Cancela</Button>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default NominaForm;
