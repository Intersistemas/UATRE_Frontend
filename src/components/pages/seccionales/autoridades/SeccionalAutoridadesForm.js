import React, { useEffect, useState } from "react";
import classes from "./SeccionalesAutoridadesForm.module.css";
import InputMaterial from "../../../ui/Input/InputMaterial";
import SelectMaterial from "../../../ui/Select/SelectMaterial";
import moment from "moment";
import Button from "../../../ui/Button/Button";

const vigente = new Date(2099, 11, 31);
const hoy = new Date();

const SeccionalAutoridadesForm = (props) => {
  const [numeroAfiliado, setNumeroAfiliado] = useState("");
  const [vigenciaDesde, setVigenciaDesde] = useState(
    moment(hoy).format("yyyy-MM-DD")
  );
  const [vigenciaHasta, setVigenciaHasta] = useState(
    moment(vigente).format("yyyy-MM-DD")
  );
  const [observaciones, setObservaciones] = useState("");
  const [refCargo, setRefCargo] = useState("");


  //Si eleji una autoridad la muestro en el form
  console.log("SeccionalAutoridadesForm", props);
  const { autoridadSeleccionada } = props
    console.log("autoridadSeleccionada", autoridadSeleccionada);
  useEffect(() => {
    if(autoridadSeleccionada !== null){
      setNumeroAfiliado(autoridadSeleccionada?.afiliadoNumero)
      setVigenciaDesde(autoridadSeleccionada?.fechaVigenciaDesde)
      setVigenciaHasta(autoridadSeleccionada?.fechaVigenciaHasta)
      setRefCargo(autoridadSeleccionada?.refCargosId)
      setObservaciones(autoridadSeleccionada?.observaciones)
    }
  }, [autoridadSeleccionada])
  
  const handleInputChange = (value, id) => {
    //console.log(value, id)
    switch (id) {
      case "numeroAfiliado":
        setNumeroAfiliado(value);
        break;

      case "observaciones":
        setObservaciones(value);
        break;

      case "vigenciaDesde":
        setVigenciaDesde(moment(value).format("yyyy-MM-DD"));
        break;

      case "vigenciaHasta":
        setVigenciaHasta(moment(value).format("yyyy-MM-DD"));
        break;

      default:
        break;
    }
  };

  const handleChangeSelect = (value, name) => {
    //console.log("objetoSeleccionadp", value);
    //console.log("id", name);
    switch (name) {
      case "refCargo":
        setRefCargo(value);
        break;

      default:
        break;
    }
  };

  const handleAgregaAutoridad = (event) => {
    event.preventDefault();
    const refCargoElegido = props.refCargos.find((refCargoElegido) => {
      return refCargoElegido.value === refCargo;
    });

    props.onAgregarAutoridad({
      afiliadoId: props.autoridadAfiliado?.id,
      afiliadoNombre: props.autoridadAfiliado?.nombre,
      afiliadoNumero: numeroAfiliado,
      fechaVigenciaDesde: vigenciaDesde,
      fechaVigenciaHasta: vigenciaHasta,
      observaciones: observaciones,
      refCargosId: refCargo,
      refCargosDescripcion: refCargoElegido.label,
      seccionalId: 0,
      seccionalDescripcion: "",
    });
  };

  const handleCambiaAutoridad = (event) => {
    event.preventDefault();
    const refCargoElegido = props.refCargos.find((refCargoElegido) => {
      return refCargoElegido.value === refCargo;
    });

    props.onCambiaAutoridad({
      afiliadoId: props.autoridadAfiliado?.id,
      afiliadoNombre: props.autoridadAfiliado?.nombre,
      afiliadoNumero: numeroAfiliado,
      fechaVigenciaDesde: vigenciaDesde,
      fechaVigenciaHasta: vigenciaHasta,
      observaciones: observaciones,
      refCargosId: refCargo,
      refCargosDescripcion: refCargoElegido.label,
      seccionalId: 0,
      seccionalDescripcion: "",
    });
  };

  const handleBorraAutoridad = (event) => {
    event.preventDefault();
    props.onBorraAutoridad(props.autoridadAfiliado?.id);
  }

  const handleOnValidaAfiliadoClick = (event) => {
    event.preventDefault();
    props.onValidaAfiliadoClick(numeroAfiliado);
  };

  return (
    <div className={classes.div}>
      <div className={classes.renglon}>
        <div className={classes.input33}>
          <InputMaterial
            id="numeroAfiliado"
            value={numeroAfiliado}
            label="Numero Afiliado"
            onChange={handleInputChange}
          />
        </div>
        <Button width={20} onClick={handleOnValidaAfiliadoClick}>
          Valida
        </Button>
        <div className={classes.input}>
          <InputMaterial
            id="nombreAfiliado"
            value={props.autoridadAfiliado?.nombre ?? "No existe el afiliado"}
            label="Nombre"
            readOnly={true}
          />
        </div>
      </div>
      <div className={classes.renglon}>
        <div className={classes.input}>
          <InputMaterial
            id="vigenciaDesde"
            value={vigenciaDesde}
            label="Vigencia Desde"
            onChange={handleInputChange}
            type="date"
          />
        </div>
        <div className={classes.input}>
          <InputMaterial
            id="vigenciaHasta"
            value={vigenciaHasta}
            label="Vigencia Hasta"
            onChange={handleInputChange}
            type="date"
          />
        </div>
        <div className={classes.input}>
          <SelectMaterial
            name="refCargo"
            value={refCargo}
            options={props.refCargos}
            label="Cargo:"
            onChange={handleChangeSelect}
          />
        </div>
      </div>
      <div className={classes.renglon}>
        <div className={classes.input100}>
          <InputMaterial
            id="observaciones"
            value={observaciones}
            label="Observaciones"
            onChange={handleInputChange}
          />
        </div>
      </div>
      <Button
        onClick={handleAgregaAutoridad}
        disable={props.autoridadAfiliado?.id}
      >
        Agregar
      </Button>
      <Button
        onClick={handleCambiaAutoridad}
        disable={props.autoridadAfiliado?.id}
      >
        Cambiar
      </Button>
      <Button
        onClick={handleBorraAutoridad}
        disable={props.autoridadAfiliado?.id}
      >
        Borrar
      </Button>
    </div>
  );
};

export default SeccionalAutoridadesForm;
