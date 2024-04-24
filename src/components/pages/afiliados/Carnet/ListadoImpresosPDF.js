import React from "react";
import {
	Document,
	Page as PageRender,
	Text,
	View,
	Image,
	StyleSheet,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import GridRender from "components/ui/Grid/Grid";
import { paginate } from "components/helpers/Utils";
import logo1 from "media/Logo1_sidebar.png";

const fontSizePt = 8;
const styles = StyleSheet.create({
	document: { flexGrow: 1 },
	page: {
		padding: "15px",
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

/** @type {GridRender} */
const Grid = ({ style, ...p }) => (
	<GridRender render={View} style={{ ...style, ...styles.border }} {...p} />
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

const Page = ({
	children,
	header,
	footer,
	gap = "10px",
	bodyGap = "5px",
	...x
}) => (
	<PageRender style={styles.page} size="A4" {...x}>
		<Grid col grow gap={bodyGap}>
			{header}
			<Grid col grow gap={gap}>
				{children}
			</Grid>
			{footer}
		</Grid>
	</PageRender>
);

/**
 * Listado de afiliados con credenciales impresas.
 * @param {object} props
 * @param {string} props.title Titulo del PDF que generará.
 * @param {array} props.data Datos de afiliados con credenciales impresas.
 */
const ListadoImpresosPDF = ({
	title = "Credenciales de afiliados emitidas",
	data,
}) => {
	const paginas = [];
	data.forEach((seccional) =>
		paginas.push(
			...paginate({ data: seccional.lineas, size: 55 }).map((lineas) => ({
				seccional,
				lineas,
			}))
		)
	);

	return (
		<Document style={styles.document} title={title}>
			{paginas.map((pagina, index) => (
				<Page
					header={
						<Grid col>
							<Grid gap="5">
								<Image src={logo1} style={{ width: "40", height: "40" }} />
								<Grid col justify="end">
									<P bold size="40">
										UATRE
									</P>
								</Grid>
							</Grid>
							<Grid col width>
								<P bold size="8">
									Union Argentina de Trabajadores
								</P>
								<Grid width>
									<P bold size="8">
										Rurales y Estibadores
									</P>
									<Grid grow justify="end">
										<Grid gap="20px">
											<P size="10">
												Fecha de emision: {dayjs().format("DD/MM/YYYY")}
											</P>
											<P>{`Página ${index + 1} / ${paginas.length}`}</P>
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					}
					bodyGap="10px"
					key={index}
				>
					<Grid col width gap="10px">
						<Grid col>
							<Grid>
								<P size="10" bold>Seccional: {pagina.seccional.codigo}</P>
							</Grid>
							<Grid>
								<P size="10" bold>Provincia: {pagina.seccional.provinciaDescripcion}</P>
							</Grid>
						</Grid>
						<Grid width gap="10px" style={{ borderBottom: "1px solid black" }}>
							<Grid width="50px" justify="end">
								<P size="12" bold>
									Afiliado
								</P>
							</Grid>
							<Grid grow>
								<P size="12" bold>
									Nombre y apellido
								</P>
							</Grid>
						</Grid>
						<Grid col grow>
							{pagina.lineas.map((v, i) => (
								<Grid width gap="10px" key={i}>
									<Grid width="50px" justify="end">
										<P size="10">{v.nroAfiliado}</P>
									</Grid>
									<Grid grow>
										<P size="10">{v.nombre}</P>
									</Grid>
								</Grid>
							))}
						</Grid>
					</Grid>
				</Page>
			))}
			{/* {data.map((seccional) =>
				paginate({ data: seccional.lineas, size: 55 }).map(
					(pagina, index, { length }) => (
						<Page
							header={
								<Grid col>
									<Grid gap="5">
										<Image src={logo1} style={{ width: "40", height: "40" }} />
										<Grid col justify="end">
											<P bold size="40">
												UATRE
											</P>
										</Grid>
									</Grid>
									<Grid col width>
										<P bold size="8">
											Union Argentina de Trabajadores
										</P>
										<Grid width>
											<P bold size="8">
												Rurales y Estibadores
											</P>
											<Grid grow justify="end">
												<Grid gap="20px">
													<P size="10">
														Fecha de emision: {dayjs().format("DD/MM/YYYY")}
													</P>
													<P>{`Página ${index + 1} / ${length}`}</P>
												</Grid>
											</Grid>
										</Grid>
									</Grid>
									<Grid><P size="10">Seccional: {seccional.codigo}</P></Grid>
									<Grid><P size="10">Provincia: {seccional.provinciaDescripcion}</P></Grid>
								</Grid>
							}
							key={index}
						>
							<Grid col width gap="10px">
								<Grid width style={{ borderBottom: "1px solid black" }}>
									<Grid width="50px" justify="end">
										<P size="12" bold>
											Afiliado
										</P>
									</Grid>
									<Grid grow>
										<P size="12" bold>
											Nombre y apellido
										</P>
									</Grid>
								</Grid>
								<Grid col grow>
									{pagina.map((v, i) => (
										<Grid width gap="10px" key={i}>
											<Grid width="50px" justify="end">
												<P size="10">{v.nroAfiliado}</P>
											</Grid>
											<Grid grow>
												<P size="10">{v.nombre}</P>
											</Grid>
										</Grid>
									))}
								</Grid>
							</Grid>
						</Page>
					)
				)
			)} */}
		</Document>
	);
};

export default ListadoImpresosPDF;
