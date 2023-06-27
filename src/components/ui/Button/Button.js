import React from 'react';
import Boton from 'react-bootstrap/Button';
import classes from './Button.module.css';
 
const Button = (props) => {
  return (
    <Boton
      type={props.type || 'button'}

      className={`${classes[`${props.className}`]} ${classes.boton}`}
      style={{ ...props.style, width: props.width != null ? `${props.width}%`:"100%"}}
      onClick={props.onClick}
      disabled={props.disabled || false}
    >
      {props.children}
    </Boton>
  );
};
 
export default Button;
