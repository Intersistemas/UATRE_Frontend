export default function AsArray(value, asItem = false) {
	return Array.isArray(value) ? value : asItem ? [value] : [];
}
