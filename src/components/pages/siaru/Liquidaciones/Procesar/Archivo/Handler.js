import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { handleSetNavFunction } from "redux/actions";
import { Modal } from "react-bootstrap";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import Tentativas from "../tentativas/Handler";

const Handler = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	const empresa = useSelector((state) => state.empresa);
	const { periodo, archivo } = useSelector(
		(state) => state.liquidacionProcesar.desdeArchivo
	);

	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) {
		dispatch(handleSetNavFunction()); // Limpio navFunction
		navigate(redirect.to, redirect.options);
	}

	useEffect(() => {
		if (!empresa?.cuit) setRedirect({ to: "Empresas" });
		else if (!(periodo || archivo))
			setRedirect({ to: "Procesar" });
	}, [empresa, periodo, archivo]);

	const [modal, setModal] = useState();

	//#region Establezco la navFunction para esta página
	useEffect(() => {
		dispatch(
			handleSetNavFunction(({ go }) => {
				setModal(
					<Modal size="lg" centered show onHide={() => setModal(null)}>
						<Modal.Header
							className={modalCss.modalCabecera}
							closeButton
						/>
						<Modal.Body>
							<Grid width="full" justify="center">
								<h4>Se perderán los datos cargados</h4>
							</Grid>
						</Modal.Body>
						<Modal.Footer>
							<Grid gap="20px">
								<Grid width="150px">
									<Button
										className="botonAzul"
										onClick={() => go()}
									>
										CONTINÚA
									</Button>
								</Grid>
								<Grid width="150px">
									<Button
										className="botonAmarillo"
										onClick={() => setModal(null)}
									>
										CANCELA
									</Button>
								</Grid>
							</Grid>
						</Modal.Footer>
					</Modal>
				);
			})
		);
	}, [dispatch]);
	//#endregion

	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetTentativas": {
				const { archivo, ...pars } = params;
				const data = new FormData();
				data.append("Archivo", archivo, archivo.name);
				return {
					config: {
						baseURL: "SIARU",
						method: "POST",
						endpoint: "/Liquidaciones/TentativasLSD",
						body: data,
						bodyToJSON: false,
						headers: { Accept: "*/*" },
					},
					params: pars,
				};
			}
			default:
				return null;
		}
	});

	//#region declaración y carga de tentativas
	const [tentativas, setTentativas] = useState({
		loading: "Cargando...",
		params: { cuit: empresa.cuit, periodo, archivo },
		data: [],
		error: null,
	});
	useEffect(() => {
		if (!tentativas.loading) return;
		const changes = { loading: null, data: [], error: null }
		pushQuery({
			action: "GetTentativas",
			params: tentativas.params,
			onOk: async (data) => changes.data.push(...data),
			onError: async (error) => (changes.error = error),
			onFinally: () => setTentativas((o) => ({ ...o, ...changes })),
		});
	}, [tentativas, pushQuery]);
	//#endregion

	let contenido = null;
	if (tentativas.loading) {
		contenido = <h1>Cargando tentativas...</h1>;
	} else if (tentativas.error) {
		contenido = <h1>Ocurrió un error cargando tentativas..</h1>;
		switch (tentativas.error.code ?? 0) {
			case 0:
				contenido = (
					<Grid col width="full" gap="10px">
						{contenido}
						<h4>{tentativas.error.message}</h4>
					</Grid>
				);
				break;
			default:
				contenido = (
					<Grid col width="full" gap="10px">
						{contenido}
						<h4 style={{ color: "red" }}>
							{"Error "}
							{tentativas.error.code ? `${tentativas.error.code} - ` : ""}
							{tentativas.error.message}
						</h4>
					</Grid>
				);
		}
	} else {
		contenido = <Tentativas periodo={periodo} tentativas={tentativas.data} />;
	}

	return (
		<Grid col height="100vh" gap="10px">
			<Grid className="titulo" width="full">
				<h1>Sistema de Aportes Rurales</h1>
			</Grid>
			<Grid className="contenido" width="full" grow>
				{contenido}
				{modal}
			</Grid>
		</Grid>
	);
};

export default Handler;
