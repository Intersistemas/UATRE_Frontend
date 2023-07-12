import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import styles from "./PDF.styles.js";
import JsBarcode from "jsbarcode";
import logo1 from "../../../../../media/Logo1_sidebar.png";
import Formato from "../../../../helpers/Formato.js";
import Descriptor from "../../../../helpers/Descriptor";
import Grid from "../../../../ui/Grid/Grid.js";

const PDF = ({ liquidacion, empresa, establecimiento } = {}) => {
	let importeTotal;
	if (liquidacion.interesImporte != null || liquidacion.interesNeto != null) {
		importeTotal = 0;
		if (liquidacion.interesImporte != null)
			importeTotal += liquidacion.interesImporte;
		if (liquidacion.interesNeto != null)
			importeTotal += liquidacion.interesNeto;
		importeTotal = Math.round((importeTotal + Number.EPSILON) * 100) / 100;
	}

	const descriptor = new Descriptor({
		entero: {
			singular: "peso",
			plural: "pesos",
		},
		separador: "con",
		decimal: {
			singular: "centavo",
			plural: "centavos",
		},
	});
	const importeTotalDescipcion = `${descriptor.escalaLarga(
		importeTotal
	)}`.toUpperCase();

	let barcode;
	if (liquidacion.codigoBarra) {
		let canvas = document.createElement("canvas");
		JsBarcode(canvas, liquidacion.codigoBarra);
		barcode = canvas.toDataURL();
	}

	const GridView = ({ style, ...p }) => (
		<Grid render={View} style={{ ...style, ...styles.border }} {...p} />
	);

	return (
		<Document style={styles.grow}>
			<Page style={styles.page} size="A4">
				<GridView
					gap="10px"
					col
					grow
					style={{ ...styles.borderBox, ...styles.paddingBox }}
				>
					<GridView col>
						<GridView gap="10px">
							<Image src={logo1} style={{ width: "70", height: "70" }} />
							<Text style={{ ...styles.titulo, fontSize: "60pt", marginTop: "10px" }}>UATRE</Text>
						</GridView>
						<GridView col style={{ ...styles.titulo, fontSize: "12pt" }}>
							<Text>Union Argentina de Trabajadores</Text>
							<Text>Rurales y Estibadores</Text>
						</GridView>
					</GridView>
					<GridView col grow style={styles.borderBox}>
						<GridView>
							<GridView
								col
								width
								style={{ ...styles.borderRight, ...styles.paddingBox }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>C.U.I.T.</Text>
								</GridView>
								<GridView justify="center">
									<Text>{Formato.Cuit(empresa.cuit)}</Text>
								</GridView>
							</GridView>
							<GridView
								col
								width
								style={{ ...styles.borderRight, ...styles.paddingBox }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>Periodo (Año-Mes)</Text>
								</GridView>
								<GridView justify="center">
									<Text>{Formato.Periodo(liquidacion.periodo)}</Text>
								</GridView>
							</GridView>
							<GridView col width style={styles.paddingBox}>
								<GridView justify="center">
									<Text style={styles.titulo}>Número de Acta</Text>
								</GridView>
								<GridView justify="center">
									<Text>000000</Text>
								</GridView>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.borderTop, ...styles.paddingBox }}>
							<GridView>
								<Text style={styles.titulo}>Razón Social</Text>
							</GridView>
							<GridView>
								<Text>{empresa.razonSocial}</Text>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.borderTop, ...styles.paddingBox }}>
							<GridView>
								<Text style={styles.titulo}>Provincia Laboral</Text>
							</GridView>
							<GridView>
								<Text>{establecimiento.provinciaDescripcion ?? ""}&nbsp;</Text>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.borderTop, ...styles.paddingBox }}>
							<GridView>
								<Text style={styles.titulo}>Localidad Laboral</Text>
							</GridView>
							<GridView>
								<Text>{establecimiento.localidadDescripcion ?? ""}&nbsp;</Text>
							</GridView>
						</GridView>
						<GridView style={styles.borderTop}>
							<GridView
								col
								width
								style={{ ...styles.borderRight, ...styles.paddingBox }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>Seccional</Text>
								</GridView>
								<GridView justify="center">
									<Text>{0 /* ToDo */}</Text>
								</GridView>
							</GridView>
							<GridView
								col
								width
								style={{ ...styles.borderRight, ...styles.paddingBox }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>Trabajadores</Text>
								</GridView>
								<GridView justify="center">
									<Text>{liquidacion.cantidadTrabajadores ?? 0}</Text>
								</GridView>
							</GridView>
							<GridView
								col
								width
								style={{ ...styles.paddingBox, ...styles.paddingBox }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>Remuneraciones</Text>
								</GridView>
								<GridView justify="end">
									<Text>
										{Formato.Moneda(liquidacion.totalRemuneraciones ?? 0)}
									</Text>
								</GridView>
							</GridView>
						</GridView>
						<GridView
							grow
							style={{ ...styles.borderTop, ...styles.paddingBox }}
						>
							<Text>Banco...</Text>
						</GridView>
						<GridView style={{ ...styles.borderTop, ...styles.paddingBox }}>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Liquidación Nº</Text>
								</GridView>
								<GridView justify="center">
									<Text>{Formato.Mascara(liquidacion.id ?? 0, "##########")}</Text>
								</GridView>
							</GridView>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Capital</Text>
								</GridView>
								<GridView justify="end">
									<Text>{Formato.Moneda(liquidacion.interesNeto ?? 0)}</Text>
								</GridView>
							</GridView>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Intereses</Text>
								</GridView>
								<GridView justify="end">
									<Text>{Formato.Moneda(liquidacion.interesImporte ?? 0)}</Text>
								</GridView>
							</GridView>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Total</Text>
								</GridView>
								<GridView justify="end">
									<Text>{Formato.Moneda(importeTotal ?? 0)}</Text>
								</GridView>
							</GridView>
						</GridView>
						<GridView
							gap="10px"
							col
							grow
							style={{ ...styles.borderTop, ...styles.paddingBox }}
						>
							<GridView>
								<GridView grow>
									<Text>TOTAL PAGADO</Text>
								</GridView>
								<GridView>
									<Text>{Formato.Moneda(importeTotal ?? 0)}</Text>
								</GridView>
							</GridView>
							<GridView grow>
								<GridView style={styles.paddingRight}>
									<Text>Son</Text>
								</GridView>
								<GridView style={{ maxWidth: "500px" }}>
									<Text>{importeTotalDescipcion}</Text>
								</GridView>
							</GridView>
							<GridView justify="center">
								<Text style={{ fontSize: "22pt" }}>
									Vencimiento {Formato.Fecha(liquidacion.vencimientoFecha)}
								</Text>
							</GridView>
							<GridView justify="center">
								<Text style={{ fontSize: "10pt" }}>
									Posterior a esta fecha el banco no aceptará el pago, debiendo reliquidar el período
								</Text>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.borderTop, ...styles.paddingBox }}>
							<GridView>
								<Text style={styles.titulo}>Cheque Nº:</Text>
							</GridView>
							<GridView>
								<Text style={styles.titulo}>Banco:</Text>
							</GridView>
						</GridView>
					</GridView>
					<GridView>
						<Image src={barcode} />
					</GridView>
				</GridView>
			</Page>
		</Document>
	);
};

export default PDF;
