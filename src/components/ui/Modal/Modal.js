import React, { Fragment } from 'react'
import ReactDOM from 'react-dom';
import classes from './Modal.module.css';

const Backdrop = (props) => {
  return <div className={classes.backdrop} onClick={props.onClose} />;
};

const ModalOverlay = (props) => {    
  var className = classes.modal;
  if (props.cname === "seccionales") {
    className = classes.modalseccionales;
  }
  return (
    <div className={className}>
      <div className={classes.content}>{props.children}</div>
    </div>
  );
};  

const Modal = (props) => {
  //console.log("props", props);
  return (
    <Fragment>
      {ReactDOM.createPortal(
        <Backdrop onClose={props.onClose}/>,
        document.getElementById("backdrop-root")
      )}
      {ReactDOM.createPortal(<ModalOverlay cname={props.cname}>{props.children}</ModalOverlay>,
        document.getElementById("overlay-root")
      )}
    </Fragment>
  );
}

export default Modal