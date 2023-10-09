import React, { useState } from "react";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Button from "components/ui/Button/Button";
import LoadingButtonCustom from "components/ui/LoadingButtonCustom/LoadingButtonCustom";
import Formato from "components/helpers/Formato";
import InputMaterial from "components/ui/Input/InputMaterial";
import ValidarCUIT from "components/validators/ValidarCUIT";

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

	return (
		<Modal onClose={onClose}>
			<Grid col full gap="15px">
				<Grid className={modalCss.modalCabecera} full="width" justify="center">
					<h3>{titulo}</h3>
				</Grid>
				<Grid width="full" gap="15px">
					<Grid width="25%">
						<InputMaterial
							label="CUIL"
							error={!!errores.cuil}
							helperText={errores.cuil ?? ""}
							value={Formato.Cuit(data.cuil)}
							onChange={(value, _id) => {
								const v = Formato.Decimal(`${value}`.replace(/[-.]/g, ""));
								if (`${v}`.length > 11) return;
								setData((old) => ({ ...old, cuil: v }));
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
				{/* Botones Confirma / Cancela */}
				<Grid gap="200px" justify="center">
					<Grid width="150px">
						<LoadingButtonCustom onClick={validar}>
							CONFIRMA
						</LoadingButtonCustom>
					</Grid>
					<Grid width="150px">
						<Button onClick={onClose}>CANCELA</Button>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default NominaForm;
