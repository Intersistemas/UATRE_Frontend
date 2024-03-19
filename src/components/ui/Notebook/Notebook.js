import React, { useState } from "react";
import Button from "../Button/Button";
import Grid from "../Grid/Grid";

const DefaultRowRender = (props) => (
	<text
		style={{ textAlign: "left", borderBottom: "solid #186090 1px" }}
		{...props}
	/>
);

/**
 *
 * @param {object} props Propiedades.
 * @param {number} props.index Numero de indice actual.
 * @param {number} props.size Tamaño de página actual.
 * @param {number} props.pages Cantidad de páginas actual.
 * @param {number} props.count Cantidad de registros actual.
 * @param {"top" | "bottom" | "left" | "right"} [props.position] Ubicacion de la paginación.
 * @param {(changes: { index: number, size: number }) => void} props.onChange Callback de cambio de página
 * @returns
 */
const PaginationRender = ({
	index,
	size,
	pages,
	count,
	position,
	onChange,
}) => {
	const direction = ["left", "right"].includes(position) ? "column" : "row";
	const txtStyle = { fontSize: "14pt", fontWeight: "bold" };
	const Btn = ({ children, ...p }) => (
		<Grid width="40px" height="35px">
			<Button {...p}>
				<text style={{ ...txtStyle }}>{children}</text>
			</Button>
		</Grid>
	);

	return (
		<Grid
			direction={direction}
			gap="5px"
			style={{ ...txtStyle, color: "#186090" }}
		>
			<Btn disabled={index === 1} onClick={() => onChange({ index: 1, size })}>
				{`<<`}
			</Btn>
			<Btn
				disabled={index === 1}
				onClick={() => onChange({ index: index - 1, size })}
			>
				{`<`}
			</Btn>
			<Grid grow direction={direction} justify="evenly">
				<Grid col justify="end">
					{count} registros.
				</Grid>
				<Grid col justify="end">
					Página {index} / {pages}.
				</Grid>
			</Grid>
			<Btn
				disabled={index === pages}
				onClick={() => onChange({ index: index + 1, size })}
			>
				{`>`}
			</Btn>
			<Btn
				disabled={index === pages}
				onClick={() => onChange({ index: pages, size })}
			>
				{`>>`}
			</Btn>
		</Grid>
	);
};

/**
 *
 * @param {object} [props] Propiedades.
 * @param {object} [props.style] Estilos.
 * @param {DefaultRowRender} [props.rowRender] Render de renglones.
 * @param {any[]} [props.children] Renglones.
 * @param {{
 * 	index?: number,
 * 	size?: number,
 * 	pages?: number,
 * 	count?: number,
 *  position?: "top" | "bottom" | "left" | "right"
 *  render?: PaginationRender,
 * 	onChange?: (changes: { index: number, size: number }) => void,
 * }} [props.pagination] Información de paginacion.
 */
const Notebook = ({
	style = {},
	rowRender: RowRender = DefaultRowRender,
	children = [],
	pagination,
	...x
} = {}) => {
	const [index, setIndex] = useState(pagination?.index || 1);
	const onChangeDef = (changes) => {
		setIndex(changes.index);
		if (pagination?.onChange) pagination.onChange(changes);
	};

	const renderBody = (children = []) => (
		<Grid
			col
			justify="start"
			style={{
				overflowY: "scroll",
				scrollbarColor: "#186090 transparent",
				background: "white",
				fontSize: "16pt",
				border: "solid #186090 1px",
				borderRadius: "15px",
				padding: "5px",
				...style,
			}}
			{...x}
		>
			{children?.map((v, i) => (
				<RowRender key={i}>{v}</RowRender>
			))}
		</Grid>
	);

	if (!pagination) return renderBody(children);

	pagination.index ||= 1;

	pagination.size ??= children.length;

	pagination.count ??= children.length;

	pagination.pages ??= Math.ceil(pagination.count / (pagination.size || 1));
	pagination.pages ||= 1;

	pagination.position ??= "bottom";
	pagination.render ??= PaginationRender;

	let body = null;
	if (
		pagination.size !== children.length &&
		pagination.count === children.length
	) {
		pagination.index = index;
		const start = (pagination.index - 1) * pagination.size;
		body = renderBody(children.slice(start, start + pagination.size));
	} else {
		body = renderBody(children);
	}

	const { render: paginationRender, ...paginationInfo } = pagination;
	const paginationRendered = paginationRender({
		...paginationInfo,
		onChange: onChangeDef,
	});
	switch (pagination.position) {
		case "top": {
			return (
				<Grid col>
					{paginationRendered}
					{body}
				</Grid>
			);
		}
		case "left": {
			return (
				<Grid>
					{paginationRendered}
					{body}
				</Grid>
			);
		}
		case "right": {
			return (
				<Grid>
					{body}
					{paginationRendered}
				</Grid>
			);
		}
		default: {
			return (
				<Grid col>
					{body}
					{paginationRendered}
				</Grid>
			);
		}
	}
};

export default Notebook;
