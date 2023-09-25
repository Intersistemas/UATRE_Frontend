import React from 'react';

import classes from './LoginCard.module.css';

const Card = (props) => {
  return (
    <div className={ `rounded p-5 ${classes.card} ${props.className}`}>{props.children}</div>
  );
};
  
export default Card;
