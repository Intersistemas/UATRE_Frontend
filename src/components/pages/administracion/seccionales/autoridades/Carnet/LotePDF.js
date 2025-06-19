import React from "react";
import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
} from "@react-pdf/renderer";
import UIGrid from "components/ui/Grid/Grid";
import Formato from "components/helpers/Formato.js";

/**
 * @typedef Seccional
 * @property {number} id
 * @property {string} nombre
 * @property {string} codigo
 * @property {string} provincia
 */

/**
 * @typedef Afiliado
 * @property {number} id
 * @property {string} nombre
 * @property {string} documentoTipo
 * @property {number} documentoNumero
 * @property {number} nroAfiliado
 */

/**
 * @typedef Autoridad
 * @property {string} cargo
 */

/**
 * @typedef {Afiliado & Autoridad} AfiliadoAutoridad
 */

const fontSizePt = 8;
const styles = StyleSheet.create({
	document: { flexGrow: 1 },
	page: {
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 5,
		paddingBottom: 5,
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
	<UIGrid row render={View} style={{ ...style, ...styles.border }} {...p} />
);

/** @type {Text} */
const P = ({
	size = fontSizePt,
	align = "left",
	bold = false,
	style,
	...p
}) => (
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

/**
 * @param {object} props
 * @param {Seccional} props.seccional
 * @param {AfiliadoAutoridad} props.autoridad
 */
const Hoja = ({ autoridad, seccional }) => (
	<Page style={styles.page} size={CR80} orientation="landscape">
		<Grid col full gap="2px" justify="center">
			<P size={fontSizePt + 2} align="center" bold>
				{`${autoridad.nombre}`.toUpperCase()}
			</P>
			<P align="center">
				{[autoridad.documentoTipo, Formato.Numero(autoridad.documentoNumero)]
					.filter((r) => r)
					.join(" ").toUpperCase()}
			</P>
			<P align="center">{`Nº Afil. ${Formato.Numero(autoridad.nroAfiliado)}`}</P>
			<P size={fontSizePt + 2} align="center" bold>
				{`${autoridad.cargo}`.toUpperCase()}
			</P>
			<P align="center">
				{(((v) => (v.codigo ? `Seccional Nº ${v.codigo} ${v.nombre}` : ""))(seccional)).toUpperCase()}
			</P>
			<P align="center">
				{`Provincia de ${seccional.provincia}`.toUpperCase()}
			</P>
		</Grid>
	</Page>
);

/**
 * Impresion de credenciales de autoridades de seccional en lote.
 * @param {object} props
 * @param {string} props.title Titulo del PDF que generará.
 * @param {Seccional} props.seccional Datos de la seccional.
 * @param {AfiliadoAutoridad[]} props.autoridades Datos de autoridades de seccional a imprimirles credenciales.
 */
const LotePDF = ({ title = "Credenciales de autoridades de seccional", seccional, autoridades }) => (
	<Document style={styles.document} title={title}>
		{autoridades.map((autoridad, i) => (
			<Hoja {...{ seccional, autoridad }} key={i} />
		))}
	</Document>
);

export default LotePDF;
