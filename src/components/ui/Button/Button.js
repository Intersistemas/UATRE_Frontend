import React from 'react';
import Boton from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import useTareasUsuario from 'components/hooks/useTareasUsuario';
import classes from './Button.module.css';

const Button = (props) => {

	const tareas = useTareasUsuario();

	let disabled = props.disabled;
	if (props.tarea) disabled = disabled || !tareas.hasTarea(props.tarea);

  //#region texto de boton
  const texto = () => {
      
      if (props.underlineindex || props.underlineindex === 0) {

        var splitAt = (slicable, ...indices) => [0, ...indices].map((n, i, m) => slicable.slice(n, m[i+1]))
        var ArregloNombre = splitAt(props.children,props.underlineindex,props.underlineindex+1)

       return (
        <text   
          style={ props.ellipsis ? { textOverflow: "ellipsis", width: "12rem", display: 'inline-block',overflow: "hidden"} : {}}
        >
          {ArregloNombre[0]}<text className={classes.underline}>{ArregloNombre[1]}</text>{ArregloNombre[2]}
          </text>)
      
      } else {
        return ( props.children )
      }
  }  
  //#endregion

  return (

      <Boton
        type={props.type || 'button'}
        className={
          `${classes[`${props.className}`]}
           ${props.botonBorder && classes.botonBorder}
           ${classes.boton}`
        }
        style={{ ...props.style, width: props.width != null ? `${props.width}%`:"100%"}}
        onClick={props.onClick}
        disabled={disabled || false}
        overlay="asd"
      >
          {props.loading && <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />}
        {texto()}
      </Boton>
  );
};
export default Button;
