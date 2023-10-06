import React from 'react';
import Boton from 'react-bootstrap/Button';
import classes from './Button.module.css';
 
const Button = (props) => {


  const underline = () => {

      if (props.underlideIndex || props.underlideIndex == 0) {
        var splitAt = (slicable, ...indices) => [0, ...indices].map((n, i, m) => slicable.slice(n, m[i+1]))
        var ArregloNombre = splitAt(props.children,props.underlideIndex,props.underlideIndex+1)

       return (<text> {ArregloNombre[0]}<text className={classes.underline}>{ArregloNombre[1]}</text>{ArregloNombre[2]}</text>)
      
      } else {
        return ( props.children )
        
      }
     }  

  return (
    
    <Boton
      type={props.type || 'button'}
      
      className={`${classes[`${props.className}`]} ${classes.boton}`}
      style={{ ...props.style, width: props.width != null ? `${props.width}%`:"100%"}}
      onClick={props.onClick}
      disabled={props.disabled || false}
    >
      {underline()}
    </Boton>
  );
};
export default Button;
