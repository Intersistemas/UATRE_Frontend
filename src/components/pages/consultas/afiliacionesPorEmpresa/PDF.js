import { useCallback } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

async function createForm(dataList = []) {
  const basePdfBytes = await fetch("/Consultas/SolicitudAfiliacion.pdf").then((res) =>
    res.arrayBuffer()
  );

  const mergedPdf = await PDFDocument.create();
  mergedPdf.registerFontkit(fontkit);
  const font = await mergedPdf.embedFont(StandardFonts.Helvetica);

  // Asegura que sea un array
  const dataArray = Array.isArray(dataList) ? dataList : [dataList];

  for (const data of dataArray) {
    const originalPdf = await PDFDocument.load(basePdfBytes);
    const form = originalPdf.getForm();
    const page = originalPdf.getPages()[0];

    const newTextField = ({
      name,
      formatter = (v) => ((v ?? "") === "" ? "--" : `${v}`),
      fontSize = 8,
      height = 11,
      lines = 1,
      ...x
    }) => {
      const tf = form.createTextField(name);
      tf.addToPage(page, {
        borderWidth: 0,
        borderColor: rgb(1, 1, 1),
        ...x,
        font,
        height: height * lines,
      });
      if (lines > 1) tf.enableMultiline();
      tf.setFontSize(fontSize);
      if (data) tf.setText(formatter(data[name]));
    };

    let y = 699;
    newTextField({ name: "afiliado.numero", formatter: (v) => v || "", x: 415, y, width: 81 });

    y = 660;
    newTextField({ name: "seccional.codigo", x: 305, y, width: 81 });
    newTextField({ name: "fecha.dia", x: 443, y, width: 15 });
    newTextField({ name: "fecha.mes", x: 475, y, width: 15 });
    newTextField({ name: "fecha.anio", x: 508, y, width: 30 });

    y = 536;
    newTextField({ name: "trabajador.cuil.tipo", x: 72, y, width: 15 });
    newTextField({ name: "trabajador.cuil.id", x: 95, y, width: 55 });
    newTextField({ name: "trabajador.cuil.verificador", x: 165, y, width: 15 });
    newTextField({ name: "trabajador.documento", x: 262, y, width: 130 });
    newTextField({ name: "trabajador.nacionalidad", x: 460, y, width: 90 });

    y = 518;
    newTextField({ name: "trabajador.apellidos", x: 100, y, width: 170 });
    newTextField({ name: "trabajador.nombres", x: 330, y, width: 200 });

    y = 498;
    newTextField({ name: "trabajador.nacimiento.fecha", x: 145, y, width: 85 });
    newTextField({ name: "trabajador.estado_civil", x: 295, y, width: 85 });
    newTextField({ name: "trabajador.sexo", x: 450, y, width: 85 });

    y = 480;
    newTextField({ name: "trabajador.domicilio", x: 115, y, width: 165 });
    newTextField({ name: "trabajador.localidad", x: 333, y, width: 90 });
    newTextField({ name: "trabajador.provincia", x: 475, y, width: 70 });

    y = 459;
    newTextField({ name: "trabajador.oficio", x: 127, y, width: 148 });
    newTextField({ name: "trabajador.actividad", x: 400, y, width: 148 });

    y = 440;
    newTextField({ name: "trabajador.telefono", x: 145, y, width: 148 });
    newTextField({ name: "trabajador.correo", x: 325, y, width: 210 });

    y = 326;
    newTextField({ name: "empleador.cuit.tipo", x: 85, y, width: 15 });
    newTextField({ name: "empleador.cuit.id", x: 110, y, width: 55 });
    newTextField({ name: "empleador.cuit.verificador", x: 180, y, width: 15 });
    newTextField({ name: "empleador.razon_social", x: 310, y, width: 215 });

    y = 303;
    newTextField({ name: "empleador.domicilio", x: 95, y, width: 170 });
    newTextField({ name: "empleador.localidad", x: 315, y, width: 120 });
    newTextField({ name: "empleador.provincia", x: 482, y, width: 65 });

    y = 281;
    newTextField({ name: "empleador.actividad", x: 100, y, width: 430 });

    y = 263;
    newTextField({ name: "empleador.telefono", x: 145, y, width: 148 });
    newTextField({ name: "empleador.correo", x: 325, y, width: 210 });

    y = 111;
    newTextField({ name: "carnet.fecha.dia", x: 165, y, width: 15 });
    newTextField({ name: "carnet.fecha.mes", x: 200, y, width: 15 });
    newTextField({ name: "carnet.fecha.anio", x: 228, y, width: 30 });

    if (data) form.flatten();

    const copiedPages = await mergedPdf.copyPages(originalPdf, [0]);
    mergedPdf.addPage(copiedPages[0]);
  }

  return mergedPdf.saveAsBase64({ dataUri: true });
}

export const PDF = () => {
  const request = useCallback(
    async ({ data = [], onLoad = () => {} }) => {
      const base64 = await createForm(data);
      onLoad(base64);
    },
    []
  );
  return { request };
};

export default PDF;

