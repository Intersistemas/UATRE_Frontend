import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import JsBarcode from "jsbarcode";
import logo1 from "media/Logo1_sidebar.png";
import AsArray from "components/helpers/AsArray.js";
import Formato from "components/helpers/Formato.js";
import UIGrid from "components/ui/Grid/Grid.js";
import styles from "components/pages/siaru/liquidaciones/impresion/PDF.styles.js";

const CabeceraPDF = ({ data = {} } = {}) => {
	const { empresa = {}, tiposPago = [], seccional = {} } = data;

	const Grid = ({ style, ...p }) => (
		<UIGrid render={View} style={{ ...style, ...styles.border }} {...p} />
	);

	const Header = () => (
		<Grid col>
			<Grid gap="5">
				<Image src={logo1} style={{ width: "40", height: "40" }} />
				<Grid col justify="end">
					<Text style={{ ...styles.titulo, fontSize: "40pt" }}>U.A.T.R.E.</Text>
				</Grid>
			</Grid>
			<Grid col style={{ ...styles.titulo, fontSize: "8pt" }}>
				<Text>Union Argentina de Trabajadores</Text>
				<Text>Rurales y Estibadores</Text>
			</Grid>
		</Grid>
	);

	const Footer = () => <></>;

	const MyPage = ({ children, ...x }) => (
		<Page style={styles.page} size="A5" orientation="landscape" {...x}>
			<Grid col grow gap="5">
				<Header />
				<Grid col grow gap="10px">
					{children}
				</Grid>
				<Footer />
			</Grid>
		</Page>
	);

	const pages = [];

	//#region paginas por tipo de pago (concepto)
	let canvas = document.createElement("canvas");
	pages.push(
		...AsArray(tiposPago).map(({ codigoBarra, ...tipoPago }) => {
			let barcode;
			if (codigoBarra) {
				JsBarcode(canvas, codigoBarra);
				barcode = canvas.toDataURL();
			}
			if (barcode) barcode = <Image src={barcode} />;

			return (
				<MyPage>
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
									<Text>{`${tipoPago.descripcion ?? ""}`.toUpperCase()}</Text>
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
											].join("/"))(`${data.periodo || "      "}`, 0)}
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
									<Text>{Formato.Mascara(data.acta, "###") || "000"}</Text>
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
									<Text>{Formato.Fecha(data.fechaVencimiento)}</Text>
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
							{AsArray(tipoPago.seccionales).map((seccional) => (
								<Grid width style={styles.borderTop}>
									<Grid
										grow
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>
											{[
												seccional.provinciaNombre || "{Provincia}",
												`(${seccional.localidadCodPostal}) ${seccional.localidadNombre}`,
											].join(" / ")}
										</Text>
									</Grid>
									<Grid
										width="60"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>
											{`${seccional.codigo}`.replace(/^[A-Za-z]+/, "")}
										</Text>
									</Grid>
									<Grid
										width="40"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{seccional.trabajadores}</Text>
									</Grid>
									<Grid
										width="70"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{Formato.Moneda(seccional.remuneraciones)}</Text>
									</Grid>
									<Grid
										width="70"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{Formato.Moneda(seccional.capital)}</Text>
									</Grid>
									<Grid
										width="70"
										justify="end"
										style={{ ...styles.paddingBox, ...styles.borderRight }}
									>
										<Text>{Formato.Moneda(seccional.intereses)}</Text>
									</Grid>
									<Grid width="70" justify="end" style={styles.paddingBox}>
										<Text>{Formato.Moneda(seccional.total)}</Text>
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
								<Text style={styles.titulo}>NRO DE LIQUIDACION:</Text>
								<Text>{Formato.Mascara(data.id, "#".repeat(10))}</Text>
							</Grid>
							<Grid width="310" justify="center" style={styles.paddingBox}>
								<Text style={styles.titulo}>
									TOTAL A PAGAR EN CONCEPTO DE{" "}
									{`${tipoPago.descripcion ?? ""}`.toUpperCase()}
								</Text>
							</Grid>
							<Grid width="70" justify="end" style={styles.paddingBox}>
								<Text>{Formato.Moneda(tipoPago.total)}</Text>
							</Grid>
						</Grid>
						<Grid col grow justify="end" style={styles.paddingBox}>
							{barcode}
						</Grid>
					</Grid>
				</MyPage>
			);
		})
	);
	//#endregion

	return <Document style={styles.grow}>{pages}</Document>;
};

export default CabeceraPDF;
