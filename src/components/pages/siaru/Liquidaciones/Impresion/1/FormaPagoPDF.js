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
		<UIGrid render={View} style={{ ...style, ...styles.border }} {...p} />
	);

	const Header = ({ pagina = "" }) => (
		<Grid col>
			<Grid gap="5">
				<Image src={logo1} style={{ width: "40", height: "40" }} />
				<Grid col justify="end">
					<Text style={{ ...styles.titulo, fontSize: "40pt" }}>UATRE</Text>
				</Grid>
			</Grid>
			<Grid col width>
				<Text style={{ ...styles.titulo, fontSize: "8pt" }}>
					Union Argentina de Trabajadores
				</Text>
				<Grid width>
					<Text style={{ ...styles.titulo, fontSize: "8pt" }}>
						Rurales y Estibadores
					</Text>
					<Grid grow justify="end">
						<Text>{pagina}</Text>
					</Grid>
				</Grid>
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
			size: 8,
			count: lineas.length,
			data: formaPago,
		};
		if (pagination.count <= pagination.size)
			return formasSplit.push(pagination);

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
				<MyPage header={{ pagina: `Página ${index} / ${pages}` }}>
					<Grid col width gap="10" grow style={styles.borderBox}>
						<Grid width style={styles.borderBottom}>
							<Grid
								width="95"
								gap="5"
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<Text style={styles.titulo}>CUIT:</Text>
								<Text>{Formato.Cuit(empresa.cuit)}</Text>
							</Grid>
							<Grid grow gap="5" style={styles.paddingBox}>
								<Text style={styles.titulo}>RAZON SOCIAL:</Text>
								<Text>{empresa.razonSocial}</Text>
							</Grid>
						</Grid>
						<Grid width style={{ ...styles.borderTop, ...styles.borderBottom }}>
							<Grid
								col
								width="75"
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<Grid>
									<Text style={styles.titulo}>CONCEPTO:</Text>
								</Grid>
								<Grid justify="center">
									<Text>
										{`${
											formaPago.liquidacionTipoPagoDescripcion ?? ""
										}`.toUpperCase()}
									</Text>
								</Grid>
							</Grid>
							<Grid
								col
								grow
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<Grid>
									<Text style={styles.titulo}>PERIODO (MES-AÑO/SEC):</Text>
								</Grid>
								<Grid justify="end">
									<Text>
										{((periodo, sec) =>
											[
												[periodo.slice(4, 6), periodo.slice(0, 4)].join("-"),
												sec,
											].join("/"))(`${cabecera.periodo || "      "}`, 0)}
									</Text>
								</Grid>
							</Grid>
							<Grid
								col
								width="60"
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<Grid>
									<Text style={styles.titulo}>ACTA NRO:</Text>
								</Grid>
								<Grid justify="center" style={styles.titulo}>
									<Text>{Formato.Mascara(cabecera.acta, "###") || "000"}</Text>
								</Grid>
							</Grid>
							<Grid
								col
								width="110"
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<Grid>
									<Text style={styles.titulo}>VENCIMIENTO:</Text>
								</Grid>
								<Grid justify="center">
									<Text>{Formato.Fecha(cabecera.fechaVencimiento)}</Text>
								</Grid>
							</Grid>
							<Grid
								col
								width="210"
								justify="end"
								style={{ ...styles.paddingBox, fontSize: "6pt" }}
							>
								<Text>
									Luego de esta fecha no se aceptará el pago y deberá reliquidar
									el período
								</Text>
							</Grid>
						</Grid>
						<Grid
							col
							width
							style={{ ...styles.borderTop, ...styles.borderBottom }}
						>
							<Grid width>
								<Grid
									grow
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<Text style={styles.titulo}>
										PROVINCIA Y LOCALIDAD LABORAL
									</Text>
								</Grid>
								<Grid
									width="60"
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<Text style={styles.titulo}>SECCIONAL</Text>
								</Grid>
								<Grid
									width="40"
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<Text style={styles.titulo}>TRAB.</Text>
								</Grid>
								<Grid
									width="70"
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<Text style={styles.titulo}>REMUN.</Text>
								</Grid>
								<Grid
									width="70"
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<Text style={styles.titulo}>CAPITAL</Text>
								</Grid>
								<Grid
									width="70"
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<Text style={styles.titulo}>INTERESES</Text>
								</Grid>
								<Grid width="70" style={styles.paddingBox}>
									<Text style={styles.titulo}>TOTAL</Text>
								</Grid>
							</Grid>
							{AsArray(formaPago.lineas).map((linea) => (
								<Grid width style={styles.borderTop}>
									<Grid
										grow
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>
											{[
												linea.seccional?.provinciaDescripcion ||
													" NO ESPECIFICADO",
												`(${linea.seccional?.localidadCodPostal ?? ""}) ${
													linea.seccional?.localidadNombre ?? ""
												}`,
											].join(" / ")}
										</Text>
									</Grid>
									<Grid
										width="60"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>
											{`${linea.seccional?.codigo ?? 0}`.replace(
												/^[A-Za-z]+/,
												""
											)}
										</Text>
									</Grid>
									<Grid
										width="40"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{linea.trabajadores}</Text>
									</Grid>
									<Grid
										width="70"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{Formato.Moneda(linea.remuneraciones)}</Text>
									</Grid>
									<Grid
										width="70"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{Formato.Moneda(linea.capital)}</Text>
									</Grid>
									<Grid
										width="70"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{Formato.Moneda(linea.intereses)}</Text>
									</Grid>
									<Grid width="70" justify="end" style={styles.paddingBox}>
										<Text>{Formato.Moneda(linea.total)}</Text>
									</Grid>
								</Grid>
							))}
						</Grid>
						<Grid width>
							<Grid
								grow
								gap="5"
								style={{
									...styles.paddingBox,
									...styles.borderRight,
									...styles.borderTop,
									...styles.borderBottom,
								}}
							>
								<Text style={styles.titulo}>Código de pago:</Text>
								<Text>{Formato.Mascara(formaPago.identificadorDeudaInformado, "#".repeat(10))}</Text>
							</Grid>
							<Grid width="310" justify="center" style={styles.paddingBox}>
								<Text style={styles.titulo}>
									TOTAL A PAGAR EN CONCEPTO DE{" "}
									{`${
										formaPago.liquidacionTipoPagoDescripcion ?? ""
									}`.toUpperCase()}
								</Text>
							</Grid>
							<Grid width="70" justify="end" style={styles.paddingBox}>
								<Text>{Formato.Moneda(formaPago.total)}</Text>
							</Grid>
						</Grid>
						<Grid col grow justify="end">
							<Grid width justify="center">
								{barcode}
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
