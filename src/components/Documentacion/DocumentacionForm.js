import React, { useRef } from "react";
import Button from "../ui/Button/Button";
import Grid from "../ui/Grid/Grid";
import InputMaterial from "../ui/Input/InputMaterial";
import SelectMaterial from "../ui/Select/SelectMaterial";
// import InputMaterialMask from "../ui/Input/InputMaterialMask";

const DocumentacionForm = ({
	record = {},
	tipoList = [],
	disabled = false,
	onChange = (changes) => {},
	onCancel = () => {},
	onConfirm = () => {},
	request,
}) => {
	const archivoRef = useRef(null);

	const getValue = (v) => record[v] ?? "";

	const tipoListData = tipoList.map((r) => ({
		value: r.id,
		label: r.descripcion,
	}));

	return (
		<Grid col full gap="10px">
			<Grid full="width" gap="10px">
				<Grid width="50%">
					<SelectMaterial
						name="refTipoDocumentacionId"
						label="Tipo de documentacion"
						disabled={disabled}
						options={tipoListData}
						value={getValue("refTipoDocumentacionId")}
						defaultValue={tipoListData[0]}
						onChange={(v) => onChange({ refTipoDocumentacionId: v })}
					/>
				</Grid>
				<Grid grow>{getValue("archivoNombre")}</Grid>
				<Grid width="150px">
					<input
						ref={archivoRef}
						type="file"
						hidden
						disabled={disabled}
						onChange={(e) => {
							if (e.target.files.length === 0) return;
							const archivo = e.target.files[0];
							const reader = new FileReader();
							reader.readAsDataURL(archivo);
							reader.onload = () => {
								onChange({
									archivoBase64: reader.result?.split("base64,")[1],
									archivoNombre: archivo.name,
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
						disabled={disabled}
					>
						Subir archivo
					</Button>
				</Grid>
			</Grid>
			<Grid full="width">
				{/* <InputMaterialMask
					id="observaciones"
					label="Observaciones"
					disabled={disabled}
					value={getValue("observaciones")}
					onChange={(v) => onChange({ observaciones: v })}
					width={100}
				/> */}
				<InputMaterial
					id="observaciones"
					label="Observaciones"
					disabled={disabled}
					value={getValue("observaciones")}
					onChange={(v) => onChange({ observaciones: v })}
					width={100}
				/>
			</Grid>
			<Grid full="width" justify="center" gap="50px">
				<Grid>
					<Button className="botonAmarillo" onClick={() => onConfirm()} disabled={disabled}>
						{(() => {
							switch (request) {
								case 1:
									return "Agrega";
								case 2:
									return "Modifica";
								case 3:
									return "Borra";
								default:
									return "Confirma";
							}
						})()}
					</Button>
				</Grid>
				<Grid>
					<Button className="botonAmarillo" onClick={() => onCancel()} disabled={disabled}>
						Cancela
					</Button>
				</Grid>
			</Grid>
		</Grid>
	);
};

export default DocumentacionForm;
