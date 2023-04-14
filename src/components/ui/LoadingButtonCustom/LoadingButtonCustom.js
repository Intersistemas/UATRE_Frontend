import React from 'react';
import { LoadingButton } from "@mui/lab";
import classes from './LoadingButtonCustom.module.css';

const LoadingButtonCustom = (props) => {
  return (
    <LoadingButton
      type={props.type || 'button'}

      className={`${classes[`${props.className}`]} ${classes.boton}`}
      style={{width: props.width != null ? `${props.width}%`:"100%"}}

      onClick={props.onClick}
      disabled={props.disabled || false}
      loading={props.loading || false}
      loadingPosition="start"
    >
      {props.children}
    </LoadingButton>
  );
};

export default LoadingButtonCustom;
