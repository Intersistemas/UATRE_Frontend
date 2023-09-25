import React, { useState } from "react";
import Grid from "components/ui/Grid/Grid";
import Modal from "components/ui/Modal/Modal";
import Button from "components/ui/Button/Button";
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
		const validData = { ...data };
		validData.remuneracion = Formato.Decimal(validData.remuneracion);

		const newErrores = {};
		if (!ValidarCUIT(validData.cuil)) newErrores.cuil = "Debe ingresar un CUIL válido";
		if (validData.remuneracion === 0)
			newErrores.remuneracion = "Debe ingresar una remuneración";

		setErrores(newErrores);
		if (Object.keys(newErrores).length > 0) return;

		onClose({ request: request, data: validData });
	};

	let textoConfirma;
	switch (request) {
		case "A":
			textoConfirma = "Agregar";
			break;
		case "B":
			textoConfirma = "Borrar";
			break;
		case "M":
			textoConfirma = "Modificar";
			break;
		default:
			textoConfirma = null;
			break;
	}

	const renderConfirmaButton = textoConfirma ? (
		<Button onClick={validar}>{textoConfirma}</Button>
	) : null;

	return (
		<Modal onClose={onClose}>
			<Grid col full gap="15px">
				<Grid full="width" gap="15px">
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
					<Grid width="50%">
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
					<Grid width="25%">
						<InputMaterial
							type="number"
							label="Remuneracion"
							error={!!errores.remuneracion}
							helperText={errores.remuneracion ?? ""}
							value={data.remuneracion}
							onChange={(value, _id) =>
								setData((old) => ({ ...old, remuneracion: value }))
							}
						/>
					</Grid>
				</Grid>
				{/* Botones Confirma / Cancela */}
				<Grid col grow justify="end">
					<Grid gap="30px">
						<Grid grow />
						<Grid col width="30%" justify="end">
							<Grid gap="15px">
								<Button className="botonBlanco" onClick={onClose}>
									Cancela
								</Button>
								{renderConfirmaButton}
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default NominaForm;
