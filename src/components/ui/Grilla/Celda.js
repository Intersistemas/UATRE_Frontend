import React from "react";

const Celda = (props) => {
	let { children, width = 100, style = {}, ...resto } = props;
	style = { ...style, width: `${width}%` };
	return (
		<div {...resto} style={style}>
			{children}
		</div>
	);
};

export default Celda;
