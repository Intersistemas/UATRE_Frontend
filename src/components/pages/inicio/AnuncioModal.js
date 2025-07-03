import React, { useEffect, useState, useContext } from "react";
import { Modal } from "react-bootstrap";
import UseKeyPress from "components/helpers/UseKeyPress";
import useQueryQueue from "components/hooks/useQueryQueue";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import modalCss from "components/ui/Modal/Modal.module.css";
import { NavLink,useNavigate } from 'react-router-dom';
import { Logout } from "@mui/icons-material";
import AuthContext from "store/authContext";


const onCloseDef = () => {};

const AnuncioModal = ({ onClose = onCloseDef }) => {

	const navigate = useNavigate();
	const authContext = useContext(AuthContext);
	const logout = authContext.logout;  

	UseKeyPress(["Escape"], () => onClose());

	 const logoutHandle = () =>{
         logout();
         navigate("/recuperarClave");
    }

	return (
		<Modal size="xl" centered show>
			<Modal.Header className={modalCss.modalCabecera} closeButton onClick={() => onClose()}>

				ANUNCIO!
			</Modal.Header>
			<Modal.Body>
				<Grid col full gap="15px">
					<Grid col>
						<h2>Hola, bienvenido a la aplicación</h2>
						<p>Te sugerimos cambiar tu clave de acceso, si desear hacerlo ahora haz click en el siguiente botón: {<Button
							className="botonAmarillo"
							width={25}
							onClick={() => {
								logoutHandle();
								onClose();
							}}
						>CAMBIAR CLAVE</Button>} </p>
						
					</Grid>
				</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Grid gap="20px" justify="end">
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

export default AnuncioModal;
