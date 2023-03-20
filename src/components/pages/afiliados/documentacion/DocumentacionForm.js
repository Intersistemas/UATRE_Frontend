import React, { useEffect, useState } from "react";
import useHttp from "../../../hooks/useHttp";
import Grid from "../../../ui/Grid/Grid";
import InputMaterial from "../../../ui/Input/InputMaterial";
import SelectMaterial from "../../../ui/Select/SelectMaterial";

const DocumentacionForm = ({ config }) => {
	const data = config.data ? { ...config.data } : {};
	const onChange = config.onChange ?? ((newData) => {});
	const { sendRequest: request } = useHttp();

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
			<Grid full="width">
				{tipoList.loading ? (
					<h4>Cargando..</h4>
				) : tipoList.error ? (
					<h4>Error {tipoList.error.message}</h4>
				) : (
					<SelectMaterial
						name="refTipoDocumentacionId"
						label="Tipo de documentacion"
						options={tipoList.data ?? []}
						value={data?.refTipoDocumentacionId}
						defaultValue={tipoList[0]}
						onChange={(v) => onChange({ refTipoDocumentacionId: v })}
					/>
				)}
			</Grid>
			<Grid full="width">
				<input
					type="file"
					name="archivo"
					onChange={(e) => {
						if (e.target.files.length === 0) return;
						console.log("e.target.files", e.target.files);
						const archivo = e.target.files[0];
						const reader = new FileReader();
						reader.readAsDataURL(archivo);
						reader.onload = () => onChange({ archivo: reader.result });
					}}
				/>
			</Grid>
			<Grid full="width">
				<InputMaterial
					id="observaciones"
					label="Observaciones"
					value={data?.observaciones ?? ""}
					onChange={(v) => onChange({ observaciones: v })}
					width={100}
				/>
			</Grid>
		</Grid>
	);
};

export default DocumentacionForm;
