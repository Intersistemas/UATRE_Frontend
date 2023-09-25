import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import styles from "./PDF.styles.js";
import JsBarcode from "jsbarcode";
import logo1 from "../../../../../media/Logo1_sidebar.png";
import Formato from "components/helpers/Formato.js";
import Descriptor from "components/helpers/Descriptor";
import Grid from "components/ui/Grid/Grid.js";
import CalcularCampos from "../Formulario/CalcularCampos.js";

const PDF = ({
	empresa = {},
	data = [{ liquidacion: {}, establecimiento: {}, tipoPago: {} }],
} = {}) => {
	data ??= [];
	empresa ??= {};
	const descriptor = new Descriptor({
		entero: {
			singular: "peso",
			plural: "pesos",
		},
		separador: "con",
		decimal: {
			singular: "centavo",
			plural: "centavos",
		},
	});

	const GridView = ({ style, ...p }) => (
		<Grid render={View} style={{ ...style, ...styles.border }} {...p} />
	);

	const Casillas = ({
		width = 12,
		height = 14,
		border = {
			color: "black",
			style: "solid",
			size: 1,
		},
		cantidad = 32,
		style,
		...p
	}) => {
		if (cantidad < 1) cantidad = 1;
		style = {
			...style,
			borderStyle: border.style,
			borderColor: border.color,
			borderLeft: `${border.size}px`,
			borderBottom: `${border.size}px`,
		};
		cantidad -= 1;
		const casillas = [];
		for (let n = 0; n < cantidad; n++) {
			casillas.push(
				<Grid
					render={View}
					block
					width={`${width}px`}
					height={`${height}px`}
					style={style}
					{...p}
				/>
			);
		}
		casillas.push(
			<Grid
				render={View}
				block
				width={`${width + border.size}px`}
				height={`${height}px`}
				style={{
					...style,
					borderRight: `${border.size}px`,
				}}
				{...p}
			/>
		);
		return casillas;
	};

	let canvas = document.createElement("canvas");
	const pages = data.map((r, i) => {
		let { liquidacion, establecimiento, tipoPago } = r;
		liquidacion = CalcularCampos(liquidacion);

		let importeTotalDescipcion = `${descriptor.escalaLarga(
			liquidacion.importeTotal
		)}`.toUpperCase();

		let barcode;
		if (liquidacion.codigoBarra) {
			JsBarcode(canvas, liquidacion.codigoBarra);
			barcode = canvas.toDataURL();
		}
		if (barcode) barcode = <Image src={barcode} />;

		return (
			<Page key={i} style={styles.page} size="A4">
				<GridView
					gap="10px"
					col
					grow
					style={{ ...styles.paddingBox, ...styles.borderBox }}
				>
					<GridView col>
						<GridView gap="10px">
							<Image src={logo1} style={{ width: "70", height: "75" }} />
							<GridView col justify="end">
								<Text
									style={{
										...styles.titulo,
										fontSize: "60pt",
									}}
								>
									UATRE
								</Text>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.titulo, fontSize: "12pt" }}>
							<Text>Union Argentina de Trabajadores</Text>
							<Text>Rurales y Estibadores</Text>
						</GridView>
					</GridView>
					<GridView col grow style={styles.borderBox}>
						<GridView>
							<GridView
								col
								width
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>C.U.I.T.</Text>
								</GridView>
								<GridView justify="center">
									<Text>{Formato.Cuit(empresa.cuit)}</Text>
								</GridView>
							</GridView>
							<GridView
								col
								width
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>Periodo (Año-Mes)</Text>
								</GridView>
								<GridView justify="center">
									<Text>{Formato.Periodo(liquidacion.periodo)}</Text>
								</GridView>
							</GridView>
							<GridView col width style={styles.paddingBox}>
								<GridView justify="center">
									<Text style={styles.titulo}>Número de Acta</Text>
								</GridView>
								<GridView justify="center">
									<Text>000000</Text>
								</GridView>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.paddingBox, ...styles.borderTop }}>
							<GridView>
								<Text style={styles.titulo}>Razón Social</Text>
							</GridView>
							<GridView>
								<Text>{empresa.razonSocial}</Text>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.paddingBox, ...styles.borderTop }}>
							<GridView>
								<Text style={styles.titulo}>Provincia Laboral</Text>
							</GridView>
							<GridView>
								<Text>
									{establecimiento.provinciaDescripcion ?? "NO ESPECIFICA"}
									&nbsp;
								</Text>
							</GridView>
						</GridView>
						<GridView col style={{ ...styles.paddingBox, ...styles.borderTop }}>
							<GridView>
								<Text style={styles.titulo}>Localidad Laboral</Text>
							</GridView>
							<GridView>
								<Text>
									{establecimiento.localidadDescripcion ?? "NO ESPECIFICA"}
									&nbsp;
								</Text>
							</GridView>
						</GridView>
						<GridView style={styles.borderTop}>
							<GridView
								col
								width
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>Seccional</Text>
								</GridView>
								<GridView justify="center">
									<Text>0000</Text>
								</GridView>
							</GridView>
							<GridView
								col
								width
								style={{ ...styles.paddingBox, ...styles.borderRight }}
							>
								<GridView justify="center">
									<Text style={styles.titulo}>Trabajadores</Text>
								</GridView>
								<GridView justify="center">
									<Text>{liquidacion.cantidadTrabajadores ?? 0}</Text>
								</GridView>
							</GridView>
							<GridView col width style={styles.paddingBox}>
								<GridView justify="center">
									<Text style={styles.titulo}>Remuneraciones</Text>
								</GridView>
								<GridView justify="end">
									<Text>
										{Formato.Moneda(liquidacion.totalRemuneraciones ?? 0)}
									</Text>
								</GridView>
							</GridView>
						</GridView>
						<GridView
							justify="center"
							grow
							style={{ ...styles.paddingBox, ...styles.borderTop }}
						>
							<GridView gap="10px" col grow justify="center">
								<Text>Banco...</Text>
								<GridView gap="5px" justify="center">
									<Text>(UATRE)</Text>
									<Text style={styles.titulo}>
										{(tipoPago.descripcion ?? "").toUpperCase()}
									</Text>
								</GridView>
							</GridView>
						</GridView>
						<GridView style={{ ...styles.paddingBox, ...styles.borderTop }}>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Liquidación Nº</Text>
								</GridView>
								<GridView justify="center">
									<Text>
										{Formato.Mascara(liquidacion.id ?? 0, "##########")}
									</Text>
								</GridView>
							</GridView>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Capital</Text>
								</GridView>
								<GridView justify="end">
									<Text>{Formato.Moneda(liquidacion.interesNeto ?? 0)}</Text>
								</GridView>
							</GridView>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Intereses</Text>
								</GridView>
								<GridView justify="end">
									<Text>{Formato.Moneda(liquidacion.interesImporte ?? 0)}</Text>
								</GridView>
							</GridView>
							<GridView col width>
								<GridView justify="center">
									<Text style={styles.titulo}>Total</Text>
								</GridView>
								<GridView justify="end">
									<Text>{Formato.Moneda(liquidacion.importeTotal ?? 0)}</Text>
								</GridView>
							</GridView>
						</GridView>
						<GridView
							gap="10px"
							col
							grow
							style={{ ...styles.paddingBox, ...styles.borderTop }}
						>
							<GridView>
								<GridView>
									<Text style={styles.titulo}>TOTAL PAGADO</Text>
								</GridView>
								<GridView justify="end" grow>
									<Text style={{ ...styles.titulo, fontSize: "22pt" }}>
										{Formato.Moneda(liquidacion.importeTotal ?? 0)}
									</Text>
								</GridView>
							</GridView>
							<GridView grow>
								<GridView style={styles.paddingRight}>
									<Text style={styles.titulo}>Son</Text>
								</GridView>
								<GridView style={{ maxWidth: "500px" }}>
									<Text>{importeTotalDescipcion}</Text>
								</GridView>
							</GridView>
							<GridView justify="center">
								<Text style={{ fontSize: "22pt" }}>
									Vencimiento {Formato.Fecha(liquidacion.vencimientoFecha)}
								</Text>
							</GridView>
							<GridView justify="center">
								<Text style={{ fontSize: "10pt" }}>
									Posterior a esta fecha el banco no aceptará el pago, debiendo
									reliquidar el período
								</Text>
							</GridView>
						</GridView>
						<GridView
							col
							gap="5px"
							style={{ ...styles.paddingBox, ...styles.borderTop }}
						>
							<GridView gap="5px">
								<GridView width="70px">
									<Text style={styles.titulo}>Cheque Nº:</Text>
								</GridView>
								<GridView justify="center" grow>
									<Casillas cantidad={32} />
								</GridView>
							</GridView>
							<GridView gap="5px">
								<GridView width="70px">
									<Text style={styles.titulo}>Banco:</Text>
								</GridView>
								<GridView justify="center" grow>
									<Casillas cantidad={32} />
								</GridView>
							</GridView>
						</GridView>
					</GridView>
					<GridView>{barcode}</GridView>
				</GridView>
			</Page>
		);
	});

	return <Document style={styles.grow}>{pages}</Document>;
};

export default PDF;
