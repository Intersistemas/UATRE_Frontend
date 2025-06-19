import AsArray from "./AsArray";

export default function JoinOjects(value, base = null) {
	if (value == null) return base;
	if (typeof base !== "object") base = {};
	const obj = { ...base };
	AsArray(value, true)
		.filter((r) => typeof r === "object")
		.forEach((r, i) => {
			Object.keys(r).forEach((k) => {
				if (i === 0) {
					obj[k] = r[k];
					return;
				}
				if (obj[k] === r[k]) return;
				obj[k] = undefined;
			});
		});
	return obj;
}
