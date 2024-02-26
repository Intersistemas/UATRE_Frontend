import React from "react";
import JsBarcode from "jsbarcode";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import UIGrid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato.js";

const fontSizePt = 8
const styles = StyleSheet.create({
	document: { flexGrow: 1 },
	page: {
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 20,
		paddingBottom: 20,
		display: "flex",
		position: "absolute",
		left: 0,
		right: 0,
		width: "100%",
		height: "100%",
		fontFamily: "Helvetica",
		fontSize: `${fontSizePt}pt`,
	},
	normal: {
		fontFamily: "Helvetica",
	},
	bold: {
		fontFamily: "Helvetica-Bold",
	},
});

/** @type {UIGrid} */
const Grid = ({ style, ...p }) => (
	<UIGrid render={View} style={{ ...style, ...styles.border }} {...p} />
);

/** @type {Text} */
const P = ({ size = (fontSizePt - 2), align = "left", bold = false, style, ...p }) => (
	<Text
		style={{
			fontSize: `${size < 0 ? 1 : size}pt`,
			textAlign: align,
			...(bold ? styles.bold : styles.normal),
			...style,
		}}
		{...p}
	/>
);

// 54mm x 86mm
const CR80 = [153.07, 243.78];

const Hoja = ({
	nombre = "",
	tipoDocumento = "",
	documento = "",
	nroAfiliado = "",
	provincia = "",
	nacionalidad = "",
	seccionalCodigo = "",
	seccional = "",
	fechaIngreso = "",
	cuil = "",
	barcodeDataURL = "",
}) => (
	<Page style={styles.page} size={CR80} orientation="landscape">
		<Grid col full gap="5px">
			<P size={fontSizePt + 2} align="center" bold>
				{nombre}
			</P>
			<Grid width="full">
				<Grid col width="full" gap="2px">
					<P align="center">
						{[tipoDocumento, Formato.DNI(documento)].filter((r) => r).join(" ")}
					</P>
					<P align="center">{`Afil. Nro. ${nroAfiliado}`}</P>
					<P size={fontSizePt} align="center" bold>
						{provincia}
					</P>
				</Grid>
				<Grid col width="full" gap="2px">
					<P align="center">{nacionalidad}</P>
					<P align="center">
						{((v) => (v ? `Secc. Nro. ${v}` : ""))(seccionalCodigo)}
					</P>
					<P size={fontSizePt} align="center" bold>
						{seccional}
					</P>
				</Grid>
			</Grid>
			<P size={fontSizePt + 2} align="center" bold>
				{`Emisión: ${Formato.Fecha(fechaIngreso)}`}
			</P>
			<Grid width="full" justify="center" grow>
				<Grid col width="75%" justify="center">
					<Image src={barcodeDataURL} />
					<P size={fontSizePt} align="center">
						{Formato.Mascara(cuil, "##-########-#")}
					</P>
				</Grid>
			</Grid>
			<Grid width="full">
				<Grid col width="70%">
					<P>ESTA TARJETA PERTENECE A UATRE</P>
					<P>EN CASO DE ENCONTRARLA</P>
					<P>AGRADECEMOS SE ENVIE A:</P>
					<P>RECONQUISTA 630 PISO 6º - CIUDAD DE BS. AS.</P>
					<P>TEL.: 011-315-5800</P>
				</Grid>
				<Grid col width="30%" justify="end">
					<P align="center">Secretariado Nacional</P>
					<P align="center">U.A.T.R.E.</P>
				</Grid>
			</Grid>
		</Grid>
	</Page>
);

/**
 * Impresion de credenciales de afiliados en lote.
 * @param {object} props
 * @param {string} props.title Titulo del PDF que generará.
 * @param {array} props.data Datos de afiliados a imprimirles credenciales.
 */
const LotePDF = ({ title = "Credenciales de afiliados", data }) => {
	let canvas = document.createElement("canvas");
	return (
		<Document style={styles.document} title={title}>
			{data.map((v, i) => {
				JsBarcode(canvas, Formato.Mascara(v.cuil, "##-########-#T"), {
					format: "CODE39",
					height: "50px",
					displayValue: false,
				});
				return <Hoja {...v} key={i} barcodeDataURL={canvas.toDataURL()} />;
			})}
		</Document>
	);
};

export default LotePDF;
