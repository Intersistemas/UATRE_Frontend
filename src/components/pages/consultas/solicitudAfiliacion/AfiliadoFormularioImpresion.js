import { useEffect, useState } from "react";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import ValidarCUIT from "components/validators/ValidarCUIT";
import ValidarEmail from "components/validators/ValidarEmail";
import Formato from "components/helpers/Formato";
import { generarPDFLibSolicitudAfiliacion } from "components/pages/afiliados/PDFLibSolicitudAfiliacion/generarPDFLibSolicitudAfiliacion";

// Hook para manejar el pdfUrl a partir de base64 + contentType
export function useAfiliadoPdfUrl(base64, contentType) {
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    let url = null;

    if (base64) {
      try {
        // base64 puede venir con o sin "data:...;base64,"
        const raw = base64.toString().replace(/^data:.*;base64,/, "");
        const byteCharacters = atob(raw);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: contentType || "application/pdf",
        });
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e) {
        setPdfUrl(null);
      }
    } else {
      setPdfUrl(null);
    }

    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [base64, contentType]);

  return pdfUrl;
}

// Toda la lógica pesada de validación + generación de PDF + POST
export function imprimirAfiliadoFormulario({
  state,
  setState,
  seccionalSelect,
  tipoDocumentoSelect,
  nacionalidadSelect,
  estadoCivilSelect,
  sexoSelect,
  trabPciaSelect,
  trabLocaSelect,
  oficioSelect,
  actividadSelect,
  emplPciaSelect,
  emplLocaSelect,
  ciiuSelect,
  data,
  setCreateFormQuery,
  persistirDocumentacion,
  audit,
}) {
  // Validaciones simples primero
  const errors = {};
  const body = state.form;

  //#region general
  if (seccionalSelect.origen === "text") {
    body.seccionalId = 0;
    body.seccional = seccionalSelect.buscar;
    errors.seccionalId = "Debe elegir una seccional";
  } else {
    body.seccionalId = seccionalSelect.selected.record?.id;
    body.seccional = seccionalSelect.selected.record?.descripcion;
    body.seccionalCodigo = seccionalSelect.selected.record?.codigo;
  }
  if (!body.seccional) errors.seccionalId = "Dato requerido";

  if (!body.fecha) errors.fecha = "Dato requerido";
  //#endregion general

  //#region trabajador
  if (!body.cuil) {
    errors.cuil = "Dato requerido";
  } else if (!ValidarCUIT(body.cuil)) {
    errors.cuil = "Dato inválido";
  }

  if (tipoDocumentoSelect.origen === "text") {
    body.tipoDocumentoId = 0;
    body.tipoDocumentoDescripcion = tipoDocumentoSelect.buscar;
  } else {
    body.tipoDocumentoId = tipoDocumentoSelect.selected.record?.id;
    body.tipoDocumentoDescripcion =
      tipoDocumentoSelect.selected.record?.descripcion;
  }
  if (!body.tipoDocumentoDescripcion)
    errors.tipoDocumentoId = "Dato requerido";

  if (!body.documento) errors.documento = "Dato requerido";

  if (nacionalidadSelect.origen === "text") {
    body.nacionalidadId = 0;
    body.nacionalidad = nacionalidadSelect.buscar;
  } else {
    body.nacionalidadId = nacionalidadSelect.selected.record?.id;
    body.nacionalidad = nacionalidadSelect.selected.record?.descripcion;
  }
  if (!body.nacionalidad) errors.nacionalidadId = "Dato requerido";

  if (!(body.apellido || body.nombre)) errors.nombre = "Dato requerido";
  if (!body.fechaNacimiento) errors.fechaNacimiento = "Dato requerido";

  if (estadoCivilSelect.origen === "text") {
    body.estadoCivilId = 0;
    body.estadoCivil = estadoCivilSelect.buscar;
  } else {
    body.estadoCivilId = estadoCivilSelect.selected.record?.id;
    body.estadoCivil = estadoCivilSelect.selected.record?.descripcion;
  }
  if (!body.estadoCivil) errors.estadoCivilId = "Dato requerido";

  if (sexoSelect.origen === "text") {
    body.sexoId = 0;
    body.sexoDescripcion = sexoSelect.buscar;
  } else {
    body.sexoId = sexoSelect.selected.record?.id;
    body.sexoDescripcion = sexoSelect.selected.record?.descripcion;
  }
  if (!body.sexoDescripcion) errors.sexoId = "Dato requerido";

  if (!body.domicilio) errors.domicilio = "Dato requerido";

  if (trabPciaSelect.origen === "text") {
    body.provinciaId = 0;
    body.provinciaNombre = trabPciaSelect.buscar;
  } else {
    body.provinciaId = trabPciaSelect.selected.record?.id;
    body.provinciaNombre = trabPciaSelect.selected.record?.nombre;
  }
  if (!body.provinciaNombre) errors.provinciaId = "Dato requerido";

  if (trabLocaSelect.origen === "text") {
    body.refLocalidadId = 0;
    body.nombreLocalidadAfiliado = trabLocaSelect.buscar;
  } else {
    body.refLocalidadId = trabLocaSelect.selected.record?.id;
    body.nombreLocalidadAfiliado = trabLocaSelect.selected.record?.nombre;
  }
  if (!body.nombreLocalidadAfiliado)
    errors.refLocalidadId = "Dato requerido";

  if (oficioSelect.origen === "text") {
    body.oficioId = 0;
    body.oficio = oficioSelect.buscar;
  } else {
    body.oficioId = oficioSelect.selected.record?.id;
    body.oficio = oficioSelect.selected.record?.descripcion;
  }
  if (!body.oficio) errors.oficioId = "Dato requerido";

  if (actividadSelect.origen === "text") {
    body.actividadIdAfiliado = 0;
    body.actividadAfiliado = actividadSelect.buscar;
  } else {
    body.actividadIdAfiliado = actividadSelect.selected.record?.id;
    body.actividadAfiliado = actividadSelect.selected.record?.descripcion;
  }
  if (!body.actividadAfiliado) errors.actividadIdAfiliado = "Dato requerido";

  if (body.telefono && !isPossiblePhoneNumber(body.telefono))
    errors.telefono = "Dato inválido";
  if (body.email && !ValidarEmail(body.email))
    errors.email = "Dato inválido";
  //#endregion trabajador

  //#region empleador
  if (!body.cuitEmpresa) {
    errors.cuitEmpresa = "Dato requerido";
  } else if (!ValidarCUIT(body.cuitEmpresa)) {
    errors.cuitEmpresa = "Dato inválido";
  }

  if (!body.razonSocial) errors.razonSocial = "Dato requerido";

  if (!body.domicilioEmpresa) errors.domicilioEmpresa = "Dato requerido";

  if (emplPciaSelect.origen === "text") {
    body.provinciaIdEmpresa = 0;
    body.provinciaNombreEmpresa = emplPciaSelect.buscar;
  } else {
    body.provinciaIdEmpresa = emplPciaSelect.selected.record?.id;
    body.provinciaNombreEmpresa = emplPciaSelect.selected.record?.nombre;
  }
  if (!body.provinciaNombreEmpresa)
    errors.provinciaIdEmpresa = "Dato requerido";

  if (emplLocaSelect.origen === "text") {
    body.refLocalidadIdEmpresa = 0;
    body.nombreLocalidadEmpresa = emplLocaSelect.buscar;
  } else {
    body.refLocalidadIdEmpresa = emplLocaSelect.selected.record?.id;
    body.nombreLocalidadEmpresa = emplLocaSelect.selected.record?.nombre;
  }
  if (!body.nombreLocalidadEmpresa)
    errors.refLocalidadIdEmpresa = "Dato requerido";

  if (ciiuSelect.origen === "text") {
    body.actividadIdEmpresa = 0;
    body.actividadEmpresa = ciiuSelect.buscar;
  } else {
    body.actividadIdEmpresa = ciiuSelect.selected.record?.id;
    body.actividadEmpresa = ciiuSelect.selected.record?.descripcion;
  }
  if (!body.actividadEmpresa) errors.actividadIdEmpresa = "Dato requerido";

  if (body.telefonoEmpresa && !isPossiblePhoneNumber(body.telefonoEmpresa))
    errors.telefonoEmpresa = "Dato inválido";
  if (body.celularEmpresa && !isPossiblePhoneNumber(body.celularEmpresa))
    errors.celularEmpresa = "Dato inválido";
  if (body.emailEmpresa && !ValidarEmail(body.emailEmpresa))
    errors.emailEmpresa = "Dato inválido";
  //#endregion empleador

  if (Object.values(errors).filter((r) => r).length) {
    setState((o) => ({ ...o, errors }));
    return;
  }

  // === Generación de PDF + POST al endpoint ===
  const despliega = async () => {
    const datos = [
      {
        fecha: Formato.Fecha(body.fecha),
        seccional_nro: body.seccionalCodigo || "",
        afiliado_nro: "",
        trabajador: {
          cuil: Formato.Cuit(body.cuil),
          tipo_doc: body.tipoDocumentoDescripcion,
          nro_doc: body.documento,
          nacionalidad: body.nacionalidad,
          apellidos: body.apellido,
          nombres: body.nombre,
          fecha_nacimiento: Formato.Fecha(body.fechaNacimiento),
          estado_civil: body.estadoCivil,
          sexo: body.sexoDescripcion,
          domicilio: body.domicilio,
          localidad: body.nombreLocalidadAfiliado,
          provincia: body.provinciaNombre,
          oficio: body.oficio,
          actividad: body.actividadAfiliado,
          telefono: body.telefono,
          email: body.email,
        },
        empleador: {
          cuit: Formato.Cuit(body.cuitEmpresa),
          razon_social: body.razonSocial,
          domicilio: body.domicilioEmpresa,
          localidad: body.nombreLocalidadEmpresa,
          provincia: body.provinciaNombreEmpresa,
          actividad: body.actividadEmpresa,
          telefono: [body.telefonoEmpresa, body.celularEmpresa]
            .filter(Boolean)
            .join(", "),
          email: body.emailEmpresa,
        },
      },
    ];

    audit({
      modulo: "Consultas",
      proceso: "SolicitudPreviaAfiliacion",
      parametros: datos[0],
      observaciones: "Emite PDF con generador PDF-LIB",
    });

    const base64 = await generarPDFLibSolicitudAfiliacion({
      datos,
      descargar: false,
      onBase64: () => {},
      setPaginaActual: () => {},
      setTotalPaginas: () => {},
    });

    setState((o) => ({
      ...o,
      // Guardamos solo el base64 puro y el contentType; el iframe usará un blob URL
      base64: base64,
      contentType: "application/pdf",
    }));
  };

  // POST al servicio de creación de formulario
  setCreateFormQuery((o) => ({
    ...o,
    query: { ...o.query, config: { ...(o.query.config || {}), body } },
    onPreLoad: () =>
      setState((s) => ({ ...s, loading: "Enviando formulario." })),
    onLoad: ({ ok, error }) => {
      const changes = { loading: null };

      if (error) {
        console.error("❌ Error al crear formulario:", error);
        changes.errors = { create: error.toString() };
      } else {
        console.log("✅ Formulario creado exitosamente:", ok);

        // Soporta { id }, { Id } o el id plano
        const nuevoId =
          (ok && (ok.id ?? ok.Id)) ?? (Number.isFinite(ok) ? ok : null);

        console.log("➡️ ID del formulario creado:", nuevoId);

        if (nuevoId) {
          setState((s) => ({ ...s, form: { ...s.form, id: nuevoId } }));

          // PERSISTIR DOCUMENTACIÓN con el ID real
          console.log(
            "📎 Iniciando persistencia de documentación con ID:",
            nuevoId
          );
          persistirDocumentacion(nuevoId);
        } else {
          console.warn("⚠️ No se pudo obtener el ID del formulario creado");
        }

        // Generar vista previa en PDF
        console.log("🖨️ Generando vista previa PDF");
        despliega();
      }

      setState((s) => ({ ...s, ...changes }));
    },
  }));
}
