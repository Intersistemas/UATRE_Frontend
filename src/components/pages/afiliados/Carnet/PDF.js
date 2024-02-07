import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import JsBarcode from "jsbarcode";
import Formato from "components/helpers/Formato.js";
import GridNormal from "components/ui/Grid/Grid.js";
import styles from "./PDF.styles.js";

const PDF = ({ afiliado = {}, seccional = {} } = {}) => {
	const Grid = ({ style, ...p }) => (
		<GridNormal render={View} style={{ ...style, ...styles.border }} {...p} />
	);
	const P = ({ size = 10, align = "left", bold = false, style, ...p }) => (
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

	let canvas = document.createElement("canvas");
	JsBarcode(canvas, Formato.Mascara(afiliado.cuil, "##-########-#T"), {
		format: "CODE39",
		height: "50px",
		displayValue: false,
	});

	return (
		<Document style={styles.document}>
			<Page style={styles.page} size="A6" orientation="landscape">
				<Grid col full gap="10px">
					<P size={14} align="center" bold>
						{afiliado.nombre}
					</P>
					<Grid width="full">
						<Grid col width="full" gap="5px">
							<P align="center">
								{[afiliado.tipoDocumento, Formato.DNI(afiliado.documento)]
									.filter((r) => r)
									.join(" ")}
							</P>
							<P align="center">{`Afil. Nro. ${afiliado.nroAfiliado}`}</P>
							<P size={12} align="center" bold>
								{afiliado.provincia}
							</P>
						</Grid>
						<Grid col width="full" gap="5px">
							<P align="center">{afiliado.nacionalidad}</P>
							<P align="center">
								{((v) => (v ? `Secc. Nro. ${v}` : ""))(seccional.codigo)}
							</P>
							<P size={12} align="center" bold>
								{seccional.descripcion}
							</P>
						</Grid>
					</Grid>
					<P size={14} align="center" bold>
						{`Emisión: ${Formato.Fecha(afiliado.fechaIngreso)}`}
					</P>
					<Grid width="full" justify="center" grow>
						<Grid col width="75%" justify="center">
							<Image src={canvas.toDataURL()} />
							<P size={12} align="center">
								{Formato.Mascara(afiliado.cuil, "##-########-#")}
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
		</Document>
	);
};

export default PDF;
