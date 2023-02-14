import React from 'react';
import Button1 from 'react-bootstrap/Button';
import classes from './Button.module.css';

const Button = (props) => {
  return (
    <Button1
      type={props.type || 'button'}

      className={`${classes[`${props.className}`]} ${classes.boton}`}
      style={{width: props.width != null ? `${props.width}%`:"100%"}}

      onClick={props.onClick}
      disabled={props.disabled || false}
    >
      {props.children}
    </Button1>
  );
};

export default Button;
