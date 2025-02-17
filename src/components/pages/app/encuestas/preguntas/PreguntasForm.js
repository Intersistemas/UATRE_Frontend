
// //////////////////////////////////////////////////////
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Dropdown, Form, Container, ListGroup, Row, Col } from "react-bootstrap";
import moment from "moment";
import UseKeyPress from "components/helpers/UseKeyPress";
import Button from "components/ui/Button/Button";
import Grid from "components/ui/Grid/Grid";
import InputMaterial from "components/ui/Input/InputMaterial";
import modalCss from "components/ui/Modal/Modal.module.css";
import { Dialog, DialogActions, DialogContent, Typography } from "@mui/material";

const PreguntasForm = ({
  data = {},
  data2 = {},
  title = "",
  disabled = {},
  hide = {},
  errors = {},
  onChange = () => {},
  onClose = () => {},
  loading = {},
  request = {}
}) => {
  data ??= {};
  disabled ??= {};
  hide ??= {};
  errors ??= {};
  onChange ??= () => {};
  onClose ??= () => {};
  request ??= {};

  UseKeyPress(["Escape"], () => onClose());
  UseKeyPress(["Enter"], () => onClose(true), "AltKey");

  const [selectedOption, setSelectedOption] = useState("Selecciona una opción");
  const [valorOrden, setValorOrden] = useState("");
  const [textolibre, setTextolibre] = useState({ tex: "" });
  const [opciones, setOpciones] = useState(data.detalles || []);
  const [nuevoValor, setNuevoValor] = useState("");
  const [arrayTotal, setArrayTotal] = useState([]);
  const [fecha, setFecha] = useState(moment().format("YYYY-MM-DD"));

  useEffect(() => {
    setFecha(data.fecha || moment().format("YYYY-MM-DD"));
  }, [data.fecha]);

  const handleSelect = (option) => {
    setSelectedOption(option);
    console.log("Opción seleccionada:", option);
  };

  const handleChange = (event) => {
    setTextolibre({ tex: event.target.value });
  };

  const handleChange11 = (event) => {
    setValorOrden({ tex: event.target.value });
	//no puede ser menor a 1
	if(valorOrden.tex < 1){
		setValorOrden({ tex: 1 });
	}

  };

  const agregarOpcion = () => {
    if (nuevoValor.trim() === "") return;
    const nuevaOpcion = { id: Date.now(), texto: nuevoValor };
    setOpciones([...opciones, nuevaOpcion]);
    setNuevoValor("");
    setArrayTotal([...arrayTotal, nuevaOpcion]);
  };

  const eliminarOpcion = (id) => {
    setOpciones(opciones.filter((opcion) => opcion.id !== id));
  };

  const handleConfirm = () => {
    const datosGuardados = {
      fecha,
    //   fechaFinalizacion: data.fechaFinalizacion,
      enunciado: data2.enunciado,
      opcionSeleccionada: selectedOption,
      valorOrden: valorOrden.tex,
      textoLibre: textolibre.tex !== "" ? textolibre.tex : null,
      opciones: opciones.map((op) => op.texto)
    };
    console.log("Datos de `PreguntasForm` guardados:", datosGuardados);
    onClose(true);
  };
//-----------------------------------------------------------------

  return (
    <>
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
                disabled={disabled}
              />
            </Grid>
			{/* ---------------------------------------------- */}
            <Grid width="full" gap="inherit">
              <InputMaterial
                id="enunciado"
                label="Enunciado"
                error={!!errors.enunciado}
                helperText={errors.enunciado ?? ""}
                value={data2.enunciado}
                disabled={disabled.enunciado ?? false}
                onChange={(value) => onChange({ enunciado: value })}
              />
			  <Dropdown onSelect={handleSelect}>
              <Dropdown.Toggle variant="secondary">{selectedOption}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="Texto Libre">Texto Libre</Dropdown.Item>
                <Dropdown.Item eventKey="Multiple Choices">Multiple Choices</Dropdown.Item>
                <Dropdown.Item eventKey="Opciones">Opciones</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            </Grid>
			 <Grid width="full" gap="inherit"> 
                              
                          
                          <Form.Group as={Row} className="align-items-center">
                              <Col xs="auto">
                                  <strong>Orden:</strong>
                              </Col>
                              <Col xs="auto">
                                  <Form.Control 
                                  type="number"
                                  size="sm" 
                                  value={valorOrden.tex} 
                                  onChange={handleChange11}
                                  style={{ width: "50px" }} // Ajusta el ancho según necesites
                                    
                                  />
                              </Col>
                              </Form.Group>
				</Grid> 
            
            {selectedOption === "Multiple Choices" || selectedOption === "Opciones" ? (
              <div>
                <strong>Opciones/Multiple Choice:</strong>
                <ListGroup>
                  {opciones.map((opcion) => (
                    <ListGroup.Item key={opcion.id} className="d-flex justify-content-between align-items-center">
                      {opcion.texto}
                      <span style={{ color: "red", cursor: "pointer" }} onClick={() => eliminarOpcion(opcion.id)}>
                        ✖
                      </span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <div className="d-flex mt-3">
                  <Form.Control type="text" placeholder="Agregar opción..." value={nuevoValor} onChange={(e) => setNuevoValor(e.target.value)} />
                  <Button variant="primary" onClick={agregarOpcion} width={50}  className="ms-2" >
                    Agregar
                  </Button>
                </div>
              </div>
            ) : selectedOption === "Texto Libre" ?
			
                                    
			    <Form.Group>
			        <Form.Label></Form.Label>
			        <strong>Texto Libre:</strong>
			        <Form.Control type="text"  value={textolibre.tex} onChange={handleChange}  placeholder="Ingrese texto aquí..." />
			        {console.log("Este console, es de textolibre, en el archivo PREGUNTASS_FORMM", textolibre.tex)}								
			    </Form.Group>
			: null}
          </Grid>
        </Modal.Body>
        <Modal.Footer>
          <Button className="botonAzul" width={30} onClick={handleConfirm}>
            CONFIRMAR
          </Button>
          <Button className="botonAmarillo" width={30} onClick={() => onClose()}>
            CERRAR
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PreguntasForm;