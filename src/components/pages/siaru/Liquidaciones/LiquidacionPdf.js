import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import React, { useEffect } from "react";
import Logo1 from "../../../../media/Logo1.png";
import CodigoDeBarras from "../CodigoDeBarras";

const styles = StyleSheet.create({
  contenedor: {
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  page: {
    margin: "0",
    padding: "10px",
    width: "50%",
    textAlign: "center",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    border: "1px solid black",
  },
  image: {
    width: "50px",
    height: "50px",
    marginLeft: "5px",
  },
  tresCasillas: {
    width: "33.3%",
    height: "40x",
    border: "1px solid black",
    justifyContent: "center",
  },
  cuatroCasillas: {
    width: "25%",
    height: "40x",
    display: "flex",
    justifyContent: "center",
    border: "1px solid black",
  },
  unaCasilla: {
    width: "100%",
    height: "40px",
    border: "1px solid black",
    textAlign: "start",
    justifyContent: "center",
    paddingLeft: "10px",
  },
  imagenAncho: {
    width: "100%",
    marginBottom: "10px",
  },
  texto: {
    fontSize: "10px",
  },
  unaCasilla2: {
    width: "100%",
    height: "50px",
    border: "1px solid black",
    textAlign: "center",
    padding: "4px 0 0 10px",
  },
  unaCasilla3: {
    width: "100%",
    height: "15px",
    justifyContent: "space-around",
    alignItems: "center",
    flexDirection: "row",
    padding: "0 5px",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
  },
  casillaSinBorde: {
    width: "100%",
    height: "30px",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    textAlign: "center",
    justifyContent: "center",
  },
  texto2: {
    fontSize: "10px",
    textAlign: "center",
    width: "15%",
  },
  texto3: {
    fontSize: "12px",
    width: "85%",
  },
  paraRellenar: {
    width: "100%",
    height: "30px",
    borderLeft: "1px solid black",
    borderRight: "1px solid black",
    textAlign: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    flexDirection: "row",
    paddingTop: "10px",
  },
  border: {
    width: "100%",
    borderBottom: "1px solid black",
  },
});

const LiquidacionPdf = () => {
  const data = '1607102022183871621143220221116168962680009435600000105136'

  fetch(`https://barcode.tec-it.com/barcode.ashx?data=${data}&code=Code128&translate-esc=on`)
    .then((response) => response.json())
    .then((codigo) => console.log(codigo));
  return (
    <Document>
      <Page size="a4" orientation="landscape">
        <View style={styles.contenedor}>
          <View style={styles.page}>
            <View style={styles.imagenAncho}>
              <Image style={styles.image} src={Logo1}></Image>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>CUIT</Text>
              <Text style={styles.texto}>20-35030725-8</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Periodo (Mes-Año/Sec)</Text>
              <Text style={styles.texto}>10/2022 / 0</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Número de acta</Text>
              <Text style={styles.texto}>000000</Text>
            </View>
            <View style={styles.unaCasilla}>
              <Text style={styles.texto}>Razon Social</Text>
              <Text style={styles.texto}>
                ART MUTUAL RURAL DE SEGUROS DE RIESGO
              </Text>
            </View>
            <View style={styles.unaCasilla}>
              <Text style={styles.texto}>Provincia Laboral</Text>
              <Text style={styles.texto}>Chaco</Text>
            </View>
            <View style={styles.unaCasilla}>
              <Text style={styles.texto}>Localidad Laboral</Text>
              <Text style={styles.texto}>(3500) Resistencia</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Seccional</Text>
              <Text style={styles.texto}>0513</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Trabajadores:</Text>
              <Text style={styles.texto}>1</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Remuneraciones:</Text>
              <Text style={styles.texto}>471.779,79</Text>
            </View>
            <View style={styles.unaCasilla2}>
              <Text style={styles.texto}>
                BANCO DE LA NACION ARGENTINA NOTA DE CREDITO PARA LA CUENTA
                UNION ARGENTINA DE TRABAJADORES RURALES Y ESTIBADORES
              </Text>
              <Text style={styles.texto}>(UATRE) SINDICAL</Text>
              <Text style={styles.texto}>
                CUENTA 26026/48 Suc. PLAZA DE MAYO
              </Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Liquidacion N°:</Text>
              <Text style={styles.texto}>0016096268</Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Capital</Text>
              <Text style={styles.texto}>9.435,60</Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Intereses</Text>
              <Text style={styles.texto}>00,0</Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Total</Text>
              <Text style={styles.texto}>9.435,60</Text>
            </View>
            <View style={styles.unaCasilla3}>
              <Text style={styles.texto}>Total Pagado</Text>
              <Text style={styles.texto}>9.435,60</Text>
            </View>
            <View style={styles.unaCasilla3}>
              <Text style={styles.texto}>Son: </Text>
              <Text style={styles.texto}>
                NUEVE MIL CUATROCIENTOS TREINTA Y CINCO PESOS 60 CENT.
              </Text>
            </View>
            <View style={styles.casillaSinBorde}>
              <Text style={styles.texto}>VENCIMIENTO 16/11/2022</Text>
              <Text style={styles.texto}>
                Posterior a esta fecha el banco no acepta el pago, debiendo
                reliquidar el período
              </Text>
            </View>
            <Text style={styles.border}></Text>
            <View style={styles.paraRellenar}>
              <Text style={styles.texto2}>Cheque N°</Text>
              <Text style={styles.texto3}>
                |_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|
              </Text>
            </View>
            <View style={styles.paraRellenar}>
              <Text style={styles.texto2}>Banco:</Text>
              <Text style={styles.texto3}>
                |_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|
              </Text>
            </View>
            <View style={styles.unaCasilla}>
              <Image style={styles.image} src={`https://barcode.tec-it.com/barcode.ashx?data=${data}&code=Code128&translate-esc=on`}></Image>
            </View>
            <Text style={styles.border}></Text>
          </View>
          <View style={styles.page}>
            <View style={styles.imagenAncho}>
              <Image style={styles.image} src={Logo1}></Image>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>CUIT</Text>
              <Text style={styles.texto}>20-35030725-8</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Periodo (Mes-Año/Sec)</Text>
              <Text style={styles.texto}>10/2022 / 0</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Número de acta</Text>
              <Text style={styles.texto}>000000</Text>
            </View>
            <View style={styles.unaCasilla}>
              <Text style={styles.texto}>Razon Social</Text>
              <Text style={styles.texto}>
                ART MUTUAL RURAL DE SEGUROS DE RIESGO
              </Text>
            </View>
            <View style={styles.unaCasilla}>
              <Text style={styles.texto}>Provincia Laboral</Text>
              <Text style={styles.texto}>Chaco</Text>
            </View>
            <View style={styles.unaCasilla}>
              <Text style={styles.texto}>Localidad Laboral</Text>
              <Text style={styles.texto}>(3500) Resistencia</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Seccional</Text>
              <Text style={styles.texto}>0513</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Trabajadores:</Text>
              <Text style={styles.texto}>1</Text>
            </View>
            <View style={styles.tresCasillas}>
              <Text style={styles.texto}>Remuneraciones:</Text>
              <Text style={styles.texto}>471.779,79</Text>
            </View>
            <View style={styles.unaCasilla2}>
              <Text style={styles.texto}>
                BANCO DE LA NACION ARGENTINA NOTA DE CREDITO PARA LA CUENTA
                UNION ARGENTINA DE TRABAJADORES RURALES Y ESTIBADORES
              </Text>
              <Text style={styles.texto}>(UATRE) SINDICAL</Text>
              <Text style={styles.texto}>
                CUENTA 26026/48 Suc. PLAZA DE MAYO
              </Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Liquidacion N°:</Text>
              <Text style={styles.texto}>0016096268</Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Capital</Text>
              <Text style={styles.texto}>9.435,60</Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Intereses</Text>
              <Text style={styles.texto}>00,0</Text>
            </View>
            <View style={styles.cuatroCasillas}>
              <Text style={styles.texto}>Total</Text>
              <Text style={styles.texto}>9.435,60</Text>
            </View>
            <View style={styles.unaCasilla3}>
              <Text style={styles.texto}>Total Pagado</Text>
              <Text style={styles.texto}>9.435,60</Text>
            </View>
            <View style={styles.unaCasilla3}>
              <Text style={styles.texto}>Son: </Text>
              <Text style={styles.texto}>
                NUEVE MIL CUATROCIENTOS TREINTA Y CINCO PESOS 60 CENT.
              </Text>
            </View>
            <View style={styles.casillaSinBorde}>
              <Text style={styles.texto}>VENCIMIENTO 16/11/2022</Text>
              <Text style={styles.texto}>
                Posterior a esta fecha el banco no acepta el pago, debiendo
                reliquidar el período
              </Text>
            </View>
            <Text style={styles.border}></Text>
            <View style={styles.paraRellenar}>
              <Text style={styles.texto2}>Cheque N°</Text>
              <Text style={styles.texto3}>
                |_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|
              </Text>
            </View>
            <View style={styles.paraRellenar}>
              <Text style={styles.texto2}>Banco:</Text>
              <Text style={styles.texto3}>
                |_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|_|
              </Text>
            </View>
            <Text style={styles.border}></Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default LiquidacionPdf;
