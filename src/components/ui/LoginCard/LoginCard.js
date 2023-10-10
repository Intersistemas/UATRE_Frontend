import React from 'react';

import classes from './LoginCard.module.css';

const Card = (props) => {
  return (
    <div className={ `rounded p-4 pb-2 ${classes.card} ${props.className}`}>{props.children}</div>
  );
};
  
export default Card;
