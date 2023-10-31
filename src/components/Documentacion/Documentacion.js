import React, { useEffect, useState } from "react";
import useHttp from "../hooks/useHttp";
import Button from "../ui/Button/Button";
import Grid from "../ui/Grid/Grid";
import DocumentacionForm from "./DocumentacionForm";
import DocumentacionTable from "./DocumentacionTable";

const initEditing = {
	data: {},
	history: {},
};

const Documentacion = ({
	data = [],
	disabled = false,
	onChange = ({ index, item }) => {},
}) => {
	const { sendRequest } = useHttp();

	const [editing, setEditing] = useState(initEditing);

	//#region declaración y carga tipos de documentación
	const [tipoList, setTipoList] = useState({ loading: true });
	useEffect(() => {
		sendRequest(
			{
				baseURL: "Comunes",
				endpoint: `/RefTipoDocumentacion/GetAll`,
				method: "GET",
			},
			async (res) => setTipoList({ data: res }),
			async (err) => setTipoList({ error: err, data: [] })
		);
	}, [sendRequest]);
	//#endregion

	if (tipoList.loading) {
		return (
			<Grid col full="width" gap="10px">
				Cargando documentación
			</Grid>
		);
	}

	return (
		<Grid col full="width" gap="10px">
			<Grid full="width" gap="5px">
				<DocumentacionTable
					data={data}
					tipoList={tipoList.data}
					selection={{
						onSelect: (row, _isSelect, index, _e) =>
							setEditing({
								data: { ...row },
								history: { ...row },
								index: index,
								req: null,
							}),
					}}
				/>
			</Grid>
			<Grid full="width" gap="5px">
				<Grid grow>
					<Button
						className="botonAmarillo"
						disabled={disabled || editing.req != null}
						onClick={() => setEditing((old) => ({ ...old, data: {}, req: 1 }))}
					>
						Agrega documentación
					</Button>
				</Grid>
				<Grid grow>
					<Button
						className="botonAmarillo"
						disabled={
							disabled ||
							data.length === 0 ||
							editing.index == null ||
							editing.req != null
						}
						onClick={() => setEditing((old) => ({ ...old, req: 2 }))}
					>
						Modifica documentación
					</Button>
				</Grid>
				<Grid grow>
					<Button
						className="botonAmarillo"
						disabled={
							disabled ||
							data.length === 0 ||
							editing.index == null ||
							editing.req != null
						}
						onClick={() => setEditing((old) => ({ ...old, req: 3 }))}
					>
						Borra documentación
					</Button>
				</Grid>
			</Grid>
			<Grid
				col
				full="width"
				gap="20px"
				style={{
					marginTop: "10px",
					border: "1px solid #186090",
					padding: "15px",
				}}
			>
				<DocumentacionForm
					record={editing.data}
					request={editing.req}
					tipoList={tipoList.data}
					disabled={disabled || editing.req == null}
					onChange={(changes) =>
						setEditing((old) => ({
							...old,
							data: { ...old.data, ...changes },
						}))
					}
					onCancel={() =>
						setEditing((old) => ({
							...old,
							data: { ...old.history },
							req: null,
						}))
					}
					onConfirm={() => {
						switch (editing.req) {
							case 1: // Agrega
								onChange({ item: editing.data });
								break;
							case 2: // Modifica
								onChange({ index: editing.index, item: editing.data });
								break;
							case 3: // Borra
								onChange({ index: editing.index });
								setEditing(initEditing);
								break;
							default:
								break;
						}
						setEditing((old) => ({ ...old, req: null }));
					}}
				/>
			</Grid>
		</Grid>
	);
};

export default Documentacion;
