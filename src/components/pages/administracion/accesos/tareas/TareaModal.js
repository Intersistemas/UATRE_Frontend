import React, { useRef } from "react";
// import Modal from "components/ui/Modal/Modal";
// import modalCss from "components/ui/Modal/Modal.module.css";
import { Modal } from "react-bootstrap";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import InputMaterial from "components/ui/Input/InputMaterial";
import SelectMaterial from "components/ui/Select/SelectMaterial";
import UseKeyPress from "components/helpers/UseKeyPress";

const dependeciesDef = {
	tipoTareaList: [{ id: 0, descripcion: "" }],
};
const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const TareaModal = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	dependecies = dependeciesDef,
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};

	disabled ??= {};
	hide ??= {};
	errors ??= {};

	dependecies ??= {};
	dependecies = dependecies === dependeciesDef ? {} : { ...dependecies };
	dependecies.tipoTareaList ??= [];
	dependecies.tipoTareaList = dependecies.tipoTareaList.map(
		(r) => ({ value: r.id, label: r.descripcion })
	);

	const archivoRef = useRef(null);
	const getValue = (v) => data[v] ?? "";

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	UseKeyPress(["Escape"], () => onClose());
	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

	return (
		<Modal size="lg" centered show onHide={() => onClose()}>
			<Modal.Header closeButton>{title}</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid width="full" gap="15px">
						<Grid width="50%">
							{hide.refTipoTareaId ? null : (
								<SelectMaterial
									name="refTipoTareaId"
									label="Tipo de Tarea"
									disabled={disabled.refTipoTareaId}
									error={!!errors.refTipoTareaId}
									helperText={errors.refTipoTareaId ?? ""}
									options={dependecies.tipoTareaList}
									value={getValue("refTipoTareaId")}
									onChange={(v) => onChange({ refTipoTareaId: v })}
								/>
							)}
						</Grid>
						{hide.archivo ? null : (
							<>
								<Grid grow>
									<a
										download={getValue("nombreArchivo")}
										href={`data:image/*;base64,${getValue("archivo")}`}
									>
										{getValue("nombreArchivo")}
									</a>
								</Grid>
								<Grid width="150px" col>
									<Grid width="full">
										<input
											ref={archivoRef}
											type="file"
											hidden
											disabled={disabled.archivo}
											onChange={(e) => {
												if (e.target.files.length === 0) return;
												const archivo = e.target.files[0];
												const reader = new FileReader();
												reader.readAsDataURL(archivo);
												reader.onload = () => {
													onChange({
														archivo: reader.result?.split("base64,")[1],
														nombreArchivo: archivo.name,
													});
												};
											}}
											onClick={(e) => {
												e.target.value = null;
											}}
										/>
										<Button
											className="botonAmarillo"
											onClick={() => archivoRef.current?.click()}
											disabled={disabled.archivo}
										>
											Subir archivo
										</Button>
									</Grid>
									<Grid width="full" style={{ color: "red" }}>
										{errors.archivo ?? ""}
									</Grid>
								</Grid>
							</>
						)}
					</Grid>
					<Grid full="width">
						{hide.observaciones ? null : (
							<InputMaterial
								id="observaciones"
								label="Observaciones"
								disabled={disabled.observaciones}
								error={!!errors.observaciones}
								helperText={errors.observaciones ?? ""}
								value={getValue("observaciones")}
								onChange={(v) => onChange({ observaciones: v })}
								width={100}
							/>
						)}
					</Grid>
					<Grid full="width">
						{hide.deletedObs ? null : (
							<InputMaterial
								id="deletedObs"
								label="Observación de baja"
								disabled={disabled.deletedObs}
								error={!!errors.deletedObs}
								helperText={errors.deletedObs ?? ""}
								value={getValue("deletedObs")}
								onChange={(v) => onChange({ deletedObs: v })}
								width={100}
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

export default TareaModal;
