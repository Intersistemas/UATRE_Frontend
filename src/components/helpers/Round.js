export default function Round(value = 0, decimal = 0) {
	const pow = Math.pow(10, decimal);
	return Math.round((value + Number.EPSILON) * pow) / pow;
}
