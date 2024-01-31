import React from "react";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import CheckboxMaterial from "components/ui/Checkbox/CheckboxMaterial";


import UseKeyPress from "components/helpers/UseKeyPress";
import modalCss from "components/ui/Modal/Modal.module.css";
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FormGroup from '@mui/material/FormGroup';

import { useState } from "react";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const UsuariosForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};
	data.nombre ??= "";
	
	data.rol ??= "Usuario" ;

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	const [verClave, setVerClave] = useState(false);

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	const handleMouseDownPassword = (event) => {
		event.preventDefault();
	  };

	return (
		<Modal show onHide={() => onClose()} size="lg" centered>
			<Modal.Header className={modalCss.modalCabecera} closeButton>
				<h3>{title}</h3>
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="15px">
						<Grid width="33%">
							{hide.userName ? null : (
								<InputMaterial
									label="Usuario"
									required
									error={!!errors.userName}
									helperText={errors.userName ?? ""}
									value={data.userName}
									disabled={disabled.userName ?? false}
									onChange={(value, _id) =>
										onChange({ userName: value })
									}
								/>
							)}
						</Grid>
						<Grid width="33%">
							{hide.password ? null : (
								<InputMaterial
									label="Clave"
									required
									type={verClave ? "text" : "password"}
									error={!!errors.password}
									helperText={errors.password ?? ""}
									value={data.password}
									disabled={disabled.password ?? false}
									onChange={(value, _id) => onChange({ password: value })}
									InputProps={{
										startAdornment: 
										<InputAdornment position="end">
										  <IconButton
											aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
											onClick={() => setVerClave((prevState) => !prevState)}
											onMouseDown={handleMouseDownPassword}
											edge="start"
										  >
											{verClave ? <VisibilityOff /> : <Visibility />}
										  </IconButton>
										</InputAdornment>
									}}
							  />

							)}
						</Grid>
						<Grid width="33%">
							{hide.confirmPassword ? null : (
								<InputMaterial
									label="Repetir Clave"
									required
									type={verClave ? "text" : "password"}
									error={!!errors.confirmPassword}
									helperText={errors.confirmPassword ?? ""}
									value={data.confirmPassword}
									disabled={disabled.confirmPassword ?? false}
									onChange={(value, _id) => onChange({ confirmPassword: value })}
									InputProps={{
										startAdornment: 
										<InputAdornment position="end">
										  <IconButton
											aria-label={verClave ? "Ocultar clave" : "Ver Clave"}
											onClick={() => setVerClave((prevState) => !prevState)}
											onMouseDown={handleMouseDownPassword}
											edge="start"
										  >
											{verClave ? <VisibilityOff /> : <Visibility />}
										  </IconButton>
										</InputAdornment>
									}}
								/>
								
							)}
						</Grid>
					</Grid>
					<Grid width="full" gap="15px">
						<Grid width="33%">
							{hide.cuit ? null : (
								<InputMaterial
									id="cuitUsuario"
									required
									label="CUIT"
									error={!!errors.cuit}
									mask="99-99.999.999-9"
									helperText={errors.cuit ?? ""}
									value={data.cuit}
									disabled={disabled.cuit ?? false}
									onChange={(value, _id) =>
										//onChange({ cuit: value })
										onChange({ cuit: value.replace(/[^0-9]+/g, "") })
									}
								/>
							)}
						</Grid>
						<Grid width="68%">
							{hide.nombre ? null : (
								<InputMaterial
									label="Nombre"
									required
									error={!!errors.nombre}
									helperText={errors.nombre ?? ""}
									value={data.nombre}
									disabled={disabled.nombre ?? false}
									onChange={(value, _id) =>
										onChange({ nombre: value })
									}
								/>
							)}
						</Grid>
					</Grid>
					<Grid width="full" gap="15px">
						<Grid width="33%">
								{hide.email ? null : (
									<InputMaterial
										label="Email"
										error={!!errors.email}
										helperText={errors.email ?? ""}
										value={data.email}
										disabled={disabled.email ?? false}
										onChange={(value, _id) => onChange({ email: value })}
										type="email"
										required
									/>
								)}
						</Grid>
						<Grid width="33%">
							<CheckboxMaterial
								id="emailConfirmed"
								label="Email Confirmado"
								disabled={disabled.emailConfirmed}
								error={!!errors.emailConfirmed}
								helperText={errors.emailConfirmed ?? ""}
								value={data?.emailConfirmed ?? false}
								onChange={(emailConfirmed) => onChange({ emailConfirmed })}
							/>
						</Grid>
						<Grid width="33%">
							<InputMaterial
								id="phoneNumber"
								label="Teléfono"
								error={!!errors.phoneNumber}
								helperText={errors.phoneNumber ?? ""}
								value={data.phoneNumber}
								disabled={disabled.phoneNumber ?? false}
								onChange={(phoneNumber) => onChange({ phoneNumber })}
							/>
						</Grid>
					</Grid>
					<Grid width="full" gap="15px">
						{hide.deletedObs ? null : (
							<InputMaterial
								label="Observaciones de baja"
								error={!!errors.deletedObs}
								helperText={errors.deletedObs ?? ""}
								value={data.deletedObs}
								disabled={disabled.deletedObs ?? false}
								onChange={(value, _id) => onChange({ deletedObs: value })}
							/>
						)}
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

export default UsuariosForm;
