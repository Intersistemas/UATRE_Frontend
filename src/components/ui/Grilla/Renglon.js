import React from "react";
import styles from "./Renglon.module.css";

const Renglon = (props) => {
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

export default Renglon;
