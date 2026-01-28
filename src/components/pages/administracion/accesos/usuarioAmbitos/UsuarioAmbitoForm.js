
import React, { useEffect,useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial from "components/ui/Input/InputMaterial";
import useHttp from "../../../../hooks/useHttp";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const UsuarioAmbitoForm = ({
  data = {},
  title = "",
  disabled = {},
  hide = {},
  errors = {},
  onChange = onChangeDef,
  onClose = onCloseDef,
  loading = false,
}) => {
  data ??= {};
  loading ??= false;





  // Extracción de "Usuario ..." del título para mostrar en Usuario Baja
  const usuarioIndex = title.indexOf("Usuario");
  if (usuarioIndex !== -1) {
    const textoSiguiente = title.slice(usuarioIndex + "Usuario".length);
    console.log("texto_siguiente", textoSiguiente);
  }
  const textoUsuario = title.slice(usuarioIndex + "Usuario".length);
  console.log("textoUsuario", textoUsuario);

  console.log('Form_ambito_data:',data)
  console.log("loading",loading)
  console.log('Form_ambito_errors:',errors)

  disabled ??= {};
  hide ??= {};
  errors ??= {};
  onChange ??= onChangeDef;
  onClose ??= onCloseDef;

  const [procesando, setProcesando] = useState(loading);

  //#region Tipos de ámbito (local)
  const ambitosTipoTodos =
  [
    {value: "T", label: "Todos"},
    {value: "S", label: "Seccionales"},
    {value: "D", label: "Delegaciones"},
    {value: "P", label: "Provincias"},
  ];
  //#endregion

  const [ambitosTipo, setAmbitosTipo] = useState({
    loading: "Cargando...",
    params: {},
    data: [],
    error: null,
    buscar: "",
    buscado: "",
    options: ambitosTipoTodos,
    selected: {value:data.ambitoTipo, label: ambitosTipoTodos.find((a)=> a.value === data?.ambitoTipo)?.label}
  });

  const [ambitos, setAmbitos] = useState({
    loading: "Cargando...",
    params: {},
    data: [],        // <- aquí guardamos la lista completa para poder filtrar
    error: null,
    buscar: "",
    buscado: "",
    options: [],     // <- aquí mostramos la lista filtrada
    selected: {value:data.ambitoId, label: data.nombreAmbito},
  });

  const { isLoading, error, sendRequest: request } = useHttp();

  // Fecha actual
  const FechaActual = () => {
    const fecha = new Date();
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  };

  //#region Capturo errores/carga
  useEffect(() => {
    console.log("error3",error)
    console.log("loading3",loading)
    if (error) {
      setProcesando(false);
      return;
    }
    setProcesando(loading);
    return;
  }, [loading,error,ambitosTipo.selected,ambitos.selected]);
  //#endregion

  // --- FUNCION DE FILTRO POR NOMBRE / CÓDIGO / ID / DESCRIPCIÓN ---
  const filterAmbitosByNombreOrCodigo = (all = [], term = "") => {
    const q = String(term || "").trim().toLowerCase();
    if (!q) return all;

    const isNumeric = /^\d+$/.test(q);
    return all.filter(r => {
      // Campos opcionales protegidos con ''
      const nombre = (r.nombre || "").toLowerCase();
      const codigo = (r.codigo || "").toLowerCase();
      const desc   = (r.descripcion || "").toLowerCase();
      const idStr  = String(r.id || r.value || "").toLowerCase();

      if (isNumeric) {
        // Si tipean números, buscamos en ID y código numérico si lo hubiera
        return idStr.includes(q) || codigo.includes(q);
      }
      // Texto: nombre, código alfanumérico, descripción
      return nombre.includes(q) || codigo.includes(q) || desc.includes(q);
    });
  };

  //#region Traigo todos los ámbitos del tipo seleccionado
  useEffect(() => {
    const query = {
      baseURL: "",
      endpoint: ``,
      method: ""
    }

    if (data?.ambitoTipo == "T"){
      const unica = [{ value: 0, label: "Todos", id: 0, nombre: "Todos", codigo: "0", descripcion: "Todos" }];
      setAmbitos((o)=>({
        ...o,
        loading: null,
        data: unica,               // guardo data completa
        options: unica,            // y también options
        selected: { value:0, label:"Todos" },
      }));
      return;
    }

    setAmbitos((o)=>({...o, loading:"Cargando..."}))
    switch (data?.ambitoTipo) {
      case "T":
        query.baseURL = "";
        query.endpoint = "";
        query.method = "";
        break;
      case "S":
        query.baseURL = "Afiliaciones";
        query.endpoint = `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`;
        query.method = `Get`;
        break;
      case "D":
        query.baseURL = "Comunes";
        query.endpoint = `/RefDelegacion/GetAll`;
        query.method = `Get`;
        break;
      case "P":
        query.baseURL = "Afiliaciones";
        query.endpoint = `/Provincia`;
        query.method = `Get`;
        break;
      default:
        break;
    }

    console.log('query_0',query)

    const processAmbitos = async (ambitosObj) => {
      // Mapeo guardando campos para filtrar
      const items = ambitosObj?.map((a) => ({
        value: a?.id,
        label: `(${a?.id}) ${a?.nombre ? a?.nombre : (a?.codigo ?? "") + (a?.descripcion ? `-${a?.descripcion}` : "")}`,
        id: a?.id,
        nombre: a?.nombre ?? "",
        codigo: a?.codigo ?? "",
        descripcion: a?.descripcion ?? "",
      })) ?? [];

      console.log('ambitos_items', items);

      const selectedLabel = items.find((x)=> x.value === data?.ambitoId)?.label;
      setAmbitos((o)=>({
        ...o,
        loading: null,
        data: items,             // <- lista completa para filtrar
        options: items,          // <- arranca sin filtro
        selected: { value: data?.ambitoId, label: selectedLabel }
      }));
    };

    request(
      { baseURL: query.baseURL, endpoint: query.endpoint, method: query.method },
      async (ok) => (processAmbitos(ok)),
      async (error) => ((console.log('GetAmbitos?ModulosId_error',error))),
      async () => (setAmbitos((o)=>({...o,loading:null}))),
    );
  },[data?.ambitoTipo]);
  //#endregion

  // Buscador (por nombre/código/ID/descripcion)
  useEffect(() => {
    if (ambitos.loading) return;
    if (ambitos.buscar === ambitos.buscado) return;

    const options = filterAmbitosByNombreOrCodigo(ambitos.data, ambitos.buscar);
    setAmbitos((o) => ({ ...o, options, buscado: o.buscar }));
  }, [ambitos.buscar, ambitos.data, ambitos.loading]);
  // Nota: dependencias finas para evitar renders innecesarios

  UseKeyPress(['Escape'], () => onClose());
  UseKeyPress(['Enter'], () => onClose(true), 'AltKey');

  return (
    <div>
      <Modal
        show
        onHide={() => onClose()}
        size="lg"
        centered
      >
        <Modal.Header className={modalCss.modalCabecera} closeButton><h3>{title}</h3></Modal.Header>
        <Modal.Body>
          <Grid col full gap="15px">
            <Grid width="full" gap="inherit">
              <Grid width="50%">
                <SearchSelectMaterial
                  id="ambitoTipo"
                  name="ambitoTipo"
                  label="Ambitos"
                  error={errors.ambitoTipo}
                  helperText={errors.ambitoTipo ?? ""}
                  value={ambitosTipo.selected}
                  disabled={disabled.ambitoTipo ?? false}
                  onChange={(selected) => (
                    setAmbitos((o) => ({ ...o, selected:{} })),
                    setAmbitosTipo((o) => ({ ...o, selected })),
                    onChange({ambitoTipo: selected.value}),
                    onChange({ambitoId: 0})
                  )}
                  options={ambitosTipo.options}
                  required
                />
              </Grid>
              <Grid width="50%">
                <SearchSelectMaterial
                  id="ambitoId"
                  name="ambitoId"
                  label="Cod. Ambito"
                  error={errors.ambitoId}
                  helperText={errors.ambitoId ?? ambitos.loading ?? ""}
                  value={ambitos.selected}
                  disabled={disabled.ambitoId ?? ambitos.loading ?? (data?.ambitoTipo == "T" ? true : false)}
                  onChange={(selected) =>
                    (
                      setAmbitos((o) => ({ ...o, selected })),
                      onChange({ambitoId: selected.value})
                    )
                  }
                  options={ambitos.options}
                  onTextChange={(buscar) =>
                    setAmbitos((o) => ({ ...o, buscar }))
                  }
                  required
                />
              </Grid>
            </Grid>

            {!hide.deletedObs && (
              <Grid width gap="inherit" col>
                <Grid width gap="inherit">
                  <Grid width="50%">
                    <InputMaterial
                      id="deletedDate"
                      label="Fecha Baja"
                      error={!!errors.deletedDate}
                      helperText={errors.deletedDate ?? ""}
                      value={FechaActual()}
                      disabled={disabled.deletedDate ?? false}
                      onChange={(value, _id) => onChange({ deletedDate: value })}
                    />
                  </Grid>
                  <Grid width="50%">
                    <InputMaterial
                      id="deletedBy"
                      label="Usuario Baja"
                      error={!!errors.deletedBy}
                      helperText={errors.deletedBy ?? ""}
                      value={textoUsuario}
                      disabled={disabled.deletedBy ?? false}
                      onChange={(value, _id) => onChange({ deletedBy: value })}
                    />
                  </Grid>
                </Grid>
                <Grid width="full" gap="inherit">
                  <InputMaterial
                    id="deletedObs"
                    label="Observaciones Baja"
                    error={!!errors.deletedObs}
                    helperText={errors.deletedObs ?? ""}
                    value={data.deletedObs}
                    disabled={disabled.deletedObs ?? false}
                    onChange={(value, _id) => onChange({ deletedObs: value })}
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="botonAzul"
            width={25}
            onClick={() => (
              setProcesando(true),
              onClose(true)
            )}
            disabled ={
              errors?.ambitoExiste || 
              procesando || 
              (!hide.deletedObs && !data.deletedObs)
            }
            loading={procesando}
          >
            CONFIRMA
          </Button>

          <Button className="botonAmarillo" width={25} onClick={()=>onClose()}>
            CIERRA
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UsuarioAmbitoForm;
