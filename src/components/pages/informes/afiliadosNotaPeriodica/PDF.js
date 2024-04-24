import React from "react";
import {
	Document,
	Page as PageRender,
	Text,
	View,
	Image,
	StyleSheet,
} from "@react-pdf/renderer";
import GridRender from "components/ui/Grid/Grid";
import { paginate } from "components/helpers/Utils";
import logo1 from "media/Logo1_sidebar.png";
import logo2 from "media/CGT_RA.png";
import Formato from "components/helpers/Formato";

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
	bodyGap = "0px",
	...x
}) => (
	<PageRender style={styles.page} size="A4" {...x}>
		<Grid col grow gap={bodyGap}>
			{header}
			<Grid
				col
				grow
				gap={gap}
				style={{ border: "1px solid black", borderTop: "0" }}
			>
				{children}
			</Grid>
			{footer}
		</Grid>
	</PageRender>
);

const Cell = ({ style, ...x }) => (
	<Grid width {...x} style={{ padding: "2px", ...style }} />
);

const Row = ({ children = [], style = {}, ...x }) => {
	const border = style.border ?? "1px solid black";
	return (
		<Grid {...x} style={{ border, ...style }}>
			{children.map((v, i) => {
				const props = { style: {} };
				if (i + 1 !== children.length) props.style.borderRight = border;
				return typeof v === "function" ? v(props) : <Cell {...props}>{v}</Cell>;
			})}
		</Grid>
	);
};

/**
 * Listado de afiliados con credenciales impresas.
 * @typedef {{
 * 	codigo: string,
 * 	descripcion: string,
 * 	afiliados: any[]
 * }} Seccional
 * @typedef {{
 * 	codigo: string,
 * 	descripcion: string,
 * 	desdeFecha: number,
 * 	hastaFecha: number,
 * 	seccionales: Seccional[]
 * }} Delegacion
 * @param {object} props
 * @param {string} props.title Titulo del PDF que generará.
 * @param {Delegacion} props.data Datos de afiliados con credenciales impresas.
 */
const PDF = ({ title = "Notificacion de afiliaciones para delegados", data }) => {
	/** @type {{ seccional: Seccional, afiliados: any[], index: number, pages: number }[]} */
	const paginas = [];
	let total = 0;
	data.seccionales.forEach((seccional) => {
		total += seccional.afiliados.length;
		paginas.push(
			...paginate({ data: seccional.afiliados, size: 30, detailed: true }).map(
				({ index, pages, data }) => ({
					seccional,
					afiliados: data,
					index,
					pages,
				})
			)
		);
	});

	return (
		<Document style={styles.document} title={title}>
			{paginas.map(({ seccional, afiliados, index, pages }, pagina) => (
				<Page
					header={
						<Grid width style={{ border: "1px solid black" }}>
							<Grid
								shrink="0"
								gap="5px"
								style={{ padding: "10px", borderRight: "1px solid black" }}
							>
								<Grid col>
									<Grid gap="5px">
										<Image src={logo1} style={{ width: "40", height: "40" }} />
										<Grid col justify="end">
											<P bold size="30">
												UATRE
											</P>
										</Grid>
										<Grid col justify="end" style={{ marginBottom: "4px" }}>
											<P size="8">Union Argentina de</P>
											<P size="8">Trabajadores Rurales</P>
											<P size="8">y Estibadores</P>
										</Grid>
									</Grid>
									<Grid col>
										<P size="7">
											Personeria Gremial Nº 155 - Adherida a la C.G.T -
											Reconquista 630 Cap. Fed.
										</P>
									</Grid>
								</Grid>
								<Image src={logo2} style={{ width: "50", height: "50" }} />
							</Grid>
							<Grid grow justify="center" style={{ padding: "10px" }}>
								<Grid col justify="center" width="125px">
									<P size="16" align="center">
										NOTIFICACIÓN DE AFILIADOS
									</P>
								</Grid>
							</Grid>
						</Grid>
					}
					footer={
						<Grid col>
							<Grid grow justify="end">
								<P>{`Página ${pagina + 1} / ${paginas.length}`}</P>
							</Grid>
						</Grid>
					}
					key={index}
				>
					<Grid col width grow gap="10px">
						<Grid
							width
							justify="center"
							style={{ borderBottom: "1px solid black", padding: "20px 10px" }}
						>
							<P size="10" align="center">
								Por la presente se informa al Cro. Delegado regional de{" "}
								{data.descripcion}{" "}que las solicitudes de los siguientes
								trabajadores han sido ingresada durante el período de{" "}
								{Formato.Periodo(data.desdeFecha)} a{" "}
								{Formato.Periodo(data.hastaFecha)} las cuales se encuentran
								aprobadas
							</P>
						</Grid>
						<Grid width style={{ padding: "0 10px" }}>
							<P size="10" style={{ maxLines: 1, textOverflow: "ellipsis" }}>
								Seccional: {seccional.codigo} - {seccional.descripcion}
							</P>
						</Grid>
						<Grid col style={{ padding: "0 10px" }}>
							<Row>
								{(x) => (
									<Cell {...x} justify="center">
										<P size="10">APELLIDO Y NOMBRE</P>
									</Cell>
								)}
								{(x) => (
									<Cell {...x} width="190px" justify="center">
										<P size="10">Nº AFILIADO</P>
									</Cell>
								)}
								{(x) => (
									<Cell {...x} width="210px" justify="center">
										<P size="10">CUIL</P>
									</Cell>
								)}
								{(x) => (
									<Cell {...x} justify="center">
										<P size="10">SECCIONAL</P>
									</Cell>
								)}
							</Row>
							{afiliados.map((afiliado, k) => (
								<Row key={k} style={{ borderTop: "0" }}>
									{(x) => (
										<Cell {...x} width>
											<P
												size="10"
												style={{ maxLines: 1, textOverflow: "ellipsis" }}
											>
												{afiliado.nombre}
											</P>
										</Cell>
									)}
									{(x) => (
										<Cell {...x} width="190px" justify="center">
											<P size="10">{afiliado.nroAfiliado}</P>
										</Cell>
									)}
									{(x) => (
										<Cell {...x} width="210px" justify="center">
											<P size="10">{Formato.Cuit(afiliado.cuil)}</P>
										</Cell>
									)}
									<P
										size="10"
										style={{ maxLines: 1, textOverflow: "ellipsis" }}
									>
										{afiliado.seccional}
									</P>
								</Row>
							))}
						</Grid>
						{index !== pages ? null : (
							<Grid style={{ padding: "0 10px" }}>
								<P size="10">
									TOTAL de la seccional: {seccional.afiliados.length}
								</P>
							</Grid>
						)}
						{paginas.length - pagina !== 1 ? null : (
							<Grid style={{ padding: "0 10px" }}>
								<P size="10">TOTAL de la delegacion: {total}</P>
							</Grid>
						)}
						<Grid col grow justify="end">
							<Grid justify="end" style={{ padding: "10px" }}>
								<Grid col>
									<Grid grow justify="center">
										<P size="10">{".".repeat(75)}</P>
									</Grid>
									<Grid grow justify="center">
										<P size="10">SECRETARIO DE ORGANIZACION</P>
									</Grid>
									<Grid grow justify="center">
										<P size="10">SECRETARIADO NACIONAL UATRE</P>
									</Grid>
									<Grid grow justify="center">
										<P size="8">SELLO Y FIRMA</P>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Page>
			))}
		</Document>
	);
};

export default PDF;
