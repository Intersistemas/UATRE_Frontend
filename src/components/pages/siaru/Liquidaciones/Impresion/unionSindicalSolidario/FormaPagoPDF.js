import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import JsBarcode from "jsbarcode";
import logo1 from "media/Logo1_sidebar.png";
import AsArray from "components/helpers/AsArray.js";
import Formato from "components/helpers/Formato.js";
import UIGrid from "components/ui/Grid/Grid.js";
import styles from "./PDF.styles.js";

const FormaPagoPDF = ({
	empresa = {},
	cabecera = {},
	formasPago = [],
} = {}) => {
	const Grid = ({ style, ...p }) => (
		<UIGrid row render={View} style={{ ...style, ...styles.border }} {...p} />
	);

	const Header = ({ pagina = "" }) => (
		<Grid col>
			<Grid grow justify="end">
				<Text>{pagina}</Text>
			</Grid>
		</Grid>
	);

	const Footer = ({ children }) => <>{children}</>;

	const MyPage = ({ children, header, footer, ...x }) => (
		<Page style={styles.page} size="A5" orientation="landscape" {...x}>
			<Grid col grow gap="5">
				<Header {...header} />
				<Grid col grow gap="10px">
					{children}
				</Grid>
				<Footer {...footer} />
			</Grid>
		</Page>
	);

	const pages = [];

	//#region paginas por tipo de pago (concepto)
	let canvas = document.createElement("canvas");
	const formasSplit = [];
	AsArray(formasPago).forEach((formaPago) => {
		const lineas = [...AsArray(formaPago.lineas)];
		const pagination = {
			index: 1,
			pages: 1,
			size: 12,	//si se quita el overflow a las lineas de datos, dejar en 7
			count: lineas.length,
			data: formaPago,
		};
		if (pagination.count <= pagination.size) return formasSplit.push(pagination);
		pagination.pages = Math.ceil(pagination.count / pagination.size);
		for (let index = 0; index < pagination.pages; index++) {
			pagination.index = index + 1;
			pagination.data = {
				...formaPago,
				lineas: lineas.splice(0, pagination.size),
			};
			formasSplit.push({ ...pagination });
		}
	});
	pages.push(
		...AsArray(formasSplit).map(({ index, pages, data }) => {
			const { codigoBarra, ...formaPago } = data;
			let barcode;
			if (codigoBarra) {
				JsBarcode(canvas, codigoBarra);
				barcode = canvas.toDataURL();
			}
			if (barcode)
				barcode = <Image src={barcode} style={{ width: 400, height: 45 }} />;

			return (
				<MyPage header={{ pagina: `Página ${index} / ${pages}` }} >
					<Grid col width grow style={styles.borderBox}>
						<Grid width justify="center" style={{ ...styles.paddingBox, ...styles.borderBottom, ...styles.titulo }}>
							<Text>UNION ARGENTINA DE TRABAJADORES RURALES Y ESTIBADORES</Text>
						</Grid>
						<Grid width>
							<Grid col width="395">
								<Grid><Text>&nbsp;</Text></Grid>
								<Grid width="395">
									<Grid width="320" style={{ ...styles.borderTop, ...styles.borderBottom, ...styles.borderRight }}>
										<Grid width="180" gap="5" style={{ ...styles.paddingBox, ...styles.borderRight }}>
											<Text style={styles.titulo}>CUIT:</Text>
											<Text>{Formato.Cuit(empresa.cuit)}</Text>
										</Grid>
										<Grid width="140" gap="5" style={styles.paddingBox}>
											<Text style={styles.titulo}>RAZON SOCIAL:</Text>
											<Text style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", maxLines: 1 }}>{empresa.razonSocial}</Text>
										</Grid>
									</Grid>
									<Grid width="75" />
								</Grid>
								<Grid><Text>&nbsp;</Text></Grid>
								<Grid><Text>&nbsp;</Text></Grid>
								<Grid width="395" style={{ ...styles.borderTop, ...styles.borderBottom, ...styles.borderRight }}>
									<Grid width="180" gap="5" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text style={styles.titulo}>PERIODO (MES-AÑO/SEC):</Text>
										<Text>
											{((periodo, sec) =>
												[
													[periodo.slice(4, 6), periodo.slice(0, 4)].join("-"),
													sec,
												].join("/"))(`${cabecera.periodo || "      "}`, 0)}
										</Text>
									</Grid>
									<Grid width="65" gap="5" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text style={styles.titulo}>ACTA NRO:</Text>
										{!cabecera.acta ? (<></>) : (<Text>{Formato.Mascara(cabecera.acta, "###") || "000"}</Text>)}
									</Grid>
									<Grid width="150" gap="5" style={styles.paddingBox}>
										<Text style={styles.titulo}>VENCIMIENTO:</Text>
										<Text>{Formato.Fecha(cabecera.fechaVencimiento)}</Text>
									</Grid>
								</Grid>
								<Grid><Text>&nbsp;</Text></Grid>
							</Grid>
							<Grid width="195" justify="center" style={styles.marginBox}>
								<Grid width="120" col>
									<Grid gap="2">
										<Image src={logo1} style={{ width: "30", height: "30" }} />
										<Grid col justify="end" style={{ ...styles.titulo, marginTop: "5px", fontSize: "26pt", color: "#00558e" }}>
											<Text>UATRE</Text>
										</Grid>
									</Grid>
									<Grid col width style={{ fontSize: "8pt" }}>
										<Text>Unión Argentina de Trabajadores</Text>
										<Text>Rurales y Estibadores</Text>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid><Text>&nbsp;</Text></Grid>
						<Grid width col style={{ ...styles.borderTop, ...styles.borderBottom }}>
							<Grid width>
								<Grid width="180" style={{ ...styles.paddingBox, ...styles.borderRight }}>
									<Text style={styles.titulo}>
										PROVINCIA Y LOCALIDAD LABORAL
									</Text>
								</Grid>
								<Grid width="65" style={{ ...styles.paddingBox, ...styles.borderRight }}>
									<Text style={styles.titulo}>SECCIONAL</Text>
								</Grid>
								<Grid width="75" style={{ ...styles.paddingBox, ...styles.borderRight }}>
									<Text style={styles.titulo}>TRABAJADORES</Text>
								</Grid>
								<Grid width="75" style={{ ...styles.paddingBox, ...styles.borderRight }}>
									<Text style={styles.titulo}>REMUNERACION</Text>
								</Grid>
								<Grid width="65" style={{ ...styles.paddingBox, ...styles.borderRight }}>
									<Text style={styles.titulo}>CAPITAL</Text>
								</Grid>
								<Grid width="65" style={{ ...styles.paddingBox, ...styles.borderRight }}>
									<Text style={styles.titulo}>INTERESES</Text>
								</Grid>
								<Grid width="65" style={styles.paddingBox}>
									<Text style={styles.titulo}>TOTAL</Text>
								</Grid>
							</Grid>
							{AsArray(formaPago.lineas).map((linea) => (
								<Grid width style={styles.borderTop}>
									<Grid width="180" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", maxLines: 1 }}>
											{/* si se quitan los estilos de este text, dejar el tamaño de página en 7 */}
											{[
												linea.seccional?.provinciaDescripcion ||
												" NO ESPECIFICADO",
												`(${linea.seccional?.localidadCodPostal ?? ""}) ${linea.seccional?.localidadNombre ?? ""
												}`,
											].join(" / ")}
										</Text>
									</Grid>
									<Grid width="65" justify="end" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text>
											{`${linea.seccional?.codigo ?? 0}`.replace(
												/^[A-Za-z]+/,
												""
											)}
										</Text>
									</Grid>
									<Grid width="75" justify="end" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text>{linea.trabajadores}</Text>
									</Grid>
									<Grid width="75" justify="end" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text>{Formato.Moneda(linea.remuneraciones)}</Text>
									</Grid>
									<Grid width="65" justify="end" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text>{Formato.Moneda(linea.capital)}</Text>
									</Grid>
									<Grid width="65" justify="end" style={{ ...styles.paddingBox, ...styles.borderRight }}>
										<Text>{Formato.Moneda(linea.intereses)}</Text>
									</Grid>
									<Grid width="65" justify="end" style={styles.paddingBox}>
										<Text>{Formato.Moneda(linea.total)}</Text>
									</Grid>
								</Grid>
							))}
						</Grid>
						<Grid><Text>&nbsp;</Text></Grid>
						<Grid><Text>&nbsp;</Text></Grid>
						<Grid width>
							<Grid
								width="180"
								gap="5"
								style={{
									...styles.paddingBox,
									...styles.borderRight,
									...styles.borderTop,
									...styles.borderBottom,
								}}
							>
								<Text style={styles.titulo}>NRO DE LIQUIDACION:</Text>
								<Text>{Formato.Mascara(cabecera.id, "#".repeat(10))}</Text>
							</Grid>
							<Grid grow />
							<Grid
								width="345"
								style={{
									...styles.paddingBox,
									...styles.borderLeft,
									...styles.borderTop,
									...styles.borderBottom,
									...styles.titulo,
								}}
							>
								<Grid width="150">
									<Text>TOTAL A PAGAR</Text>
								</Grid>
								<Grid width="195" justify="end">
									<Text>{Formato.Moneda(formaPago.total)}</Text>
								</Grid>
							</Grid>
						</Grid>
						<Grid grow />
						<Grid width col justify="end">
							<Grid width justify="center">
								{barcode}
							</Grid>
							<Grid><Text>&nbsp;</Text></Grid>
							<Grid width justify="end" style={{ fontSize: "5pt" }}>
								<Text>Incluye Liquidación de Cuota Sindical y Solidaria</Text>
								<Grid width="75" />
							</Grid>
						</Grid>
					</Grid>
				</MyPage>
			);
		})
	);
	//#endregion

	return (
		<Document title={`Liquidación ${cabecera.id}`} style={styles.grow}>
			{pages}
		</Document>
	);
};

export default FormaPagoPDF;
