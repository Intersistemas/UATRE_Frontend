
import { Document, Image, Page, PDFViewer, StyleSheet, View } from '@react-pdf/renderer'
import React, { useEffect, useState } from 'react'



const CodigoDeBarras = (porps) => {



    return (
        <>
            <PDFViewer style={{ width: '100%', height: '90vh' }}>
                <Document>
                    <Page>
                        <View styles={{ textAlign: 'center' }}>


                        </View>
                    </Page>
                </Document>
            </PDFViewer>
        </>
    )
}

export default CodigoDeBarras