export function Mascara(numero, patron) {
	let r = "";
	if (!numero) return r;
	let s = `${numero}`;
	if (!patron) return s;
	let p = `${patron}`;
	if (s.length > (p.match(/#/g) || []).length) return patron;
	for (let px = p.length - 1, sx = s.length - 1; px > -1; px--) {
		let d = p[px];
		if (d === "#") {
			if (sx > -1) d = s[sx--];
			else d = "0";
		}
		r = `${d}${r}`;
	}
	return r;
}

export function Moneda(numero) {
	if (numero == null) return "";
	return Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
	}).format(numero);
}

export function Booleano(valor) {
	if (valor == null) return "";
	if (valor) return "Si";
	return "No";
}

export function Fecha(isoString) {
	if (isoString == null) return "";
	return Intl.DateTimeFormat("es-AR", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(isoString));
}

export function Periodo(numero) {
	return Mascara(numero, "####-##");
}

export function Cuit(numero) {
	return Mascara(numero, "##-##.###.###-#");
}

export function DNI(numero) {
	return Mascara(numero, "##.###.###");
}

export function Entero(numero) {
	if (numero == null || numero === "") return numero;
	numero = `${numero}`;
	let r = parseInt(numero);
	if (isNaN(r)) return Entero(numero.slice(0, numero.length - 2));
	return r;
}

export function Decimal(numero) {
	if (numero == null || numero === "") return numero;
	numero = `${numero}`;
	let r = parseFloat(numero);
	if (isNaN(r)) return Decimal(numero.slice(0, numero.length - 2));
	return r;
}

class _Formato {
	Mascara = Mascara;
	Moneda = Moneda;
	Booleano = Booleano;
	Fecha = Fecha;
	Periodo = Periodo;
	Cuit = Cuit;
	Entero = Entero;
	Decimal = Decimal;
	DNI = DNI;
}

const Formato = new _Formato();

export default Formato;
