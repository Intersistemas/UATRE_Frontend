import React from "react";

export const Grid = (props) => {
	let {
		style = {},
		display = "flex",
		direction = "row",
		col,
		gap,
		grow,
		justify,

		block,
		width,
		height,
		full,
		basis,
		children,
		...otherProps
	} = props;

	if (width) {
		if (parseInt(width) === width) width = `${width}%`;
		else if (`${width}`.toLowerCase() === "full") width = "100%";
	}

	if (height) {
		if (parseInt(height) === height) height = `${height}%`;
		else if (`${height}`.toLowerCase() === "full") height = "100%";
	}

	if (full) {
		if (full === true) full = "100%";
		else if (parseInt(full) === full) full = `${full}%`;

		switch (full) {
			case "width":
				if (width) full = width;
				else full = "100%";
				width = full;
				break;
			case "height":
				full = "100%";
				height = full;
				break;
			default:
				if (full === "full") full = "100%";
				width = full;
				height = full;
				break;
		}
	}

	if (width) style.width = width;
	if (height) style.height = height;

	if (basis) {
		switch (basis) {
			case "width":
				basis = width;
				break;
			case "height":
				basis = height;
				break;
			case "full":
				basis = full;
				break;
			default:
				break;
		}
		style.flexBasis = basis;
	}

	if (block) display = "block";

	if (display === "flex") {
		if (col) direction = "column";

		switch (direction) {
			case "row":
				style.flexDirection = "row";
				if (gap) style.columnGap = gap;
				break;
			case "column":
				style.flexDirection = "column";
				if (gap) style.rowGap = gap;
				break;
			default:
				break;
		}

		if (grow) style.flexGrow = 1;

		switch (justify) {
			case "start":
				style.justifyContent = "flex-start";
				break;
			case "end":
				style.justifyContent = "flex-end";
				break;
			case "center":
				style.justifyContent = "center";
				break;
			case "around":
				style.justifyContent = "space-around";
				break;
			case "between":
				style.justifyContent = "space-between";
				break;
			case "evenly":
				style.justifyContent = "space-evenly";
				break;
			default:
				break;
		}
	} else {
		if (display === "block") display = null;
		let _;
		({
			style: _,
			display: _,
			block: _,
			width: _,
			height: _,
			full: _,
			basis: _,
			children: _,
			...otherProps
		} = props);
	}

	if (display) style.display = display;

	return (
		<div style={style} {...otherProps}>
			{children}
		</div>
	);
};

export default Grid;
