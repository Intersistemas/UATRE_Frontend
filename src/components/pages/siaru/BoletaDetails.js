import React, { useState } from "react";
import styles from "./BoletaDetails.module.css";
import { PDFViewer } from "@react-pdf/renderer";
import BoletaPDF from "./BoletaPDF";
import Modal from "../../ui/Modal/Modal";
import Button from "../../ui/Button/Button";

const BoletaDetails = (props) => {
	const config = props.config;
	const data = config.data;
	const empresa = config.empresa;
	const establecimiento = config.establecimiento;
	const [boletaPDF, setBoletaPDF] = useState(null);

	const handleImprimir = () => {
		setBoletaPDF(
			<Modal onClose={() => setBoletaPDF(null)}>
				<PDFViewer style={{ width: "100%" }}>
					<BoletaPDF
						config={{
							empresa: empresa,
							establecimiento: establecimiento,
							data: data,
						}}
					/>
				</PDFViewer>
			</Modal>
		);
	};

	return (
		<div className={styles.details}>
			<div>
				<span>Periodo:</span> {data.periodo}
			</div>
			<div>
				<span>Fecha:</span> {data.fecha}
			</div>
			<div>
				<span>Cant. trabajadores:</span> {data.cantidadTrabajadores}
			</div>
			<div>
				<span>Total remuneraciones:</span> {data.totalRemuneraciones}
			</div>
			<div>
				<span>Codigo de barras:</span> {data.codigoBarra}
			</div>
			<div>
				<Button onClick={handleImprimir}>Imprimir</Button>
			</div>
			{boletaPDF}
		</div>
	);
};

export default BoletaDetails;
