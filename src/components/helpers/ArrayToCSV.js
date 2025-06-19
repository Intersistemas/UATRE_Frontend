import JoinOjects from "./JoinObjects";

export default function ArrayToCSV(
	array = [],
	{ colSep = ";", rowSep = "\r\n", titles = true } = {}
) {
	let data = array;
	if (
		data.length > 0 &&
		typeof data[0] === "object" &&
		!Array.isArray(data[0])
	) {
		const keys = Object.keys(JoinOjects(data, {}));
		data = data.map((o) => keys.map((k) => o[k]));
		if (titles) data.unshift(keys);
	}

	return data
		.map((row) =>
			row
				.map((column) =>
					isNaN(column) ? `"${column?.replace(/"/g, '""') ?? ""}"` : column
				)
				.join(colSep)
		)
		.join(rowSep);
}
