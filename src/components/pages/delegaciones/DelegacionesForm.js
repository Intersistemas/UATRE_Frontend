import React from "react";
import Modal from "components/ui/Modal/Modal";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";

const DelegacionesForm = ({
	data = {},
	title = "",
	disabled = {},
	errores = {},
	onChange = (changes = {}) => {},
	onClose = (confirm = false) => {},
}) => {
	data ??= {};
	data.codigoDelegacion ??= "";
	data.nombre ??= "";

	disabled ??= {};
	errores ??= {};

	return (
		<Modal onClose={() => onClose(false)}>
			<Grid col full gap="15px">
				<Grid width="full"><h3>{title}</h3></Grid>
				<Grid width="full" gap="15px">
					<Grid width="25%">
					<InputMaterial
							label="Cód. delegación"
							error={!!errores.codigoDelegacion}
							helperText={errores.codigoDelegacion ?? ""}
							value={data.codigoDelegacion}
							disabled={disabled.codigoDelegacion ?? false}
							onChange={(value, _id) => onChange({ codigoDelegacion: value })}
						/>
					</Grid>
					<Grid width="75%">
						<InputMaterial
							label="Nombre"
							error={!!errores.nombre}
							helperText={errores.nombre ?? ""}
							value={data.nombre}
							disabled={disabled.nombre ?? false}
							onChange={(value, _id) => onChange({ nombre: value })}
						/>
					</Grid>
				</Grid>
				<Grid col grow justify="end">
					<Grid gap="30px">
						<Grid grow />
						<Grid col width="30%" justify="end">
							<Grid gap="15px">
								<Button className="botonBlanco" onClick={() => onClose(false)}>
									Cancela
								</Button>
								<Button onClick={() => onClose(true)}>Confirma</Button>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default DelegacionesForm;
