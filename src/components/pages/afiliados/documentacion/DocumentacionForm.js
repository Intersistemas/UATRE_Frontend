import React, { useEffect, useRef, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Button from "../../../ui/Button/Button";
import Grid from "../../../ui/Grid/Grid";
import InputMaterial from "../../../ui/Input/InputMaterial";
import SelectMaterial from "../../../ui/Select/SelectMaterial";

const DocumentacionForm = ({ config }) => {
	const data = config.data ?? {};
	const disabled = config.disabled ? true : false;
	const onChange = config.onChange ?? ((dataChanges) => {});
	const onCancel = config.onCancel ?? (() => {});
	const onConfirm = config.onConfirm ?? (() => {});
	const { sendRequest: request } = useHttp();

	const archivoRef = useRef(null);

	//#region declaracion y carga de lista de tipos de documentacion
	const [tipoList, setTipoList] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "Comunes",
				endpoint: `/RefTipoDocumentacion/GetAll`,
				method: "GET",
			},
			async (res) =>
				setTipoList({
					data: res.map((r) => ({
						value: r.id,
						label: r.descripcion,
					})),
				}),
			async (err) => setTipoList({ error: err })
		);
	}, [request]);
	//#endregion

	return (
		<Grid col full gap="10px">
			<Grid full="width" gap="10px">
				<Grid width="50%">
					{tipoList.loading ? (
						<h6>Cargando tipos de documentacion..</h6>
					) : tipoList.error ? (
						<h4>Error {tipoList.error.message}</h4>
					) : (
						<SelectMaterial
							name="refTipoDocumentacionId"
							label="Tipo de documentacion"
							disabled={disabled}
							options={tipoList.data ?? []}
							value={data.refTipoDocumentacionId ?? ""}
							defaultValue={tipoList[0]}
							onChange={(v) => onChange({ refTipoDocumentacionId: v })}
						/>
					)}
				</Grid>
				<Grid grow>{data?.archivoNombre ?? ""}</Grid>
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
							reader.onload = () =>
								onChange({
									archivoBase64: reader.result?.split("base64,")[1],
									archivoNombre: archivo.name,
								});
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
				<InputMaterial
					id="observaciones"
					label="Observaciones"
					disabled={disabled}
					value={data.observaciones ?? ""}
					onChange={(v) => onChange({ observaciones: v })}
					width={100}
				/>
			</Grid>
			<Grid full="width" justify="center" gap="50px">
				<Grid>
					<Button className="botonAmarillo" onClick={() => onConfirm()} disabled={disabled}>
						Confirma
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
