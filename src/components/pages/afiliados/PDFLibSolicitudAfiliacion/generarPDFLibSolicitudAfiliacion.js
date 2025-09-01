import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { saveAs } from "file-saver";
import { Logo1_sidebar, LogoCGT } from "media/mediaEnBase64";

/**
 * Genera un documento PDF de "Solicitud de Afiliación" a partir de una lista de datos.
 *
 * @param {object} params
 * @param {Array<object>} params.datos - Array de objetos con los datos para cada página del PDF.
 * @param {boolean} [params.descargar=true] - Si es true, descarga el PDF automáticamente.
 * @param {Function} [params.onBase64] - Callback para obtener la representación Base64 del PDF.
 * @param {Function} [params.setPaginaActual] - Callback para actualizar el estado de la página actual.
 * @param {Function} [params.setTotalPaginas] - Callback para actualizar el estado del total de páginas.
 */
export async function generarPDFLibSolicitudAfiliacion({
  datos,
  descargar = true,
  onBase64 = () => {},
  setPaginaActual = () => {},
  setTotalPaginas = () => {},
}) {
  // === MODIFICACIÓN CLAVE ===
  // Si no hay datos o el array está vacío, se crea un array con un objeto vacío
  // para generar una sola página con campos en blanco.
  const dataToProcess = datos && datos.length > 0 ? datos : [{}];

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const logoUatre = await pdfDoc.embedPng(Logo1_sidebar);
  const logoCgt = await pdfDoc.embedPng(LogoCGT);

  const totalPaginas = dataToProcess.length;
  setTotalPaginas(totalPaginas);

  // ====================== FUNCIONES AUXILIARES ======================

  const drawText = (page, text, x, y, size = 9, bold = false, maxWidth) => {
    let val = String(text ?? "");
    const fnt = bold ? fontBold : font;
    if (maxWidth) {
      val = truncateText(val, fnt, size, maxWidth);
    }
    page.drawText(val, {
      x,
      y,
      size,
      font: fnt,
      color: rgb(0, 0, 0),
    });
  };

  const drawLine = (page, x1, y1, x2, y2, thickness = 0.8, dashed = false) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness,
      color: rgb(0, 0, 0),
      dashArray: dashed ? [2, 2] : undefined,
    });
  };

  const splitTextToLines = (text, fnt, fontSize, maxWidth) => {
    const words = String(text ?? "").split(" ");
    const lines = [];
    let current = "";
    for (const w of words) {
      const test = current ? current + " " + w : w;
      if (fnt.widthOfTextAtSize(test, fontSize) > maxWidth) {
        if (current) lines.push(current);
        current = w;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const truncateText = (text, fnt, fontSize, maxWidth) => {
    const str = String(text ?? "");
    if (fnt.widthOfTextAtSize(str, fontSize) <= maxWidth) return str;
    let low = 0;
    let high = str.length;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      const candidate = str.slice(0, mid) + "…";
      if (fnt.widthOfTextAtSize(candidate, fontSize) <= maxWidth) low = mid;
      else high = mid - 1;
    }
    const finalText = str.slice(0, low) + "…";
    return finalText;
  };

  // Función auxiliar mejorada para dibujar un label con su valor y una línea punteada.
  const drawLabelWithValue = (page, label, x, y, value, lineEnd, options = {}) => {
    const { size = 9, labelBold = true, valueMaxWidth, dashed = true, thickness = 0.8 } = options;

    const fntLabel = labelBold ? fontBold : font;
    const labelText = String(label ?? "");
    page.drawText(labelText, {
      x: x,
      y: y,
      size,
      font: fntLabel,
      color: rgb(0, 0, 0),
    });

    const labelWidth = fntLabel.widthOfTextAtSize(labelText, size);
    const lineStartX = x + labelWidth + 2;
    const finalLineStartX = Math.min(lineStartX, lineEnd - 6);
    const lineY = y - 5; // Posición de la línea

    page.drawLine({
      start: { x: finalLineStartX, y: lineY },
      end: { x: lineEnd, y: lineY },
      thickness,
      color: rgb(0, 0, 0),
      dashArray: dashed ? [2, 2] : undefined,
    });

    const valStr = String(value ?? "");
    const fntValue = font;
    let valToDraw = valStr;
    if (valueMaxWidth) {
      valToDraw = truncateText(valStr, fntValue, size, valueMaxWidth);
    }
    const valX = finalLineStartX + 3;
    page.drawText(valToDraw, {
      x: valX,
      y: y,
      size,
      font: fntValue,
      color: rgb(0, 0, 0),
    });
  };

  // ====================== CICLO POR PÁGINA ======================

  for (let idx = 0; idx < dataToProcess.length; idx++) {
    setPaginaActual(idx + 1);
    const d = dataToProcess[idx];
    const page = pdfDoc.addPage([595, 842]); // A4 portrait

    const {
      trabajador = {},
      empleador = {},
      fecha = "",
      afiliado_nro = "",
      seccional_nro = "",
    } = d;

    // ===================== ENCABEZADO =====================
    page.drawRectangle({ x: 20, y: 770, width: 555, height: 70, borderColor: rgb(0, 0, 0), borderWidth: 1 });
    drawLine(page, 370, 770, 370, 840, 1);
    page.drawImage(logoUatre, { x: 25, y: 778, width: 60, height: 55 });
    page.drawImage(logoCgt, { x: 310, y: 782, width: 50, height: 50 });
    drawText(page, "UATRE", 95, 810, 18, true);
    drawText(page, "Unión Argentina de", 95, 799, 8);
    drawText(page, "Trabajadores Rurales", 95, 790, 8);
    drawText(page, "y Estibadores", 95, 781, 8);
    drawText(page, "Personería Gremial Nº 155 - Adherida a la C. G. T. - Reconquista 630 Cap. Fed.", 95, 772, 7);

    drawText(page, "SOLICITUD DE", 418, 806, 14, true);
    drawText(page, "AFILIACIÓN", 425, 789, 14, true);

    // ===================== SUBHEADER: AFILIADO N° =====================
    page.drawRectangle({ x: 20, y: 740, width: 555, height: 30, borderColor: rgb(0, 0, 0), borderWidth: 1 });
    drawText(page, "Número de afiliado a completar una vez aprobada la solicitud", 28, 750, 9, true);
    drawText(page, "AFILIADO N° :", 430, 750, 9, true);
    page.drawRectangle({ x: 502, y: 745, width: 60, height: 15, borderColor: rgb(0, 0, 0), borderWidth: 1 });
    if (afiliado_nro) drawText(page, afiliado_nro, 507, 747, 9);

    // Fila Seccional / Fecha
    drawText(page, "SECCIONAL N°-", 230, 716, 10, true);
    page.drawRectangle({ x: 310, y: 711, width: 80, height: 18, borderColor: rgb(0, 0, 0), borderWidth: 1 });
    drawText(page, seccional_nro || "", 315, 715, 10);
    drawText(page, `FECHA: ${fecha || ""}`, 415, 716, 9, true);

    // ===================== PÁRRAFO INTRODUCTORIO =====================
    drawLine(page, 20, 700, 575, 700, 1);
    const intro =
      "Siendo un trabajador de la actividad y estando en total acuerdo con los estatutos del gremio, " +
      "solicito mi afiliación al mismo y autorizo por la presente para que de mis haberes, el empleador me practique " +
      "la retención de la cuota sindical como afiliado y según los montos que resuelva el Congreso de la UATRE, como así también cualquier otro " +
      "aporte a la Organización dispuesto por autoridad competente y/u órganos naturales de la Institución (Resol 9/98 y 200/16 CNTA). " +
      "Presto juramento de ley en relación a la veracidad de los datos que a continuación denuncio:";
    const lines = splitTextToLines(intro, font, 9, 540);
    let yText = 674;
    lines.forEach((line) => {
      drawText(page, line, 30, yText, 9);
      yText -= 12;
    });

    drawLine(page, 20, yText - 8, 575, yText - 8, 1);

    // ===================== BLOQUE: DATOS DEL TRABAJADOR =====================
    const trabajadorTop = yText - 30;
    // Se ha aumentado la altura del rectángulo de 160 a 175 para dar más espacio.
    const trabajadorRectHeight = 175;
    page.drawRectangle({
      x: 20,
      y: trabajadorTop - trabajadorRectHeight,
      width: 555,
      height: trabajadorRectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    drawLine(page, 20, trabajadorTop, 575, trabajadorTop, 1.2);
    drawText(page, "DATOS DEL TRABAJADOR", 235, trabajadorTop + 5, 10, true);

    const yStartTrabajador = trabajadorTop - 25;
    const ySpacing = 20;

    // Fila 1
    drawLabelWithValue(page, "CUIL:", 28, yStartTrabajador + 5, trabajador.cuil || "", 150, {
      valueMaxWidth: 85,
    });
    drawLabelWithValue(
      page,
      "TIPO Y Nº DE DOC:",
      160,
      yStartTrabajador + 5,
      `${trabajador.tipo_doc || ""} ${trabajador.nro_doc || ""}`.trim(),
      330,
      { valueMaxWidth: 75 }
    );
    drawLabelWithValue(page, "NACIONALIDAD:", 340, yStartTrabajador + 5, trabajador.nacionalidad || "", 566, {
      valueMaxWidth: 140,
    });

    // Fila 2
    drawLabelWithValue(page, "APELLIDOS:", 28, yStartTrabajador + 5 - ySpacing, trabajador.apellido || trabajador.apellidos || "", 260, {
      valueMaxWidth: 160,
    });
    drawLabelWithValue(page, "NOMBRES:", 275, yStartTrabajador + 5 - ySpacing, trabajador.nombres || "", 566, {
      valueMaxWidth: 225,
    });

    // Fila 3
    drawLabelWithValue(page, "FECHA DE NACIMIENTO:", 28, yStartTrabajador + 5 - ySpacing * 2, trabajador.fecha_nacimiento || trabajador.fecha_nac || "", 210, {
      valueMaxWidth: 55,
    });
    drawLabelWithValue(page, "ESTADO CIVIL:", 220, yStartTrabajador + 5 - ySpacing * 2, trabajador.estado_civil || "", 380, {
      valueMaxWidth: 85,
    });
    drawLabelWithValue(page, "SEXO / GÉNERO:", 390, yStartTrabajador + 5 - ySpacing * 2, trabajador.sexo || trabajador.genero || "", 566, {
      valueMaxWidth: 80,
    });

    // Fila 4
    drawLabelWithValue(page, "DOMICILIO:", 28, yStartTrabajador + 5 - ySpacing * 3, trabajador.domicilio_real || trabajador.domicilio || "", 250, {
      valueMaxWidth: 150,
    });
    drawLabelWithValue(page, "LOCALIDAD:", 260, yStartTrabajador + 5 - ySpacing * 3, trabajador.localidad || "", 420, {
      valueMaxWidth: 90,
    });
    drawLabelWithValue(page, "PROVINCIA:", 430, yStartTrabajador + 5 - ySpacing * 3, trabajador.provincia || "", 566, {
      valueMaxWidth: 60,
    });

    // Fila 5
    drawLabelWithValue(page, "OFICIO / CATEGORÍA:", 28, yStartTrabajador + 5 - ySpacing * 4, trabajador.oficio_categoria || trabajador.oficio || "", 300, {
      valueMaxWidth: 160,
    });
    drawLabelWithValue(page, "ACTIVIDAD QUE DESARROLLA:", 310, yStartTrabajador + 5 - ySpacing * 4, trabajador.actividad || "", 566, {
      valueMaxWidth: 110,
    });

    // Fila 6
    drawLabelWithValue(page, "TELÉFONO O CELULAR:", 28, yStartTrabajador + 5 - ySpacing * 5, trabajador.telefono || "", 300, {
      valueMaxWidth: 145,
    });
    drawLabelWithValue(page, "EMAIL:", 310, yStartTrabajador + 5 - ySpacing * 5, trabajador.email || "", 566, {
      valueMaxWidth: 215,
    });

    // La posición de la firma se ajusta dinámicamente según la nueva altura del rectángulo
    const yLineSignatureTrab = trabajadorTop - trabajadorRectHeight + 15;
    drawLine(page, 335, yLineSignatureTrab, 566, yLineSignatureTrab, 0.8, true);
    drawText(page, "FIRMA DEL TRABAJADOR", 400, yLineSignatureTrab - 11, 8);

    // ===================== BLOQUE: DATOS DEL EMPLEADOR =====================
    // La posición del rectángulo del empleador se ajusta según el nuevo tamaño del bloque anterior
    const empleadorTop = trabajadorTop - trabajadorRectHeight - 20;
    // Se ha ajustado la altura del rectángulo de 160 a 120 para acortarlo
    const empleadorRectHeight = 120;
    page.drawRectangle({
      x: 20,
      y: empleadorTop - empleadorRectHeight,
      width: 555,
      height: empleadorRectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    drawLine(page, 20, empleadorTop, 575, empleadorTop, 1.2);
    drawText(page, "DATOS DEL EMPLEADOR", 235, empleadorTop + 5, 10, true);

    const yStartEmpleador = empleadorTop - 20;
    const ySpacingEmpleador = 20;

    // Fila 1
    drawLabelWithValue(page, "CUIT:", 28, yStartEmpleador + 5, empleador.cuit || "", 140, {
      valueMaxWidth: 75,
    });
    drawLabelWithValue(page, "NOMBRE O RAZÓN SOCIAL:", 150, yStartEmpleador + 5, empleador.nombre_o_razon_social || empleador.razon_social || "", 566, {
      valueMaxWidth: 270,
    });

    // Fila 2
    drawLabelWithValue(page, "DOMICILIO:", 28, yStartEmpleador + 5 - ySpacingEmpleador, empleador.domicilio || "", 300, {
      valueMaxWidth: 200,
    });
    drawLabelWithValue(page, "LOCALIDAD:", 310, yStartEmpleador + 5 - ySpacingEmpleador, empleador.localidad || "", 465, {
      valueMaxWidth: 90,
    });

    // Fila 3
    drawLabelWithValue(page, "ACTIVIDAD:", 28, yStartEmpleador + 5 - ySpacingEmpleador * 2, empleador.actividad || "", 300, {
      valueMaxWidth: 200,
    });
    drawLabelWithValue(page, "PROVINCIA:", 310, yStartEmpleador + 5 - ySpacingEmpleador * 2, empleador.provincia || "", 465, {
      valueMaxWidth: 90,
    });

    // Fila 4
    drawLabelWithValue(page, "TELÉFONO O CELULAR:", 28, yStartEmpleador + 5 - ySpacingEmpleador * 3, empleador.telefono || "", 300, {
      valueMaxWidth: 145,
    });
    drawLabelWithValue(page, "EMAIL:", 310, yStartEmpleador + 5 - ySpacingEmpleador * 3, empleador.email || "", 566, {
      valueMaxWidth: 215,
    });

    // ===================== FAJA INTERMEDIA =====================
    const yFaja = empleadorTop - empleadorRectHeight;
    drawLine(page, 20, yFaja, 575, yFaja, 1);
    drawLine(page, 20, yFaja - 20, 575, yFaja - 20, 1);
    drawText(
      page,
      "SE DEBERÁ ADJUNTAR FOTOCOPIA DEL RECIBO DE SUELDO (O Alta Temprana) Y DNI DEL TRABAJADOR",
      28,
      yFaja - 14,
      9,
      true
    );

    // ===================== BLOQUE DECLARACIÓN + PIE =====================
    const bottomMargin = 40;
    const notaTopY = 66;
    const declBoxTop = Math.max(yFaja - 25, notaTopY + 80);

    // Se ha ajustado la altura del rectángulo de 160 a 115 para dar más espacio.
    const declRectHeight = 115;
    const declRectY = empleadorTop - empleadorRectHeight - 20 - declRectHeight;

    page.drawRectangle({
      x: 20,
      y: declRectY,
      width: 555,
      height: declRectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    drawLine(page, 20, empleadorTop - empleadorRectHeight - 20, 575, empleadorTop - empleadorRectHeight - 20, 1.2);

    const textoDecl =
      "En mi rol de secretario general manifiesto en carácter de declaración jurada que los datos del trabajador son " +
      "verdaderos y la solicitud fue efectuada por el mismo y en forma voluntaria. Expido la presente solicitud dando mi " +
      "consentimiento al pedido requerido por el trabajador.";
    const declLines = splitTextToLines(textoDecl, font, 9, 520);
    let yDecl = empleadorTop - empleadorRectHeight - 40;
    declLines.forEach((line) => {
      drawText(page, line, 30, yDecl, 9);
      yDecl -= 12;
    });

    drawText(page, "Se extendió carnet el día: .......... / .......... / ..........", 30, yDecl - 18, 9);

    const yLineSignatureSec = yDecl - 8;
    drawLine(page, 330, yLineSignatureSec - 10, 565, yLineSignatureSec - 10, 0.8, true);
    drawText(page, "SECRETARIO GENERAL DE SECCIONAL", 360, yLineSignatureSec - 24, 8, true);
    drawText(page, "FIRMA Y ACLARACIÓN", 410, yLineSignatureSec - 36, 7);
    
    // Sub-área NOTA
    const notaTopYNew = declRectY - 10;
    
    // Nueva posición y tamaño del rectángulo para la nota
    const notaRectHeight = 50;
    const notaRectY = notaTopYNew - notaRectHeight;
    page.drawRectangle({
      x: 20,
      y: notaRectY,
      width: 555,
      height: notaRectHeight,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    drawText(page, "NOTA:", 25, notaRectY + 38, 7, true);
    const nota =
      "A LOS EFECTOS DE LA VALIDEZ LEGAL DE LA PRESENTE SOLICITUD, LA MISMA DEBE SER ACOMPAÑADA OBLIGATORIAMENTE CON FOTOCOPIA DEL DNI Y DEL ÚLTIMO " +
      "RECIBO DE COBRO DEL SOLICITANTE, CASO CONTRARIO NO SERÁ ACEPTADA POR LAS AUTORIDADES DE LA U.A.T.R.E. LA COPIA DEBE SER REMITIDA POR LA SECCIONAL, LA " +
      "CUAL SERÁ DEVUELTA FIRMADA POR LAS AUTORIDADES DE LA U.A.T.R.E. PARA ARCHIVO DE SECCIONAL.";
    const notaLines = splitTextToLines(nota, font, 6, 530);
    let yNota = notaRectY + 28;//38;
    notaLines.forEach((line) => {
      drawText(page, line, 25, yNota, 6);
      yNota -= 9;
    });

    // ===================== PÁGINA N =====================
    //drawText(page, `Página ${idx + 1} de ${totalPaginas}`, 500, 20, 8, true);
    //Bordes Externos
    page.drawRectangle({
      x: 20,
      y: 75,
      width: 595 - 40,   // 595 = ancho A4 en pt → 595 - (2*18.5)
      height: 842 - 10,  // 842 = alto A4 en pt → 842 - (2*18.5)
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
  }

  // Guardado
  const pdfBytes = await pdfDoc.save();
  const base64 = arrayBufferToBase64(pdfBytes);
  onBase64(base64);
  if (descargar) {
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    saveAs(blob, "Solicitud_Afiliacion.pdf");
  }
  return base64;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
