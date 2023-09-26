import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleModuloSeleccionar } from "redux/actions";
import useQueryQueue from "components/hooks/useQueryQueue";
import DelegacionesTable from "./DelegacionesTable";
import Grid from "components/ui/Grid/Grid";

const DelegacionesHandler = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetRefDelegacionList":
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/RefDelegacion/GetAll`,
						method: "GET",
					},
				};
			default:
				return null;
		}
	});
	//#endregion

	//#region declaracion y carga delegacionesList
	const [delegacionesList, setDelegacionesList] = useState({
		loading: "Cargando..",
		data: [],
		error: {},
	});
	useEffect(() => {
		if (!delegacionesList.loading) return;
		pushQuery({
			action: "GetRefDelegacionList",
			onOk: async (res) => setDelegacionesList({ data: res }),
			onError: async (err) => setDelegacionesList({ data: [], error: err }),
		});
	}, [pushQuery, delegacionesList.loading]);
	//#endregion

	//#region declaracion registro seleccionado
	const [selected, setSelected] = useState({
		record: {},
		history: {},
		request: null,
	});
	//#endregion

	//#region sidebar
	const moduloInfo = {
		nombre: "Delegaciones",
		acciones: [
			{ name: "Administración de datos" },
			{ name: "Agrega Delegación" },
			{ name: "Consulta Delegación" },
			{ name: "Modifica Delegación" },
			{ name: "Borra Delegación" },
		],
	};
	dispatch(handleModuloSeleccionar(moduloInfo));
	const moduloAccion = useSelector((state) => state.moduloAccion);
	useEffect(() => {
		switch (moduloAccion) {
			case "Administración de datos":
				navigate("/administracion");
				break;
			case "Agrega Delegación":
				setSelected((old) => ({
					...old,
					record: { ...old.history },
					request: "A",
				}));
				break;
			case "Consulta Delegación":
				setSelected((old) => ({
					...old,
					record: { ...old.history },
					request: "C",
				}));
				break;
			case "Modifica Delegación":
				setSelected((old) => ({
					...old,
					record: { ...old.history },
					request: "M",
				}));
				break;
			case "Borra Delegación":
				setSelected((old) => ({
					...old,
					record: { ...old.history },
					request: "B",
				}));
				break;
			default:
				break;
		}
	}, [navigate, moduloAccion]);
	//#endregion

	const [form, setForm] = useState(null);
	useEffect(() => {
		if (!selected.request) {
			setForm(null);
			return;
		}
		setForm(JSON.stringify(selected.record));
	}, [selected]);

	return (
		<Grid full col>
			<Grid>
				<h1 className="titulo">Delegaciones</h1>
			</Grid>
			<Grid>
				<DelegacionesTable
					data={delegacionesList.data}
					loading={!!delegacionesList.loading}
					noDataIndication={
						delegacionesList.loading ??
						delegacionesList.error?.message ??
						"No existen datos para mostrar"
					}
					selection={{
						onSelect: (row, isSelect, rowIndex, e) =>
							setSelected({
								record: { ...row },
								history: { ...row },
								request: null,
							}),
					}}
				/>
				{form}
			</Grid>
		</Grid>
	);
};

export default DelegacionesHandler;
