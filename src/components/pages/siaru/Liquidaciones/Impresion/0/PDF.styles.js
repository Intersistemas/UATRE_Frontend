import { StyleSheet } from "@react-pdf/renderer";

const border = {
	color: "black",
	style: "solid",
	size: "1px",
};
const gap = "10px";
const margin = 5;
const padding = 5;

const styles = StyleSheet.create({
	flex: { display: "flex" },
	row: { flexDirection: "row" },
	col: { flexDirection: "column" },
	rowGap: { rowGap: gap },
	colGap: { columnGapGap: gap },
	gap: {
		rowGap: gap,
		columnGapGap: gap,
	},
	grow: { flexGrow: 1 },
	justifyCenter: { justifyContent: "center" },
	justifyStart: { justifyContent: "flex-start" },
	justifyEnd: { justifyContent: "flex-end" },
	justifyAround: { justifyContent: "space-around" },
	justifyBetween: { justifyContent: "space-between" },
	justifyEvenly: { justifyContent: "space-evenly" },
	marginLeft: { marginLeft: margin },
	marginRight: { marginRight: margin },
	marginTop: { marginTop: margin },
	marginBottom: { marginBottom: margin },
	marginBox: {
		marginLeft: margin,
		marginRight: margin,
		marginTop: margin,
		marginBottom: margin,
	},
	paddingLeft: { paddingLeft: padding },
	paddingRight: { paddingRight: padding },
	paddingTop: { paddingTop: padding },
	paddingBottom: { paddingBottom: padding },
	paddingBox: {
		paddingLeft: padding,
		paddingRight: padding,
		paddingTop: padding,
		paddingBottom: padding,
	},
	border: {
		borderColor: border.color,
		borderStyle: border.style,
	},
	borderLeft: { borderLeft: border.size },
	borderRight: { borderRight: border.size },
	borderTop: { borderTop: border.size },
	borderBottom: { borderBottom: border.size },
	borderBox: {
		borderLeft: border.size,
		borderRight: border.size,
		borderTop: border.size,
		borderBottom: border.size,
	},
	titulo: {
		fontFamily: "Helvetica-Bold",
	},
	page: {
		paddingLeft: padding,
		paddingRight: padding,
		paddingTop: padding,
		paddingBottom: padding,
		display: "flex",
		position: "absolute",
		left: 0,
		right: 0,
		width: "100%",
		height: "100%",
		fontFamily: "Helvetica",
		fontSize: "8pt",
	},
});

export default styles;
