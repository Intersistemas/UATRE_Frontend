export const ActualizarDatosAfip = (props) => {  
  console.log("props",props)
  const domicilioRealAFIP = props.domicilios.find(
    (domicilio) => domicilio.tipoDomicilio === "LEGAL/REAL"
  );

  const patchAfiliado = [
    {
      path: "AFIPFechaNacimiento",
      op: "replace",
      value: props.fechaNacimiento,
    },
    {
      path: "AFIPNombre",
      op: "replace",
      value: props.nombre,
    },
    {
      path: "AFIPApellido",
      op: "replace",
      value: props.apellido,
    },
    {
      path: "AFIPRazonSocial",
      op: "replace",
      value: props.razonSocial,
    },
    {
      path: "AFIPTipoDocumento",
      op: "replace",
      value: props.tipoDocumento,
    },
    {
      path: "AFIPNumeroDocumento",
      op: "replace",
      value: props.numeroDocumento, //moment(resolverSolicitudFechaIngreso).format("yyyy-MM-DD"),
    },
    {
      path: "AFIPTipoPersona",
      op: "replace",
      value: props.tipoPersona,
    },
    {
      path: "AFIPTipoClave",
      op: "replace",
      value: props.tipoClave,
    },
    {
      path: "AFIPEstadoClave",
      op: "replace",
      value: props.estadoClave,
    },
    {
      path: "AFIPClaveInactivaAsociada",
      op: "replace",
      value: props.claveInactivaAsociada, //moment(resolverSolicitudFechaIngreso).format("yyyy-MM-DD"),
    },
    {
      path: "AFIPFechaFallecimiento",
      op: "replace",
      value: props.fechaFallecimiento,
    },
    {
      path: "AFIPFormaJuridica",
      op: "replace",
      value: props.formaJuridica,
    },
    {
      path: "AFIPActividadPrincipal",
      op: "replace",
      value: props.descripcionActividadPrincipal,
    },
    {
      path: "AFIPIdActividadPrincipal",
      op: "replace",
      value: props.idActividadPrincipal,
    },
    {
      path: "AFIPClaveInactivaAsociada",
      op: "replace",
      value: props.claveInactivaAsociada,
    },
    {
      path: "AFIPPeriodoActividadPrincipal",
      op: "replace",
      value: props.periodoActividadPrincipal,
    },
    {
      path: "AFIPFechaContratoSocial",
      op: "replace",
      value: props.fechaContratoSocial,
    },
    {
      path: "AFIPMesCierre",
      op: "replace",
      value: props.mesCierre,
    },
    {
      path: "AFIPDomicilioDireccion",
      op: "replace",
      value: `${domicilioRealAFIP.calle} ${domicilioRealAFIP.numero}`,
    },
    {
      path: "AFIPDomicilioCalle",
      op: "replace",
      value: domicilioRealAFIP.calle,
    },
    {
      path: "AFIPDomicilioNumero",
      op: "replace",
      value: domicilioRealAFIP.numero,
    },
    {
      path: "AFIPDomicilioPiso",
      op: "replace",
      value: domicilioRealAFIP.piso,
    },
    {
      path: "AFIPDomicilioDepto",
      op: "replace",
      value: domicilioRealAFIP.depto,
    },
    {
      path: "AFIPDomicilioSector",
      op: "replace",
      value: domicilioRealAFIP.sector,
    },
    {
      path: "AFIPDomicilioTorre",
      op: "replace",
      value: domicilioRealAFIP.torre,
    },
    {
      path: "AFIPDomicilioManzana",
      op: "replace",
      value: domicilioRealAFIP.manzana,
    },
    {
      path: "AFIPDomicilioLocalidad",
      op: "replace",
      value: domicilioRealAFIP.localidad,
    },
    {
      path: "AFIPDomicilioProvincia",
      op: "replace",
      value: domicilioRealAFIP.provincia,
    },
    {
      path: "AFIPDomicilioIdProvincia",
      op: "replace",
      value: domicilioRealAFIP.idProvincia,
    },
    {
      path: "AFIPDomicilioCodigoPostal",
      op: "replace",
      value: domicilioRealAFIP.codigoPostal,
    },
    {
      path: "AFIPDomicilioTipo",
      op: "replace",
      value: domicilioRealAFIP.tipoDomicilio,
    },
    {
      path: "AFIPDomicilioEstado",
      op: "replace",
      value: domicilioRealAFIP.estadoDomicilio,
    },
    {
      path: "AFIPDomicilioDatoAdicional",
      op: "replace",
      value: domicilioRealAFIP.datoAdicional,
    },
    {
      path: "AFIPDomicilioTipoDatoAdicional",
      op: "replace",
      value: domicilioRealAFIP.tipoDatoAdicional,
    },
  ];

  return patchAfiliado;
};
