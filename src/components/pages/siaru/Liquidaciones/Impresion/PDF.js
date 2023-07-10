import React from "react";
import { Document, Page, View, Text, Image } from "@react-pdf/renderer";
import styles from "./PDF.styles.js";
import JsBarcode from "jsbarcode";
import logo1 from "../../../../../media/Logo1_sidebar.png";
import Formato from "../../../../helpers/Formato.js";
import Descriptor from "../../../../helpers/Descriptor";

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

	return (
		<Document style={styles.grow}>
			<Page style={styles.page} size="A4">
				<View
					style={{
						...styles.col,
						...styles.gap,
						...styles.grow,
						...styles.borderBox,
						...styles.marginBox,
						...styles.paddingBox,
					}}
				>
					<View style={{ ...styles.row, ...styles.gap }}>
						<Image src={logo1} style={{ width: "70", height: "70" }} />
						<View style={{ ...styles.col, ...styles.justifyCenter }}>
							<Text style={{ fontSize: "55pt" }}>UATRE</Text>
						</View>
					</View>
					<View
						style={{
							...styles.col,
							...styles.grow,
							...styles.borderBox,
						}}
					>
						<View style={{ ...styles.row }}>
							<View
								style={{
									...styles.col,
									...styles.flex,
									...styles.grow,
									...styles.border,
									...styles.paddingBox,
									...styles.borderRight,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>C.U.I.T.</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{Formato.Cuit(empresa.cuit)}</Text>
								</View>
							</View>
							<View
								style={{
									...styles.col,
									...styles.grow,
									...styles.border,
									...styles.paddingBox,
									...styles.borderRight,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Periodo (Año-Mes)</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{Formato.Periodo(liquidacion.periodo)}</Text>
								</View>
							</View>
							<View
								style={{
									...styles.col,
									...styles.grow,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Número de Acta</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>000000</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								...styles.col,
								...styles.borderTop,
								...styles.paddingBox,
							}}
						>
							<View style={{ ...styles.row }}>
								<Text style={{ ...styles.titulo }}>Razón Social</Text>
							</View>
							<View style={{ ...styles.row }}>
								<Text>{empresa.razonSocial}</Text>
							</View>
						</View>
						<View
							style={{
								...styles.col,
								...styles.borderTop,
								...styles.paddingBox,
							}}
						>
							<View style={{ ...styles.row }}>
								<Text style={{ ...styles.titulo }}>Provincia Laboral</Text>
							</View>
							<View style={{ ...styles.row }}>
								<Text>{establecimiento.provinciaDescripcion ?? ""}&nbsp;</Text>
							</View>
						</View>
						<View
							style={{
								...styles.col,
								...styles.borderTop,
								...styles.paddingBox,
							}}
						>
							<View style={{ ...styles.row }}>
								<Text style={{ ...styles.titulo }}>Localidad Laboral</Text>
							</View>
							<View style={{ ...styles.row }}>
								<Text>{establecimiento.localidadDescripcion ?? ""}&nbsp;</Text>
							</View>
						</View>
						<View style={{ ...styles.row, ...styles.borderTop }}>
							<View
								style={{
									...styles.col,
									...styles.grow,
									...styles.border,
									...styles.borderRight,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Seccional</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{0 /* ToDo */}</Text>
								</View>
							</View>
							<View
								style={{
									...styles.col,
									...styles.grow,
									...styles.border,
									...styles.borderRight,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Trabajadores</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{liquidacion.cantidadTrabajadores ?? 0}</Text>
								</View>
							</View>
							<View
								style={{
									...styles.col,
									...styles.grow,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Remuneraciones</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>
										{Formato.Moneda(liquidacion.totalRemuneraciones ?? 0)}
									</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								...styles.row,
								...styles.borderTop,
								...styles.paddingBox,
								...styles.grow,
							}}
						>
							<Text>Banco...</Text>
						</View>
						<View style={{ ...styles.row, ...styles.borderTop }}>
							<View
								style={{
									...styles.col,
									...styles.grow,
									...styles.border,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Liquidación Nº</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{Formato.Entero(liquidacion.id ?? 0)}</Text>
								</View>
							</View>
							<View
								style={{
									...styles.grow,
									...styles.border,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Capital</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{Formato.Moneda(liquidacion.interesNeto ?? 0)}</Text>
								</View>
							</View>
							<View
								style={{
									...styles.grow,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Intereses</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{Formato.Moneda(liquidacion.interesImporte ?? 0)}</Text>
								</View>
							</View>
							<View
								style={{
									...styles.grow,
									...styles.paddingBox,
								}}
							>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text style={{ ...styles.titulo }}>Total</Text>
								</View>
								<View style={{ ...styles.row, ...styles.justifyCenter }}>
									<Text>{Formato.Moneda(importeTotal ?? 0)}</Text>
								</View>
							</View>
						</View>
						<View
							style={{
								...styles.col,
								...styles.gap,
								...styles.grow,
								...styles.borderTop,
								...styles.paddingBox,
							}}
						>
							<View style={{ ...styles.row }}>
								<View style={{ ...styles.grow }}>
									<Text>TOTAL PAGADO</Text>
								</View>
								<View>
									<Text>{Formato.Moneda(importeTotal ?? 0)}</Text>
								</View>
							</View>
							<View style={{ ...styles.row, ...styles.grow }}>
								<View style={{ ...styles.paddingRight }}>
									<Text>Son</Text>
								</View>
								<View>
									<Text>{importeTotalDescipcion}</Text>
								</View>
							</View>
							<View style={{ ...styles.row, ...styles.justifyCenter }}>
								<Text style={{ fontSize: "22pt" }}>
									Vencimiento {Formato.Fecha(liquidacion.vencimientoFecha)}
								</Text>
							</View>
						</View>
						<View
							style={{
								...styles.col,
								...styles.borderTop,
								...styles.paddingBox,
							}}
						>
							<View style={{ ...styles.row }}>
								<Text style={{ ...styles.titulo }}>Cheque Nº:</Text>
							</View>
							<View style={{ ...styles.row }}>
								<Text style={{ ...styles.titulo }}>Banco:</Text>
							</View>
						</View>
					</View>
					<View style={{ ...styles.row }}>
						<Image src={barcode} />
					</View>
				</View>
			</Page>
		</Document>
	);
};

export default PDF;
