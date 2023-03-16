import { PDFViewer } from '@react-pdf/renderer'
import React from 'react'
import LiquidacionPdf from './LiquidacionPdf'

const ImpresionLiquidacion = () => {
  return (
    <PDFViewer style={{height: '90vh', width: '100%'}}>
      <LiquidacionPdf  />
    </PDFViewer>
  )
}

export default ImpresionLiquidacion