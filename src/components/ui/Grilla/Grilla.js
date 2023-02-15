import React from "react";
import styles from "./Grilla.module.css";

export const Renglon = (props) => {
	let { children, className = "", centro, derecha, abajo, ...resto } = props;
	if (className !== "") className = ` ${className}`;
	className = `${styles.renglon}${className}`;
	if (centro) className = `${className} ${styles.centro}`;
	if (derecha) className = `${className} ${styles.derecha}`;
	if (abajo) className = `${className} ${styles.abajo}`;
	return (
		<div {...resto} className={className}>
			{children}
		</div>
	);
};

export const Celda = (props) => {
	let { className, children, width = 100, style = {}, ...resto } = props;
	className = `${styles.celda} ${className}`
	style = { ...style, width: `${width}%` };
	return (
		<div className={className} style={style} {...resto}>
			{children}
		</div>
	);
};
