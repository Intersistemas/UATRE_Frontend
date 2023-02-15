import React from "react";
import styles from "./Grilla.module.css";

export const Grilla = (props) => {
	let {
		className = "",
		style = {},
		expandir,
		children,
		...resto
	} = props;
	if (className !== "") className = ` ${className}`;
	className = `${styles.grilla}${className}`;
	if (expandir) style.height = "100%";
	return (
		<div className={className} style={style} {...resto}>
			{children}
		</div>
	);
};

export const Renglon = (props) => {
	let {
		className = "",
		children,
		arriba,
		abajo,
		izquierda,
		derecha,
		centro,
		expandir,
		...resto
	} = props;
	if (className !== "") className = ` ${className}`;
	className = `${styles.renglon}${className}`;
	if (arriba) className = `${className} ${styles.arriba}`;
	if (abajo) className = `${className} ${styles.abajo}`;
	if (izquierda) className = `${className} ${styles.izquierda}`;
	if (derecha) className = `${className} ${styles.derecha}`;
	if (centro) className = `${className} ${styles.centro}`;
	if (expandir) className = `${className} ${styles.expandir}`;
	return (
		<div className={className} {...resto}>
			{children}
		</div>
	);
};

export const Celda = (props) => {
	let {
		className = "",
		style = {},
		children,
		expandir,
		width,
		...resto
	} = props;
	if (className !== "") className = ` ${className}`;
	className = `${styles.celda}${className}`;
	if (expandir) className = `${className} ${styles.expandir}`;
	if (width) style.width = `${width}%`;
	return (
		<div className={className} style={style} {...resto}>
			{children}
		</div>
	);
};

export default Grilla;