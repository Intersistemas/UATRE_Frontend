import React from "react";
import dayjs from "dayjs";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import Formato from "components/helpers/Formato";
import { paginate } from "components/helpers/Utils";
import UIGrid from "components/ui/Grid/Grid";

/**
 * @typedef Seccional
 * @property {number} id
 * @property {string} nombre
 * @property {string} codigo
 * @property {string} provincia
 */

/**
 * @typedef Afiliado
 * @property {number} cuil
 * @property {number} nroAfiliado
 * @property {string} nombre
 * @property {number} documento
 * @property {number} empresaId
 * @property {number} empresaCUIT
 * @property {string} empresaDescripcion
 * @property {string} fechaIngreso
 */

/**
 * @typedef SeccionalAfiliados
 * @property {Seccional} seccional
 * @property {Afiliado[]} afiliados
 */

const fontSizePt = 10;
const styles = StyleSheet.create({
	document: { flexGrow: 1 },
	page: {
		paddingLeft: "14mm",
		paddingRight: "14mm",
		paddingTop: "7mm",
		paddingBottom: "7mm",
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

/** @type {Grid} */
const Td = ({ style, ...p }) => (
	<Grid style={{ padding: "1px", overflow: "hidden", ...style }} {...p} />
);

/** @type {Grid} */
const Tr = ({ children, ...p }) => (
	<Grid width height="12px" {...p}>
		{React.Children.map(children, (child, index) => {
			if (!index) return child;
			const props = { ...child.props };
			props.style = { borderLeft: "1px solid black", ...props.style };
			return React.cloneElement(child, props);
		})}
	</Grid>
);

/** @type {Grid} */
const Table = ({ children, style, ...p }) => (
	<Grid col style={{ border: "1px solid black", ...style }} {...p}>
		{React.Children.map(children, (child, index) => {
			if (!index) return child;
			const props = { ...child.props };
			props.style = { borderTop: "1px solid black", ...props.style };
			return React.cloneElement(child, props);
		})}
	</Grid>
);

/** @type {Text} */
const P = ({
	size = fontSizePt - 2,
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

/**
 * Impresion de credenciales de afiliados en lote.
 * @param {object} props
 * @param {Seccional} props.seccional Datos de seccional.
 * @param {{ index: number, size: number, pages: number, count: number, data: Afiliado[] }} props.page Pagina de afiliados.
 */
const Hoja = ({ seccional, page }) => (
	<Page style={styles.page} size="A4">
		<Grid col full gap="30px">
			<Grid col width gap="3px">
				<P align="center">
					UNION ARGENTINA DE TRABAJADORES RURALES Y ESTIBADORES
				</P>
				<P align="center">U.A.T.R.E.</P>
				<P align="center">Reconquista 630 - Piso -</P>
				<P align="center">Cp: 1003 - CIUDAD DE BUENOS AIRES</P>
				<P align="center">-----------------------------------</P>
				<P align="center">{`SECCIONAL ${seccional.codigo} - ${seccional.nombre}`}</P>
				<P align="center">{seccional.provincia?.toUpperCase()}</P>
				<Grid gap="25px">
					<Grid width justify="end">
						<P>FECHA: {dayjs().format("DD.MM.YYYY")}</P>
					</Grid>
					<Grid width>
						<P>PADRÓN DE AFILIADOS</P>
					</Grid>
				</Grid>
			</Grid>
			<Grid col grow gap="12px">
				<Table width>
					<Tr>
						<Td justify="center" width>
							<P>APELLIDO(s) Y NOMBRE(s)</P>
						</Td>
						<Td justify="center" width="140px">
							<P>DOC. Nº</P>
						</Td>
						<Td justify="center" width="165px">
							<P>CUIL</P>
						</Td>
						<Td justify="center" width="140px">
							<P>AFI. Nº</P>
						</Td>
						<Td justify="center" width>
							<P>RAZON SOCIAL</P>
						</Td>
						<Td justify="center" width="140px">
							<P>ALTA</P>
						</Td>
					</Tr>
					{page.data.map((afiliado, i) => (
						<Tr key={i}>
							<Td justify="start" width>
								<P>{afiliado.nombre}</P>
							</Td>
							<Td justify="end" width="140px">
								<P>{afiliado.documento}</P>
							</Td>
							<Td justify="end" width="165px">
								<P>{afiliado.cuil}</P>
							</Td>
							<Td justify="end" width="140px">
								<P>{afiliado.nroAfiliado}</P>
							</Td>
							<Td justify="start" width>
								<P>{afiliado.empresaDescripcion}</P>
							</Td>
							<Td justify="end" width="140px">
								<P>{Formato.Fecha(afiliado.fechaIngreso)}</P>
							</Td>
						</Tr>
					))}
				</Table>
				<Grid width justify="end">
					<P>{page.index !== page.pages ? "" : `Total de Afiliados: ${page.count}`}</P>
				</Grid>
			</Grid>
			<Grid width justify="center">
				<P>{`Página ${page.index} / ${page.pages}`}</P>
			</Grid>
		</Grid>
	</Page>
);

/**
 * Impresion de credenciales de afiliados en lote.
 * @param {object} props
 * @param {string} props.title Titulo del PDF que generará.
 * @param {SeccionalAfiliados[]} props.data Seccionales con sus afiliados.
 */
const PadronPDF = ({ title = "Padron de afiliados", data }) => (
	<Document style={styles.document} title={title}>
		{data.map(({ seccional, afiliados: data }, dataIx) =>
			paginate({ data, size: 51, detailed: true }).map((page, pageIx) => (
				<Hoja seccional={seccional} page={page} key={`${dataIx}-${pageIx}`} />
			))
		)}
	</Document>
);

export default PadronPDF;
