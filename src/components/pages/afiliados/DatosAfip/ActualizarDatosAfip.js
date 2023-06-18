export const ActualizarDatosAfip = (props) => {
    const patchAfiliado = [
      {
        path: "AFIPFechaNacimiento",
        op: "replace",
        value: props.afipFechaNacimiento,
      },
      {
        path: "AFIPNombre",
        op: "replace",
        value: props.afipNombre,
      },
      {
        path: "AFIPApellido",
        op: "replace",
        value: props.afipNombre,
      },
      {
        path: "AFIPRazonSocial",
        op: "replace",
        value: props.afipRazonSocial,
      },
      {
        path: "AFIPTipoDocumento",
        op: "replace",
        value: props.afipTipoDocumento,
      },
      {
        path: "AFIPNumeroDocumento",
        op: "replace",
        value: props.afipNumeroDocumento, //moment(resolverSolicitudFechaIngreso).format("yyyy-MM-DD"),
      },
      {
        path: "AFIPTipoPersona",
        op: "replace",
        value: props.afipTipoPersona,
      },
      {
        path: "AFIPTipoClave",
        op: "replace",
        value: props.afipTipoClave,
      },
      {
        path: "AFIPEstadoClave",
        op: "replace",
        value: props.afipEstadoClave,
      },
      {
        path: "AFIPClaveInactivaAsociada",
        op: "replace",
        value: props.afipClaveInactivaAsociada, //moment(resolverSolicitudFechaIngreso).format("yyyy-MM-DD"),
      },
      {
        path: "AFIPFechaFallecimiento",
        op: "replace",
        value: props.afipFechaFallecimiento,
      },
      {
        path: "AFIPFormaJuridica",
        op: "replace",
        value: props.afipFormaJuridica,
      },
      {
        path: "AFIPActividadPrincipal",
        op: "replace",
        value: props.afipActividadPrincipal,
      },
      {
        path: "AFIPIdActividadPrincipal",
        op: "replace",
        value: props.afipIdActividadPrincipal,
      },
      {
        path: "AFIPClaveInactivaAsociada",
        op: "replace",
        value: props.afipClaveInactivaAsociada,
      },
      {
        path: "AFIPPeriodoActividadPrincipal",
        op: "replace",
        value: props.afipPeriodoActividadPrincipal,
      },
      {
        path: "AFIPFechaContratoSocial",
        op: "replace",
        value: props.afipFechaContratoSocial,
      },
      {
        path: "AFIPMesCierre",
        op: "replace",
        value: props.afipMesCierre,
      },
      {
        path: "AFIPDomicilioDireccion",
        op: "replace",
        value: props.afipDomicilioDireccion,
      },
      {
        path: "AFIPDomicilioCalle",
        op: "replace",
        value: props.afipDomicilioCalle,
      },
      {
        path: "AFIPDomicilioNumero",
        op: "replace",
        value: props.afipDomicilioNumero,
      },
      {
        path: "AFIPDomicilioPiso",
        op: "replace",
        value: props.afipDomicilioPiso,
      },
      {
        path: "AFIPDomicilioDepto",
        op: "replace",
        value: props.afipDomicilioDepto,
      },
      {
        path: "AFIPDomicilioSector",
        op: "replace",
        value: props.afipDomicilioSector,
      },
      {
        path: "AFIPDomicilioTorre",
        op: "replace",
        value: props.afipDomicilioTorre,
      },
      {
        path: "AFIPDomicilioManzana",
        op: "replace",
        value: props.afipDomicilioManzana,
      },
      {
        path: "AFIPDomicilioLocalidad",
        op: "replace",
        value: props.afipDomicilioLocalidad,
      },
      {
        path: "AFIPDomicilioProvincia",
        op: "replace",
        value: props.afipDomicilioProvincia,
      },
      {
        path: "AFIPDomicilioIdProvincia",
        op: "replace",
        value: props.afipDomicilioIdProvincia,
      },
      {
        path: "AFIPDomicilioCodigoPostal",
        op: "replace",
        value: props.afipDomicilioCodigoPostal,
      },
      {
        path: "AFIPDomicilioTipo",
        op: "replace",
        value: props.afipDomicilioTipo,
      },
      {
        path: "AFIPDomicilioEstado",
        op: "replace",
        value: props.afipDomicilioEstado,
      },
      {
        path: "AFIPDomicilioDatoAdicional",
        op: "replace",
        value: props.afipDomicilioDatoAdicional,
      },
      {
        path: "AFIPDomicilioTipoDatoAdicional",
        op: "replace",
        value: props.afipDomicilioTipoDatoAdicional,
      },
    ];

  return patchAfiliado
}
