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
 * @typedef Delegacion
 * @property {number} id
 * @property {string} nombre
 * @property {number} refLocalidadId
 * @property {string} refLocalidadDescripcion
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
 * @typedef Delegado
 * @property {string} cargo
 */

/**
 * @typedef {Afiliado & Delegado} AfiliadoDelegado
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
 * @param {Delegacion} props.delegacion
 * @param {AfiliadoDelegado} props.delegado
 */
const Hoja = ({ delegado, delegacion }) => (
	<Page style={styles.page} size={CR80} orientation="landscape">
		<Grid col full gap="2px" justify="center">
			<P size={fontSizePt + 2} align="center" bold>
				{`${delegado.nombre}`.toUpperCase()}
			</P>
			<P align="center">
				{[delegado.documentoTipo, Formato.Numero(delegado.documentoNumero)]
					.filter((r) => r)
					.join(" ")
					.toUpperCase()}
			</P>
			<P align="center">{`Nº Afil. ${Formato.Numero(delegado.nroAfiliado)}`}</P>
			<P size={fontSizePt + 2} align="center" bold>
				{`${delegado.cargo}`.toUpperCase()}
			</P>
			<P size={fontSizePt + 2} align="center" bold>
				{`${delegacion.nombre}`.toUpperCase()}
			</P>
			<P size={fontSizePt + 2} align="center" bold>
				{"PROVINCIA "}
				{delegacion.provincia
					? `DE ${delegacion.provincia}`.toUpperCase()
					: `SIN ESPECIFICAR`}
			</P>
		</Grid>
	</Page>
);

/**
 * Impresion de credenciales de delegado de delegacion en lote.
 * @param {object} props
 * @param {string} props.title Titulo del PDF que generará.
 * @param {Delegacion} props.delegacion Datos de la delegacion.
 * @param {AfiliadoDelegado[]} props.delegados Datos de delegados de delegacion a imprimirles credenciales.
 */
const LotePDF = ({ title = "Credenciales de delegados de delegación", delegacion, delegados }) => (
	<Document style={styles.document} title={title}>
		{delegados.map((delegado, i) => (
			<Hoja {...{ delegacion, delegado }} key={i} />
		))}
	</Document>
);

export default LotePDF;
