import React from "react";
import styles from "./Grilla.module.css";

export const Renglon = (props) => {
	let { children, className = "", centro, derecha, ...resto } = props;
	if (className !== "") className = ` ${className}`;
	className = `${styles.renglon}${className}`;
	if (centro) className = `${className} ${styles.centro}`;
	if (derecha) className = `${className} ${styles.derecha}`;
	return (
		<div {...resto} className={className}>
			{children}
		</div>
	);
};

export const Celda = (props) => {
	let { children, width = 100, style = {}, ...resto } = props;
	style = { ...style, width: `${width}%` };
	return (
		<div {...resto} style={style}>
			{children}
		</div>
	);
};
