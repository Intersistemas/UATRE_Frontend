import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import JsBarcode from "jsbarcode";
import logo1 from "media/Logo1_sidebar.png";
import AsArray from "components/helpers/AsArray.js";
// import Descriptor from "components/helpers/Descriptor";
import Formato from "components/helpers/Formato.js";
import Grid from "components/ui/Grid/Grid.js";
import styles from "components/pages/siaru/liquidaciones/impresion/PDF.styles.js";

const CabeceraPDF = ({ data = {} } = {}) => {
	const { /*empresa = {},*/ tiposPago = []/*, ...cabecera*/, seccional = {} } = data;
	// const descriptor = new Descriptor({
	// 	entero: {
	// 		singular: "peso",
	// 		plural: "pesos",
	// 	},
	// 	separador: "con",
	// 	decimal: {
	// 		singular: "centavo",
	// 		plural: "centavos",
	// 	},
	// });

	const GridView = ({ style, ...p }) => (
		<Grid render={View} style={{ ...style, ...styles.border }} {...p} />
	);

	// const Casillas = ({
	// 	width = 12,
	// 	height = 14,
	// 	border = {
	// 		color: "black",
	// 		style: "solid",
	// 		size: 1,
	// 	},
	// 	cantidad = 32,
	// 	style,
	// 	...p
	// }) => {
	// 	if (cantidad < 1) cantidad = 1;
	// 	style = {
	// 		...style,
	// 		borderStyle: border.style,
	// 		borderColor: border.color,
	// 		borderLeft: `${border.size}px`,
	// 		borderBottom: `${border.size}px`,
	// 	};
	// 	cantidad -= 1;
	// 	const casillas = [];
	// 	for (let n = 0; n < cantidad; n++) {
	// 		casillas.push(
	// 			<Grid
	// 				render={View}
	// 				block
	// 				width={`${width}px`}
	// 				height={`${height}px`}
	// 				style={style}
	// 				{...p}
	// 			/>
	// 		);
	// 	}
	// 	casillas.push(
	// 		<Grid
	// 			render={View}
	// 			block
	// 			width={`${width + border.size}px`}
	// 			height={`${height}px`}
	// 			style={{
	// 				...style,
	// 				borderRight: `${border.size}px`,
	// 			}}
	// 			{...p}
	// 		/>
	// 	);
	// 	return casillas;
	// };

	const Header = () => (
		<GridView col gap="10px">
			<GridView col>
				<GridView gap="10px">
					<Image src={logo1} style={{ width: "70", height: "75" }} />
					<GridView col justify="end">
						<Text style={{ ...styles.titulo, fontSize: "60pt" }}>UATRE</Text>
					</GridView>
				</GridView>
				<GridView col style={{ ...styles.titulo, fontSize: "12pt" }}>
					<Text>Union Argentina de Trabajadores</Text>
					<Text>Rurales y Estibadores</Text>
				</GridView>
			</GridView>
		</GridView>
	);

	const Footer = () => <></>;

	const MyPage = ({ children, ...x }) => (
		<Page style={styles.page} size="A5" orientation="landscape" {...x}>
			<GridView col grow>
				<Header />
				<GridView col grow gap="10px">
					{children}
				</GridView>
				<Footer />
			</GridView>
		</Page>
	);

	const pages = [];
	//#region resumen
	// pages.push(
	// 	<MyPage>
	// 		<GridView col style={styles.borderBox}>
	// 			<GridView>
	// 				<GridView
	// 					gap="10px"
	// 					style={{ ...styles.paddingBox, ...styles.borderRight }}
	// 				>
	// 					<GridView col width="20%">
	// 						<GridView justify="center">
	// 							<Text style={styles.titulo}>C.U.I.T.</Text>
	// 						</GridView>
	// 						<GridView justify="center">
	// 							<Text>{Formato.Cuit(empresa.cuit)}</Text>
	// 						</GridView>
	// 					</GridView>
	// 					<GridView col width="55%">
	// 						<GridView>
	// 							<Text style={styles.titulo}>Razón Social</Text>
	// 						</GridView>
	// 						<GridView>
	// 							<Text>{empresa.razonSocial}</Text>
	// 						</GridView>
	// 					</GridView>
	// 				</GridView>
	// 				<GridView col width="25%" style={{ ...styles.paddingBox }}>
	// 					<GridView justify="center">
	// 						<Text style={styles.titulo}>
	// 							{["Periodo (Año-Mes)", "Número de Acta"].at(
	// 								cabecera.tipoLiquidacion
	// 							)}
	// 						</Text>
	// 					</GridView>
	// 					<GridView justify="center">
	// 						<Text>
	// 							{[Formato.Periodo(cabecera.periodo), cabecera.acta].at(
	// 								cabecera.tipoLiquidacion
	// 							)}
	// 						</Text>
	// 					</GridView>
	// 				</GridView>
	// 			</GridView>
	// 			<GridView style={styles.borderTop}>
	// 				<GridView
	// 					col
	// 					width
	// 					style={{ ...styles.paddingBox, ...styles.borderRight }}
	// 				>
	// 					<GridView justify="center">
	// 						<Text style={styles.titulo}>Trabajadores</Text>
	// 					</GridView>
	// 					<GridView justify="center">
	// 						<Text>{cabecera.cantidadTrabajadores ?? 0}</Text>
	// 					</GridView>
	// 				</GridView>
	// 				<GridView col width style={{ ...styles.paddingBox }}>
	// 					<GridView justify="center">
	// 						<Text style={styles.titulo}>Remuneraciones</Text>
	// 					</GridView>
	// 					<GridView justify="center">
	// 						<Text>{Formato.Moneda(cabecera.totalRemuneraciones ?? 0)}</Text>
	// 					</GridView>
	// 				</GridView>
	// 			</GridView>
	// 			<GridView style={styles.borderTop}>
	// 				<GridView
	// 					col
	// 					width
	// 					style={{ ...styles.paddingBox, ...styles.borderRight }}
	// 				>
	// 					<GridView justify="center">
	// 						<Text style={styles.titulo}>Capital</Text>
	// 					</GridView>
	// 					<GridView justify="center">
	// 						<Text>{Formato.Moneda(cabecera.totalAporte ?? 0)}</Text>
	// 					</GridView>
	// 				</GridView>
	// 				<GridView
	// 					col
	// 					width
	// 					style={{ ...styles.paddingBox, ...styles.borderRight }}
	// 				>
	// 					<GridView justify="center">
	// 						<Text style={styles.titulo}>Intereses</Text>
	// 					</GridView>
	// 					<GridView justify="center">
	// 						<Text>{Formato.Moneda(cabecera.totalIntereses ?? 0)}</Text>
	// 					</GridView>
	// 				</GridView>
	// 				<GridView col width style={styles.paddingBox}>
	// 					<GridView justify="center">
	// 						<Text style={styles.titulo}>Total</Text>
	// 					</GridView>
	// 					<GridView justify="center">
	// 						<Text>{Formato.Moneda(cabecera.totalImporte ?? 0)}</Text>
	// 					</GridView>
	// 				</GridView>
	// 			</GridView>
	// 			<GridView style={styles.borderTop}>
	// 				<GridView width>
	// 					<GridView
	// 						col
	// 						width
	// 						style={{ ...styles.paddingBox, ...styles.borderRight }}
	// 					>
	// 						<GridView justify="center">
	// 							<Text style={styles.titulo}>Total sindical</Text>
	// 						</GridView>
	// 						<GridView justify="center">
	// 							<Text>{Formato.Moneda(cabecera.totalSindical ?? 0)}</Text>
	// 						</GridView>
	// 					</GridView>
	// 				</GridView>
	// 				<GridView width>
	// 					<GridView col width style={{ ...styles.paddingBox }}>
	// 						<GridView justify="center">
	// 							<Text style={styles.titulo}>Total solidario</Text>
	// 						</GridView>
	// 						<GridView justify="center">
	// 							<Text>{Formato.Moneda(cabecera.totalSolidario ?? 0)}</Text>
	// 						</GridView>
	// 					</GridView>
	// 				</GridView>
	// 			</GridView>
	// 		</GridView>
	// 	</MyPage>
	// );
	//#endregion

	//#region detalles
	let canvas = document.createElement("canvas");
	pages.push(
		...AsArray(tiposPago).map(
			({
				// establecimiento = {},
				// tipoPago = {},
				// codigoBarra = "",
				// ...liquidacion
				codigoBarra,
				...tipoPago
			}) => {
				let barcode;
				if (codigoBarra) {
					JsBarcode(canvas, codigoBarra);
					barcode = canvas.toDataURL();
				}
				if (barcode) barcode = <Image src={barcode} />;

				return (
					<MyPage>
						<GridView col style={styles.borderBox}>
							<GridView>
								{/* <GridView
									gap="10px"
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<GridView col width="5%">
										<GridView justify="center">
											<Text style={styles.titulo}>Nro.</Text>
										</GridView>
										<GridView justify="center">
											<Text>{establecimiento.nroSucursal}</Text>
										</GridView>
									</GridView>
									<GridView col width="70%">
										<GridView>
											<Text style={styles.titulo}>Establecimiento</Text>
										</GridView>
										<GridView>
											<Text>{establecimiento.nombre}</Text>
										</GridView>
									</GridView>
								</GridView> */}
								<GridView
									col
									width="25%"
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<GridView justify="center">
										<Text style={styles.titulo}>Tipo de pago</Text>
									</GridView>
									<GridView justify="center">
										<Text>{tipoPago.descripcion}</Text>
									</GridView>
								</GridView>
								<GridView col width style={styles.paddingBox}>
									<GridView justify="center">
										<Text style={styles.titulo}>Seccional</Text>
									</GridView>
									<GridView justify="center">
										<Text>
											{[seccional.codigo, seccional.descripcion]
												.filter((r) => r)
												.join(" - ")}
										</Text>
									</GridView>
								</GridView>
							</GridView>
							<GridView style={styles.borderTop}>
								<GridView
									col
									width
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<GridView justify="center">
										<Text style={styles.titulo}>Trabajadores</Text>
									</GridView>
									<GridView justify="center">
										<Text>{tipoPago.trabajadores ?? 0}</Text>
									</GridView>
								</GridView>
								<GridView col width style={styles.paddingBox}>
									<GridView justify="center">
										<Text style={styles.titulo}>Remuneraciones</Text>
									</GridView>
									<GridView justify="center">
										<Text>{Formato.Moneda(tipoPago.remuneraciones ?? 0)}</Text>
									</GridView>
								</GridView>
							</GridView>
							<GridView style={styles.borderTop}>
								<GridView
									col
									width
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<GridView justify="center">
										<Text style={styles.titulo}>Capital</Text>
									</GridView>
									<GridView justify="center">
										<Text>{Formato.Moneda(tipoPago.capital ?? 0)}</Text>
									</GridView>
								</GridView>
								<GridView
									col
									width
									style={{ ...styles.paddingBox, ...styles.borderRight }}
								>
									<GridView justify="center">
										<Text style={styles.titulo}>Intereses</Text>
									</GridView>
									<GridView justify="center">
										<Text>{Formato.Moneda(tipoPago.intereses ?? 0)}</Text>
									</GridView>
								</GridView>
								<GridView col width style={styles.paddingBox}>
									<GridView justify="center">
										<Text style={styles.titulo}>Total</Text>
									</GridView>
									<GridView justify="center">
										<Text>{Formato.Moneda(tipoPago.total ?? 0)}</Text>
									</GridView>
								</GridView>
							</GridView>
						</GridView>
						<GridView grow />
						<GridView>{barcode}</GridView>
					</MyPage>
				);
			}
		)
	);
	//#endregion

	// pages.push(
	// 	...liquidaciones.map(
	// 		({ establecimiento, tipoPago, ...liquidacion }, i) => {
	// 			liquidacion = CalcularCampos(liquidacion);

	// 			let importeTotalDescipcion = `${descriptor.escalaLarga(
	// 				liquidacion.importeTotal
	// 			)}`.toUpperCase();

	// 			let barcode;
	// 			if (liquidacion.codigoBarra) {
	// 				JsBarcode(canvas, liquidacion.codigoBarra);
	// 				barcode = canvas.toDataURL();
	// 			}
	// 			if (barcode) barcode = <Image src={barcode} />;

	// 			return (
	// 				<MyPage key={i}>
	// 					<GridView
	// 						gap="10px"
	// 						col
	// 						grow
	// 						style={{ ...styles.paddingBox, ...styles.borderBox }}
	// 					>
	// 						<GridView col grow style={styles.borderBox}>
	// 							<GridView
	// 								col
	// 								style={{ ...styles.paddingBox, ...styles.borderTop }}
	// 							>
	// 								<GridView>
	// 									<Text style={styles.titulo}>Provincia Laboral</Text>
	// 								</GridView>
	// 								<GridView>
	// 									<Text>
	// 										{establecimiento.provinciaDescripcion ?? "NO ESPECIFICA"}
	// 										&nbsp;
	// 									</Text>
	// 								</GridView>
	// 							</GridView>
	// 							<GridView
	// 								col
	// 								style={{ ...styles.paddingBox, ...styles.borderTop }}
	// 							>
	// 								<GridView>
	// 									<Text style={styles.titulo}>Localidad Laboral</Text>
	// 								</GridView>
	// 								<GridView>
	// 									<Text>
	// 										{establecimiento.localidadDescripcion ?? "NO ESPECIFICA"}
	// 										&nbsp;
	// 									</Text>
	// 								</GridView>
	// 							</GridView>
	// 							<GridView style={styles.borderTop}>
	// 								<GridView
	// 									col
	// 									width
	// 									style={{ ...styles.paddingBox, ...styles.borderRight }}
	// 								>
	// 									<GridView justify="center">
	// 										<Text style={styles.titulo}>Seccional</Text>
	// 									</GridView>
	// 									<GridView justify="center">
	// 										<Text>{establecimiento.seccional?.codigo ?? ""}</Text>
	// 									</GridView>
	// 								</GridView>
	// 								<GridView
	// 									col
	// 									width
	// 									style={{ ...styles.paddingBox, ...styles.borderRight }}
	// 								>
	// 									<GridView justify="center">
	// 										<Text style={styles.titulo}>Trabajadores</Text>
	// 									</GridView>
	// 									<GridView justify="center">
	// 										<Text>{liquidacion.cantidadTrabajadores ?? 0}</Text>
	// 									</GridView>
	// 								</GridView>
	// 								<GridView col width style={styles.paddingBox}>
	// 									<GridView justify="end">
	// 										<Text style={styles.titulo}>Remuneraciones</Text>
	// 									</GridView>
	// 									<GridView justify="end">
	// 										<Text>
	// 											{Formato.Moneda(liquidacion.totalRemuneraciones ?? 0)}
	// 										</Text>
	// 									</GridView>
	// 								</GridView>
	// 							</GridView>
	// 							<GridView
	// 								justify="center"
	// 								grow
	// 								style={{ ...styles.paddingBox, ...styles.borderTop }}
	// 							>
	// 								<GridView gap="10px" col grow justify="center">
	// 									{/* <Text>Banco...</Text> */}
	// 									<GridView gap="5px" justify="center">
	// 										<Text>(UATRE)</Text>
	// 										<Text style={styles.titulo}>
	// 											{(tipoPago.descripcion ?? "").toUpperCase()}
	// 										</Text>
	// 									</GridView>
	// 								</GridView>
	// 							</GridView>
	// 							<GridView style={{ ...styles.paddingBox, ...styles.borderTop }}>
	// 								<GridView col width>
	// 									<GridView justify="center">
	// 										<Text style={styles.titulo}>Liquidación Nº</Text>
	// 									</GridView>
	// 									<GridView justify="center">
	// 										<Text>{liquidacion.id ?? 0}</Text>
	// 									</GridView>
	// 								</GridView>
	// 								<GridView col width>
	// 									<GridView justify="end">
	// 										<Text style={styles.titulo}>Capital</Text>
	// 									</GridView>
	// 									<GridView justify="end">
	// 										<Text>
	// 											{Formato.Moneda(liquidacion.interesNeto ?? 0)}
	// 										</Text>
	// 									</GridView>
	// 								</GridView>
	// 								<GridView col width>
	// 									<GridView justify="end">
	// 										<Text style={styles.titulo}>Intereses</Text>
	// 									</GridView>
	// 									<GridView justify="end">
	// 										<Text>
	// 											{Formato.Moneda(liquidacion.interesImporte ?? 0)}
	// 										</Text>
	// 									</GridView>
	// 								</GridView>
	// 								<GridView col width>
	// 									<GridView justify="end">
	// 										<Text style={styles.titulo}>Total</Text>
	// 									</GridView>
	// 									<GridView justify="end">
	// 										<Text>
	// 											{Formato.Moneda(liquidacion.importeTotal ?? 0)}
	// 										</Text>
	// 									</GridView>
	// 								</GridView>
	// 							</GridView>
	// 							<GridView
	// 								gap="10px"
	// 								col
	// 								grow
	// 								style={{ ...styles.paddingBox, ...styles.borderTop }}
	// 							>
	// 								<GridView>
	// 									<GridView width justify="center">
	// 										<Text
	// 											style={styles.titulo}
	// 										>{`TOTAL A PAGAR ${Formato.Moneda(
	// 											liquidacion.importeTotal ?? 0
	// 										)}`}</Text>
	// 									</GridView>
	// 								</GridView>
	// 								<GridView grow>
	// 									<GridView style={styles.paddingRight}>
	// 										<Text style={styles.titulo}>Son</Text>
	// 									</GridView>
	// 									<GridView style={{ maxWidth: "500px" }}>
	// 										<Text>{importeTotalDescipcion}</Text>
	// 									</GridView>
	// 								</GridView>
	// 								<GridView justify="center">
	// 									<Text style={{ fontSize: "22pt" }}>
	// 										Vencimiento {Formato.Fecha(liquidacion.vencimientoFecha)}
	// 									</Text>
	// 								</GridView>
	// 								<GridView justify="center">
	// 									<Text style={{ fontSize: "10pt" }}>
	// 										No se aceptará el pago con posteridad al vencimiento,
	// 										siendo imprescindible la reliquidación del período
	// 									</Text>
	// 								</GridView>
	// 							</GridView>
	// 							<GridView
	// 								col
	// 								gap="5px"
	// 								style={{ ...styles.paddingBox, ...styles.borderTop }}
	// 							>
	// 								{/*
	// 						<GridView gap="5px">
	// 							<GridView width="70px">
	// 								<Text style={styles.titulo}>Cheque Nº:</Text>
	// 							</GridView>
	// 							<GridView justify="center" grow>
	// 								<Casillas cantidad={32} />
	// 							</GridView>
	// 						</GridView>
	// 						*/}
	// 								<GridView gap="5px">
	// 									<GridView width="70px">
	// 										<Text style={styles.titulo}>Banco:</Text>
	// 									</GridView>
	// 									<GridView justify="center" grow>
	// 										<Casillas cantidad={32} />
	// 									</GridView>
	// 								</GridView>
	// 							</GridView>
	// 						</GridView>
	// 						{/* <GridView>{barcode}</GridView> */}
	// 					</GridView>
	// 				</MyPage>
	// 			);
	// 		}
	// 	)
	// );

	return <Document style={styles.grow}>{pages}</Document>;
};

export default CabeceraPDF;
