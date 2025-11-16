
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
                label="Enunciado"
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