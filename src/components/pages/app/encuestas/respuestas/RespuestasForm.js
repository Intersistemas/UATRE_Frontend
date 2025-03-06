// import React, { useEffect, useState } from "react";
// import { Modal } from "react-bootstrap";
// import useQueryState from "components/hooks/useQueryState";
// import useQueryQueue from "components/hooks/useQueryQueue";
// import UseKeyPress from "components/helpers/UseKeyPress";
// import Button from "components/ui/Button/Button";
// import Grid from "components/ui/Grid/Grid";
// import InputMaterial from "components/ui/Input/InputMaterial";
// import modalCss from "components/ui/Modal/Modal.module.css";
// import SearchSelectMaterial, {
// 	includeSearch,
// 	mapOptions,
// } from "components/ui/Select/SearchSelectMaterial"; 

// //#region provinciaSelect Options
// const provinciaDefOption = {};
// const provinciaSelectOptions = ({ data = [], buscar = "", ...x }) =>
// 	mapOptions({
// 		data,
// 		map: (r) => ({ value: r.id, label: r.nombre, record: r }),
// 		filter: (r) => includeSearch(r, buscar),
// 		...x,
// 	});
// //#endregion provinciaSelect Options

// //#region localidadSelect Options
// const localidadDefOption = {};
// const localidadSelectOptions = ({ data = [], buscar = "", ...x }) =>
// 	mapOptions({
// 		data,
// 		map: (r) => ({
// 			value: r.id,
// 			label: [r.codPostal, r.nombre].join(" - "),
// 			record: r,
// 		}),
// 		filter: (r) => includeSearch(r, buscar),
// 		...x,
// 	});
// //#endregion localidadSelect Options

// const onChangeDef = (changes = {}) => {};
// const onCloseDef = (confirm = false) => {};

// const RespuestasForm = ({
// 	data = {},
// 	title = "",
// 	disabled = {},
// 	hide = {},
// 	errors = {},
// 	loading = {},
// 	onChange = onChangeDef,
// 	onClose = onCloseDef,
// 	request = {}
// }) => {
// 	data ??= {};

// 	disabled ??= {};
// 	hide ??= {};
// 	errors ??= {};

// 	onChange ??= onChangeDef;
// 	onClose ??= onCloseDef;
// 	request ??="";

// 	UseKeyPress(["Escape"], () => onClose());
// 	UseKeyPress(["Enter"], () => onClose(true), "AltKey");

// 	const [confirmDisabled, setConfirmDisabled] = useState(false);

// 	const { setState: setProvinciasQuery } = useQueryState(
// 		() => ({
// 			config: {
// 				baseURL: "Afiliaciones",
// 				endpoint: `/Provincia`,
// 				method: "GET",
// 			},
// 		}),
// 		{ query: { config: { errorType: "response" } } }
// 	);
// 	const { state: localidadQuery, setState: setLocalidadQuery } = useQueryState(
// 		(_, { id, ...params }) => ({
// 			config: {
// 				baseURL: "Afiliaciones",
// 				endpoint: `/RefLocalidad/${id}`,
// 				method: "GET",
// 			},
// 			params,
// 		}),
// 		{
// 			query: {
// 				config: { errorType: "response" },
// 				params: { id: data.refLocalidadId },
// 			},
// 		}
// 	);
// 	const { setState: setLocalidadesQuery } = useQueryState(
// 		() => ({
// 			config: {
// 				baseURL: "Afiliaciones",
// 				endpoint: `/RefLocalidad`,
// 				method: "GET",
// 			},
// 		}),
// 		{ query: { config: { errorType: "response" } } }
// 	);

// 	//#region Selects

// 	//#region Select provincia
// 	const [provinciaSelect, setProvinciaSelect] = useState({
// 		reload: true,
// 		loading: null,
// 		buscar: "",
// 		data: [],
// 		error: null,
// 		options: [],
// 		selected: provinciaDefOption,
// 		origen: "",
// 	});
// 	// Buscador
// 	useEffect(() => {
// 		setProvinciaSelect((o) => {
// 			const options = provinciaSelectOptions(o);
// 			let selected = o.selected;
// 			let origen = o.origen;
// 			if (!selected.value && selected.record) {
// 				const record = selected.record;
// 				const findFn =
// 					record.id != null
// 						? (o) => o.record.id === record.id
// 						: record.nombre != null
// 						? (o) => includeSearch(o, record.nombre)
// 						: null;
// 				selected = findFn ? options.find(findFn) : null;
// 				if (selected) {
// 					origen = "option";
// 				} else {
// 					selected = o.selected;
// 				}
// 			}
// 			return { ...o, options, selected, origen };
// 		});
// 	}, [provinciaSelect.buscar, provinciaSelect.data]);
// 	//#endregion Select provincia

// 	//#region Select localidad
// 	const [localidadSelect, setLocalidadSelect] = useState({
// 		loading: "",
// 		buscar: "",
// 		data: [],
// 		error: null,
// 		options: [],
// 		selected: localidadDefOption,
// 		origen: "",
// 	});
// 	// Buscador
// 	useEffect(() => {
// 		setLocalidadSelect((o) => {
// 			const options = localidadSelectOptions(o);
// 			let selected = o.selected;
// 			let origen = o.origen;
// 			if (!selected.value && selected.record) {
// 				const record = selected.record;
// 				const findFn =
// 					record.id != null
// 						? (o) => o.record.id === record.id
// 						: record.codPostal != null
// 						? (o) => o.record.codPostal === record.codPostal
// 						: record.nombre != null
// 						? (o) => includeSearch(o, record.nombre)
// 						: null;
// 				selected = findFn ? options.find(findFn) : null;
// 				if (selected) {
// 					origen = "option";
// 				} else {
// 					selected = o.selected;
// 				}
// 			}
// 			return { ...o, options, selected, origen };
// 		});
// 	}, [localidadSelect.buscar, localidadSelect.data]);
// 	//#endregion Select localidad
	


// 	const { setState: setSeccionalesDeLaLocQuery } = useQueryState(
// 		(_, { id, ...params }) => ({
// 			config: {
// 				baseURL: "Afiliaciones",
// 				endpoint: `/SeccionalLocalidad/GetSeccionalLocalidadByRefLocalidadId?RefLocalidadId=${id}&SoloActivos=false`,
// 				method: "GET",
// 			},
// 			params,
// 		}),
// 		{
// 			query: {
// 				config: { errorType: "response" },
// 				params: { id: data.refLocalidadId },
// 			},
// 		}
// 	);

// 	// Buscador
// 	useEffect(() => {
// 		console.log("selected",localidadSelect.selected)
// 			//SI SELECCIONA UNA LOCALIDAD, VERIFICO SI ESA LOCALIDAD YA NO EXISTE EN OTRA SECCIONAL
		
// 			setConfirmDisabled(false);

// 			if (!!localidadSelect.selected.value && (request == "A" || request == "R")){ //solo para el alta
// 				setSeccionalesDeLaLocQuery((o) => ({
// 					...o,
// 					query: {
// 						...o.query,
// 						params: {
// 							...o.query.params,
// 							id: localidadSelect.selected.value,
// 						},
// 					},
// 					onPreLoad: () => "antes de la consulta",
// 					onLoad: ({ ok, error }) =>{
// 						console.log("ok",ok)
// 						console.log("ok.length",ok.length)
// 						if (Array.isArray(ok) && ok.length > 0) { //entro si la localidad ya se encuentra en la tabla SeccionalLocalidad
// 							data = ok;
// 							const localidadBajoSeccional = data.filter((seccional) => seccional.deletedDate == null //SI LA LOCALIDAD ESTÄ ACTIVA EN UNA SECCIONAL
// 							)
// 							if (localidadBajoSeccional.length > 0) {
// 								 alert("La Localidad ya se encuentra asignada a una Seccional");
// 								 setConfirmDisabled(true);
// 								}
							
// 						}
// 						console.log("error",error)
// 					}
// 				}));
// 			}
		
// 	}, [localidadSelect.selected]);
// 	//#endregion Select localidad
	

// 	//#endregion Selects

// 	//#region Carga inicial

// 	//#region Carga inicial select provincias
// 	useEffect(() => {
// 		if (!provinciaSelect.reload) return;
// 		setProvinciaSelect((o) => ({
// 			...o,
// 			reload: false,
// 			loading: "Cargando...",
// 		}));
// 		setProvinciasQuery((o) => ({
// 			...o,
// 			onLoad: ({ ok, error }) => {
// 				let data = [];
// 				if (Array.isArray(ok)) data = ok;
// 				const applyPcia = (p = {}) =>
// 					setProvinciaSelect((o) => ({
// 						...o,
// 						data,
// 						loading: null,
// 						error: error?.toString(),
// 						...p,
// 					}));
// 				if (!localidadQuery.query.params.id) return applyPcia();
// 				setLocalidadQuery((o) => ({
// 					...o,
// 					onLoad: ({ ok }) => {
// 						if (!ok) return applyPcia();
// 						const pcia = data.find((r) => r.id === ok.provinciaId);
// 						if (!pcia) return applyPcia();
// 						applyPcia({
// 							selected: { record: pcia },
// 							origen: "option",
// 						});
// 						const record = ok;
// 						setLocalidadesQuery((o) => ({
// 							...o,
// 							query: {
// 								...o.query,
// 								params: {
// 									...o.query.params,
// 									provinciaId: pcia.id,
// 								},
// 							},
// 							onPreLoad: () =>
// 								setLocalidadSelect((o) => ({
// 									...o,
// 									selected: localidadDefOption,
// 									loading: "Cargando...",
// 								})),
// 							onLoad: ({ ok, error }) =>
// 								setLocalidadSelect((o) => ({
// 									...o,
// 									data: Array.isArray(ok) ? ok : [],
// 									loading: null,
// 									error: error?.toString(),
// 									selected: error ? localidadDefOption : { record },
// 									origen: "option",
// 								})),
// 						}));
// 					},
// 				}));
// 			},
// 		}));
// 	}, [
// 		provinciaSelect,
// 		setProvinciasQuery,
// 		setLocalidadQuery,
// 		localidadQuery,
// 		setLocalidadesQuery,
// 	]);
// 	//#endregion Carga inicial select provincias

// 	//#endregion Carga inicial

// 	return (
// 		<Modal size="lg" centered show>
// 			<Modal.Header className={modalCss.modalCabecera}>{title}</Modal.Header>
// 			<Modal.Body>
// 				<Grid col full gap="15px">
// 					<Grid width gap="inherit">
// 						<SearchSelectMaterial
// 							label="Provincia"
// 							error={!!provinciaSelect.error}
// 							helperText={provinciaSelect.loading || provinciaSelect.error}
// 							disabled={!!disabled.refLocalidadId}
// 							value={provinciaSelect.selected}
// 							onChange={(selected = provinciaDefOption) => {
// 								setProvinciaSelect((o) => ({
// 									...o,
// 									selected,
// 									origen: "option",
// 								}));
// 								setLocalidadSelect((o) => ({
// 									...o,
// 									selected: localidadDefOption,
// 									buscar: "",
// 								}));
// 								onChange({ refLocalidadId: 0, localidadNombre: "" });
// 								if (selected === provinciaDefOption) return;
// 								setLocalidadesQuery((o) => ({
// 									...o,
// 									query: {
// 										...o.query,
// 										params: {
// 											...o.query.params,
// 											provinciaId: selected.value,
// 										},
// 									},
// 									onPreLoad: () =>
// 										setLocalidadSelect((o) => ({
// 											...o,
// 											loading: "Cargando...",
// 										})),
// 									onLoad: ({ ok, error }) =>
// 										setLocalidadSelect((o) => ({
// 											...o,
// 											data: Array.isArray(ok) ? ok : [],
// 											loading: null,
// 											error: error?.toString(),
// 											origen: "option",
// 										})),
// 								}));
// 							}}
// 							options={provinciaSelect.options}
// 							onTextChange={(buscar) =>
// 								setProvinciaSelect((o) => ({ ...o, buscar, origen: "text" }))
// 							}
// 						/>
// 						<SearchSelectMaterial
// 							label="Localidad"
// 							error={!!(localidadSelect.error || errors.refLocalidadId)}
// 							helperText={
// 								localidadSelect.loading ||
// 								localidadSelect.error ||
// 								errors.refLocalidadId
// 							}
// 							disabled={!!disabled.refLocalidadId}
// 							value={localidadSelect.selected}
// 							onChange={(selected = localidadDefOption) => {
// 								setLocalidadSelect((o) => ({
// 									...o,
// 									selected,
// 									origen: "option",
// 								}));
// 								onChange({
// 									refLocalidadId: selected.value,
// 									localidadNombre: selected.label,
// 								});
// 							}}
// 							options={localidadSelect.options}
// 							onTextChange={(buscar) =>
// 								setLocalidadSelect((o) => ({ ...o, buscar, origen: "text" }))
// 							}
// 						/>
// 					</Grid>
// 					{hide.deletedObs ? null : (
// 						<>
// 							<Grid width gap="inherit">
// 								<Grid width="200px">
// 									<InputMaterial
// 										id="deletedDate"
// 										type="date"
// 										label="Fecha Baja"
// 										error={!!errors.deletedDate}
// 										helperText={errors.deletedDate ?? ""}
// 										value={data.deletedDate}
// 										disabled={!!disabled.deletedDate}
// 										onChange={(v) => onChange({ deletedDate: v.format("YYYY-MM-DD") })}
// 									/>
// 								</Grid>
// 								<Grid grow>
// 									<InputMaterial
// 										id="deletedBy"
// 										label="Usuario Baja"
// 										error={!!errors.deletedBy}
// 										helperText={errors.deletedBy ?? ""}
// 										value={data.deletedBy}
// 										disabled={!!disabled.deletedBy}
// 										onChange={(deletedBy) => onChange({ deletedBy })}
// 									/>
// 								</Grid>
// 							</Grid>
// 							<Grid width>
// 								<InputMaterial
// 									id="deletedObs"
// 									label="Observaciones Baja"
// 									error={!!errors.deletedObs}
// 									helperText={errors.deletedObs ?? ""}
// 									value={data.deletedObs}
// 									disabled={!!disabled.deletedObs}
// 									onChange={(deletedObs) => onChange({ deletedObs })}
// 								/>
// 							</Grid>
// 						</>
// 					)}
// 				</Grid>
// 			</Modal.Body>
// 			<Modal.Footer>
// 				<Button
// 					width={25}
// 					loading={loading != null}
// 					className="botonAzul"
// 					disabled={confirmDisabled}
// 					onClick={() => onClose(true)}
// 				>
// 					CONFIRMA
// 				</Button>
// 				<Button width={25} className="botonAmarillo" onClick={() => onClose()}>
// 					CANCELA
// 				</Button>
// 			</Modal.Footer>
// 		</Modal>
// 	);
// };

// export default RespuestasForm;
 
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Dropdown, Form, ListGroup, Row, Col } from "react-bootstrap";
import moment from "moment";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import classes from "./RespuestasForm.module.css";
import { Dialog, DialogContent, Typography } from "@mui/material";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};

const RespuestasForm = ({
  data = {},
  title = "",
  disabled = {},
  hide = {},
  errors = {},
  onChange = onChangeDef,
  onClose = onCloseDef,
  loading = {},
  request = {},
}) => {
  data ??= {};
  disabled ??= {};
  hide ??= {};
  errors ??= {};
  onChange ??= onChangeDef;
  onClose ??= onCloseDef;
  request ??= {};

  console.log(
    "Este console, es de HIDE, en el archivo PREGUNTAªªª_FORM@@@@@@@@@@@@@@@@@|||||||||",
    hide
  );
  console.log(
    "Este console, es de request, en el archivo PREGUNTAªªª_FORM@@@@@@@@@@@@@@@@@|||||||||",
    request
  );
  console.log(
    "Este console, es de Seccionales_Data, en el archivo PREGUNTAªªª_FORM@@@@@@@@@@@@@@@@@||||||||| ",
    data
  );

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onClose(true), "AltKey");

  const [selectedOption, setSelectedOption] = useState(data.tipoPregunta || "Selecciona una opción");
  const [valorOrden, setValorOrden] = useState(data.ordenPregunta || "");
  const [textoLibre, setTextoLibre] = useState(data.textoLibre || "");
  const [enunciado, setEnunciado] = useState(data.enunciado || "");
  const [opciones, setOpciones] = useState(data.detalles || []);
  const [nuevoValor, setNuevoValor] = useState("");
  const [fecha, setFecha] = useState(moment().format("YYYY-MM-DD"));
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTexto, setDialogTexto] = useState("");

  // useEffect(() => {
  //   setFecha(data.fecha || moment().format("YYYY-MM-DD"));
  // }, [data.fecha]);

  useEffect(() => {
    setSelectedOption(data.tipoPregunta || "Selecciona una opción");
    setValorOrden(data.ordenPregunta || "");
    setTextoLibre(data.textoLibre || "");
    setEnunciado(data.enunciado || "");
    setOpciones([...new Map((data.detalles || []).map((o) => [o.id, o])).values()]); // Eliminar duplicados
    setFecha(data.fecha || moment().format("YYYY-MM-DD"));
  }, [data]);
  
  const handleSelect = (option) => {
    setSelectedOption(option);
    onChange({ tipoPregunta: option }); // Actualiza el tipo de pregunta en el estado principal
    console.log("Opción seleccionada:", option);
  };

  const handleChangeTextoLibre = (value) => {
    setTextoLibre(value);
    onChange({ textoLibre: value });
  };

  const handleChangeEnunciado = (value) => {
    setEnunciado(value);
    onChange({ enunciado: value });
  };

  const handleChangeOrden = (value) => {
    setValorOrden(value);
    onChange({ ordenPregunta: value });
  };

  const agregarOpcion = () => {
    if (nuevoValor.trim() === "") return;
    const nuevaOpcion = { id: Date.now(), texto: nuevoValor };
    setOpciones([...opciones, nuevaOpcion]);
    onChange({ detalles: [...opciones, nuevaOpcion] }); // Actualiza los detalles en el estado principal
    setNuevoValor("");
  };

  const eliminarOpcion = (id) => {
    const nuevasOpciones = opciones.filter((opcion) => opcion.id !== id);
    setOpciones(nuevasOpciones);
    onChange({ detalles: nuevasOpciones }); // Actualiza los detalles en el estado principal
  };

  const handleEditOpcion = (id, newValue) => {
    const nuevasOpciones = opciones.map((opcion) =>
      opcion.id === id ? { ...opcion, texto: newValue } : opcion
    );
    setOpciones(nuevasOpciones);
    onChange({ detalles: nuevasOpciones }); // Actualiza los detalles en el estado principal
  };

  return (
    <>
      <div>
        <Dialog onClose={() => setOpenDialog(false)} open={openDialog}>
          <DialogContent dividers>
            <Typography gutterBottom style={{ whiteSpace: "pre-line" }}>
              {dialogTexto}
            </Typography>
          </DialogContent>
        </Dialog>
      </div>
      <Modal show onHide={() => onClose()} size="lg" centered>
        <Modal.Header className={modalCss.modalCabecera}>
          <h3>{title}</h3>
        </Modal.Header>
        <Modal.Body>
          <Grid col full gap="15px">
            <Grid gap="inherit">
              <InputMaterial
                type="date"
                id="fecha"
                label="Fecha"
                value={fecha}
                error={!!errors.fecha}
                helperText={errors.fecha ?? ""}
                onChange={(e) => setFecha(e.target.value)}
                disabled={true}
              />
            </Grid>
            {/* ---------------------------------------------- */}
            <Grid width="full" gap="inherit">
              <InputMaterial
                id="enunciado"
                label="enunciado"
                error={!!errors.enunciado}
                helperText={errors.enunciado ?? ""}
                value={enunciado}
                disabled={disabled.enunciado ?? false}
                onChange={(value) => handleChangeEnunciado(value)}
              />

              <Dropdown onSelect={handleSelect}>
                <Dropdown.Toggle variant="secondary">
                  {selectedOption}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="TX">Texto Libre</Dropdown.Item>
                 
                </Dropdown.Menu>
              </Dropdown>
            </Grid>
            <Grid width="full" gap="inherit">
              <Form.Group as={Row} className="align-items-center">
                <Col xs="auto">
                  <strong>Orden:</strong>
                </Col>
                <Col xs="auto">
                  <InputMaterial
                    id="ordenPregunta"
                    error={!!errors.ordenPregunta}
                    helperText={errors.ordenPregunta ?? false}
                    value={valorOrden}
                    disabled={disabled.ordenPregunta ?? false}
                    type="number"
                    style={{ width: "100px" }}
                    onChange={(value) => handleChangeOrden(value)}
                  />
                </Col>
              </Form.Group>
            </Grid>

            {selectedOption === "TX"  ? (
              
          
              <Form.Group>
                <Form.Label></Form.Label>
                <strong>Texto Libre:</strong>
                <InputMaterial
                  type="text"
                  placeholder="Ingrese texto aquí..."
                  id="textoLibre"
                  error={!!errors.textoLibre}
                  helperText={errors.textoLibre ?? ""}
                  value={textoLibre}
                  disabled={disabled.textoLibre ?? false}
                  onChange={(value) => handleChangeTextoLibre(value)}
                />
              </Form.Group>
            ) : null}
          </Grid>
          {!hide.deletedObs && (
            <>
              <div className={classes.item7}>
                <InputMaterial
                  id="deletedDate"
                  label="Fecha Baja"
                  error={!!errors.deletedDate}
                  helperText={errors.deletedDate ?? ""}
                  
                  value={data.deletedDate}
                  disabled={disabled.deletedDate ?? false}
                  onChange={(value, _id) => onChange({ deletedDate: value })}
                />
              </div>
              <div className={classes.item8}>
                <InputMaterial
                  id="deletedBy"
                  label="Usuario Baja"
                  error={!!errors.deletedBy}
                  helperText={errors.deletedBy ?? ""}
                  value={data.deletedBy}
                  disabled={disabled.deletedBy ?? false}
                  onChange={(value, _id) => onChange({ deletedBy: value })}
                />
              </div>
              <div className={classes.item9}>
                <InputMaterial
                  id="deletedObs"
                  label="Observaciones Baja"
                  error={!!errors.deletedObs}
                  helperText={errors.deletedObs ?? ""}
                  value={data.deletedObs}
                  disabled={disabled.deletedObs ?? false}
                  onChange={(value, _id) => onChange({ deletedObs: value })}
                />
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button className="botonAzul" width={25} onClick={() => onClose(true)}>
            CONFIRMA
          </Button>
          <Button className="botonAmarillo" width={30} onClick={() => onClose()}>
            CERRAR
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default RespuestasForm;