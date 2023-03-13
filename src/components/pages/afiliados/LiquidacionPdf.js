import { display } from '@mui/system'
import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import React from 'react'
import Logo1 from '../../../media/Logo1.png'

const styles = StyleSheet.create ({
  contenedor: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  page: {
    margin: '0 auto',
    padding: '10px',
    width: '50%',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap'
    
  },
  image: {
    width: '70px',
    height: '70px',
  },
  tresCasillas: {
    width: '33.3%',
    height: '50x',
    border: '1px solid black'
  },
  unaCasillas: {
    width: '100%',
    height: '50px',
    border: '1px solid black'
  },

  imagenAncho: {
    width: '100%',
    marginBottom: '10px'
  }
})

const LiquidacionPdf = () => {
  return (
    <Document>
      <Page size="a4" orientation='landscape'>
      <View style={styles.contenedor}>
          <View style={styles.page}>
            <View style={styles.imagenAncho}>
            <Image style={styles.image} src={Logo1}></Image>
            </View>
              <View style={styles.tresCasillas}>

              </View>
              <View style={styles.tresCasillas}>

              </View>
              <View style={styles.tresCasillas}>

              </View>
              <View style={styles.unaCasillas}>

              </View>
              <View style={styles.unaCasillas}>

              </View>
              <View style={styles.unaCasillas}>

              </View>
              <View style={styles.tresCasillas}>

</View>
<View style={styles.tresCasillas}>

</View>
<View style={styles.tresCasillas}>

</View>
          </View>
          <View style={styles.page}>
            <View style={styles.imagenAncho}>
          <Image style={styles.image} src={Logo1}></Image>
            </View>
            <View style={styles.tresCasillas}>

</View>
<View style={styles.tresCasillas}>

</View>
<View style={styles.tresCasillas}>

</View>
<View style={styles.unaCasillas}>

              </View>
              <View style={styles.unaCasillas}>

              </View>
              <View style={styles.unaCasillas}>

              </View>
              <View style={styles.tresCasillas}>

</View>
<View style={styles.tresCasillas}>

</View>
<View style={styles.tresCasillas}>

</View>
          </View>
      </View>
      </Page>
    </Document>
  )
}

export default LiquidacionPdf