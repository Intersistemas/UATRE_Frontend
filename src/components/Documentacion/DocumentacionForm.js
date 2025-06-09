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
	loading = false,
	onChange = (changes) => {},
	onCancel = () => {},
	onConfirm = () => {},
	request,
}) => {

	const archivoRef = useRef(null);
	const [errors, setErrors] = React.useState({
		refTipoDocumentacionId: false,
		archivo: false,
	});

	const getValue = (v) => record[v] ?? "";

	const tipoListData = tipoList.map((r) => ({
		value: r.id,
		label: r.descripcion,
	}));

	const confirmaHandle = () => {

		console.log("errors",errors)
		if (getValue("refTipoDocumentacionId") === "") {
			setErrors((o) => ({
				...o,
				refTipoDocumentacionId: true,
			}));
			return;
		}

		console.log("archivoRef",archivoRef)
		if (archivoRef.current?.files.length === 0 && request == 1) {
			setErrors((o) => ({
				...o,
				archivo: true,
			}));
			return;
		}
		onConfirm()
	}

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
						onChange={(v) =>
							(setErrors((o) => ({
								...o,
								refTipoDocumentacionId: false,
							})),
							 onChange({ refTipoDocumentacionId: v }))
							}
						requered
						error={errors?.refTipoDocumentacionId ? "Dato Requerido" : ""}
						helperText={errors?.refTipoDocumentacionId ? "Dato Requerido" : ""}
					/>
				</Grid>
				<Grid grow><a download={getValue("nombreArchivo")} href={`data:image/*;base64,${getValue("archivo")}`}>{getValue("nombreArchivo")}</a></Grid>
				<Grid width="150px">
					<input
						ref={archivoRef}
						type="file"
						hidden
						disabled={disabled}
						onChange={(e) => {
							setErrors((o) => ({
								...o,
								archivo: false,
							}));
							if (e.target.files.length === 0) return;
							const archivo = e.target.files[0];
							const reader = new FileReader();
							reader.readAsDataURL(archivo);
							reader.onload = () => {
								onChange({
									archivo: reader.result?.split("base64,")[1],
									nombreArchivo: archivo.name,
									contentType: archivo.type,
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
				<div hidden={!errors?.archivo} style={{ color: "red" }}>Debe subir un archivo</div>
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
					<Button className="botonAmarillo" onClick={() => confirmaHandle()} disabled={disabled}>
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
