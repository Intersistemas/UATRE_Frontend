import React from 'react'

const CodigoDeBarras = (porps) => {

    const data = '1607102022183871621143220221116168962680009435600000105136'
    return (
        <>
            <div styles={{ textAlign: 'center' }}>

                <img alt='Barcode Generator TEC-IT'
                    src={`https://barcode.tec-it.com/barcode.ashx?data=${data}&code=Code128&translate-esc=on`} />
            </div>
            <div
                style={{ paddingTop: '8px', textAlign: 'center', fontSize: '15px', fontFamily: 'Source Sans Pro, Arial, sans-serif' }}
            >

                <a href='https://www.tec-it.com' title='Barcode Software by TEC-IT' target='_blank' rel="noreferrer">


                </a>
            </div>
        </>
    )
}

export default CodigoDeBarras