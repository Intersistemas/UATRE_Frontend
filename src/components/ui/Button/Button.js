import React from 'react';
import Button1 from 'react-bootstrap/Button';
import classes from './Button.module.css';
import './Button.module.css';


const Button = (props) => {
  return (
    <Button1
      type={props.type || 'button'}
      // className={`${classes.button} ${props.className}`}
      className={`classes.${this.props.className.replace(/["]+/g, ' ')}`}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </Button1>
  );
};

export default Button;
