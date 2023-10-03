import React, { useRef } from "react";
import Modal from "components/ui/Modal/Modal";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import LoadingButtonCustom from "components/ui/LoadingButtonCustom/LoadingButtonCustom";
import InputMaterial from "components/ui/Input/InputMaterial";
import SelectMaterial from "components/ui/Select/SelectMaterial";

const dependeciesDef = {
	tipoDocumentacionList: [{ value: 0, label: ""}],
};
const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const DocumentacionModal = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errores = {},
	dependecies = dependeciesDef,
	onChange = onChangeDef,
	onClose = onCloseDef,
}) => {
	data ??= {};
	
	disabled ??= {};
	hide ??= {};
	errores ??= {};

	dependecies ??= {}
	dependecies = dependecies === dependeciesDef ? {} : dependecies;
	dependecies.tipoDocumentacionList ??= [];

	const archivoRef = useRef(null);
	const getValue = (v) => data[v] ?? "";

	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	return (
		<Modal onClose={() => onClose(false)}>
			<Grid col full gap="15px">
				<Grid className={modalCss.modalCabecera} width="full">
					<h3>{title}</h3>
				</Grid>
				<Grid width="full" gap="15px">
					<Grid width="50%">
						{hide.refTipoDocumentacionId ? null : (
							<SelectMaterial
								name="refTipoDocumentacionId"
								label="Tipo de documentacion"
								disabled={disabled.refTipoDocumentacionId}
								error={!!errores.refTipoDocumentacionId}
								helperText={errores.refTipoDocumentacionId ?? ""}
								options={dependecies.tipoDocumentacionList}
								value={getValue("refTipoDocumentacionId")}
								// defaultValue={dependecies.tipoDocumentacionList[0]}
								onChange={(v) => onChange({ refTipoDocumentacionId: v })}
							/>
						)}
					</Grid>
					{hide.archivo ? null : (
						<>
							<Grid grow>{getValue("archivoNombre")}</Grid>
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
													archivoNombre: archivo.name,
												});
											};
										}}
										onClick={(e) => {
											e.target.value = null;
										}}
									/>
									<Button
										onClick={() => archivoRef.current?.click()}
										disabled={disabled}
									>
										Subir archivo
									</Button>
								</Grid>
								<Grid width="full" style={{ color: "red" }}>
									{errores.archivo ?? ""}
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
							error={!!errores.observaciones}
							helperText={errores.observaciones ?? ""}
							value={getValue("observaciones")}
							onChange={(v) => onChange({ observaciones: v })}
							width={100}
						/>
					)}
				</Grid>
				<Grid full="width">
					{hide.bajaObservacion ? null : (
						<InputMaterial
							id="bajaObservacion"
							label="Observación de baja"
							disabled={disabled.bajaObservacion}
							error={!!errores.bajaObservacion}
							helperText={errores.bajaObservacion ?? ""}
							value={getValue("bajaObservacion")}
							onChange={(v) => onChange({ bajaObservacion: v })}
							width={100}
						/>
					)}
				</Grid>
				<Grid width="full" gap="200px" justify="center">
					<Grid width="200px">
						<LoadingButtonCustom onClick={() => onClose(true)}>
							CONFIRMA
						</LoadingButtonCustom>
					</Grid>
					<Grid width="200px">
						<Button onClick={() => onClose(false)}>CANCELA</Button>
					</Grid>
				</Grid>
			</Grid>
		</Modal>
	);
};

export default DocumentacionModal;