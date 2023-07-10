const signoDef = {
	positivo: "",
	negativo: "menos",
	ubicacion: -1,
};
const enteroDef = {
	singular: "",
	plural: "",
	femenino: false,
	cero: true,
};
const separadorDef = "coma";
const decimalDef = {
	singular: "",
	plural: "",
	femenino: false,
	cero: false,
	precision: 2,
};
const exponenteDef = "por diez elevado a";

/** Clase que permite describir números en palabras. */
class Descriptor {
	/**
	 * Crea un descriptor de números
	 * @param {object} props Parámetros iniciales del Descriptor.
	 * @param {object} [props.signo] Configuraciones para describir el signo.
	 * @param {string} [props.signo.positivo] Descripción del signo positivo.
	 * @param {string} [props.signo.negativo] Descripción del signo negativo.
	 * @param {number} [props.signo.ubicacion] 0: No desribir, <0: Inicio, >0: Final
	 * @param {object} [props.entero] Configuraciones para describir la parte entera.
	 * @param {string} [props.entero.singular] Descripción de una unidad. Ej: Libra.
	 * @param {string} [props.entero.plural] Descripción de muchas unidades. Ej: Libras.
	 * @param {boolean} [props.entero.femenino] Si unidad es femenino. Ej: Libra es femenino => true
	 * @param {boolean} [props.entero.cero] Si describe el 0
	 * @param {string} [props.separador] Descripción de separador decimal.
	 * @param {object} [props.decimal] Configuraciones para describir la parte decimal.
	 * @param {string} [props.decimal.singular] Descripción de una unidad. Ej: Centavo
	 * @param {string} [props.decimal.plural] Descripción de muchas unidades. Ej: Centavos
	 * @param {boolean} [props.decimal.femenino] Si unidad es femenino. El: Centavo es masculino => false
	 * @param {boolean} [props.decimal.cero] Si describe el 0
	 * @param {number} [props.decimal.precision] Cantidad de posiciones decimales a describir
	 * @param {string} [props.exponente] Descripción de separador exponencial.
	 */
	constructor({
		signo = signoDef,
		entero = enteroDef,
		separador = separadorDef,
		decimal = decimalDef,
		exponente = exponenteDef,
	} = {}) {
		this.signo = { ...signoDef, ...signo };
		this.entero = { ...enteroDef, ...entero };
		this.separador = separador ?? separadorDef;
		this.decimal = { ...decimalDef, ...decimal };
		this.exponente = exponente ?? exponenteDef;
	}

	escalaLarga(numero) {
		let str = numero;
		numero = parseFloat(numero);
		if (isNaN(numero)) return str;
		if (typeof str !== "string") str = numero.toString();

		let signoStr, decimalStr;
		let [enteroStr, exponenteStr] = str.split("e");
		[enteroStr, decimalStr] = enteroStr.split(".");
		enteroStr ??= "0";
		decimalStr ??= "0";
		exponenteStr ??= "";

		signoStr = enteroStr[0];
		if (["-", "+"].includes(signoStr)) enteroStr = enteroStr.slice(1);
		else signoStr = "+";

		enteroStr = enteroStr.replace(/^0+/, "");
		if (enteroStr === "") enteroStr = "0";

		let separador = this.exponente;
		let exponenteDesc = "";
		if (typeof separador !== "string") separador = "";
		if (exponenteStr && separador) {
			const e = new Descriptor();
			e.separador = this.separador;

			exponenteDesc = e.escalaLarga(exponenteStr);
		}

		const this_decimal = this.#initEntero(this.#crearCopia(this.decimal));
		const this_entero = this.#initEntero(this.#crearCopia(this.entero));

		if (exponenteDesc) {
			this_entero.singular = this_entero.plural;
			exponenteDesc = this.#juntar(exponenteDesc, this_entero.singular);
			this_entero.singular = "";
			this_entero.plural = "";
			this_decimal.plural = "";
			this_decimal.singular = "";
			this_decimal.precision = decimalStr.length;
		}

		let decimalDesc = "";
		if (Number(decimalStr) || this_decimal.cero) {
			if (decimalStr.length > this_decimal.precision)
				decimalStr = decimalStr.slice(0, this_decimal.precision);
			if (decimalStr || this_decimal.cero) {
				const e = new Descriptor();
				e.entero = this.#crearCopia(this_decimal, Object.keys(e.entero));
				decimalDesc = this.#juntar(e.escalaLarga(decimalStr), decimalDesc);
			}
		}

		let entero = Number(enteroStr);
		let enteroDesc = "";
		if (entero || this_entero.cero) {
			if (this_entero.singular) {
				if (entero === 1)
					enteroDesc = this.#juntar(this_entero.singular, enteroDesc);
				else enteroDesc = this.#juntar(this_entero.plural, enteroDesc);
			}

			for (let millon = 0; millon < 11; millon++) {
				//Unidades
				let valor = enteroStr.slice(-3);
				enteroStr = enteroStr.slice(0, enteroStr.length - valor.length);
				if (valor) {
					enteroDesc = this.#juntar(
						this.#millones(millon, Number(valor) === 1),
						enteroDesc
					);
					enteroDesc = this.#juntar(
						this.#modulo(
							valor,
							millon || this_entero.singular,
							this_entero.femenino
						),
						enteroDesc
					);
				}
				if (enteroStr === "") break;

				//Miles
				valor = enteroStr.slice(-3);
				enteroStr = enteroStr.slice(0, enteroStr.length - valor.length);
				if (valor) {
					enteroDesc = this.#juntar(
						this.#millones(millon, Number(valor) === 1),
						enteroDesc
					);
					enteroDesc = this.#juntar("mil", enteroDesc);
					enteroDesc = this.#juntar(
						this.#modulo(valor, true, this_entero.femenino),
						enteroDesc
					);
				}
				if (enteroStr === "") break;
			}
		}

		let result = this.#juntar(enteroDesc, decimalDesc, this.separador);
		result = this.#juntar(result, exponenteDesc, this.exponente);

		if (numero && this.signo.ubicacion) {
			let descripcion =
				signoStr === "-" ? this.signo.negativo : this.signo.positivo;
			if (this.signo.ubicacion < 0) result = this.#juntar(descripcion, result);
			else if (this.signo.ubicacion > 0)
				result = this.#juntar(result, descripcion);
		}

		return result;
	}

	#unidad(numero, un, femenino) {
		switch (Number(numero)) {
			case 0:
				return "cero";
			case 1:
				return un ? "un" : femenino ? "una" : "uno";
			case 2:
				return "dos";
			case 3:
				return "tres";
			case 4:
				return "cuatro";
			case 5:
				return "cinco";
			case 6:
				return "seis";
			case 7:
				return "siete";
			case 8:
				return "ocho";
			case 9:
				return "nueve";
			case 10:
				return "diez";
			case 11:
				return "once";
			case 12:
				return "doce";
			case 13:
				return "trece";
			case 14:
				return "catorce";
			case 15:
				return "quince";
			case 16:
				return "dieciseis";
			case 17:
				return "diecisiete";
			case 18:
				return "dieciocho";
			case 19:
				return "diecinueve";
			case 20:
				return "veinte";
			default:
				return "";
		}
	}

	#decena(numero) {
		switch (Number(numero)) {
			case 2:
				return "veinti";
			case 3:
				return "treinta";
			case 4:
				return "cuarenta";
			case 5:
				return "cincuenta";
			case 6:
				return "sesenta";
			case 7:
				return "setenta";
			case 8:
				return "ochenta";
			case 9:
				return "noventa";
			default:
				return "";
		}
	}

	#centena(numero, femenino) {
		switch (Number(numero)) {
			case 1:
				return "ciento";
			case 2:
				return femenino ? "doscientas" : "doscientos";
			case 3:
				return femenino ? "trescientas" : "trescientos";
			case 4:
				return femenino ? "cuatrocientas" : "cuatrocientos";
			case 5:
				return femenino ? "quinientas" : "quinientos";
			case 6:
				return femenino ? "seiscientas" : "seiscientos";
			case 7:
				return femenino ? "setecientas" : "setecientos";
			case 8:
				return femenino ? "ochocientas" : "ochocientos";
			case 9:
				return femenino ? "novecientas" : "novecientos";
			default:
				return "";
		}
	}

	#modulo(str, un, femenino) {
		let numero = Number(str);
		if (typeof str !== "string") str = str.toString();
		let result = "";
		if (numero === 100) {
			result = "cien";
		} else {
			let valor = str.slice(-3).padStart(3, "0");
			let u2 = Number(valor.slice(1, 3));
			if (u2 < 21) {
				result = this.#unidad(u2, un, femenino);
			} else {
				if (valor[2] === "0") result = this.#decena(valor[1]);
				else if (Number(valor[1]) > 2)
					result = `${this.#decena(valor[1])} y ${this.#unidad(
						valor[2],
						un,
						femenino
					)}`;
				else
					result = `${this.#decena(valor[1])}${this.#unidad(
						valor[2],
						un,
						femenino
					)}`;
			}
			if (numero > 100) {
				result = this.#juntar(this.#centena(valor[0], femenino), result);
			}
		}
		return result;
	}

	#millones(numero, singular) {
		switch (Number(numero)) {
			case 1:
				return singular ? "millon" : "millones";
			case 2:
				return singular ? "billon" : "billones";
			case 3:
				return singular ? "trillon" : "trillones";
			case 4:
				return singular ? "cuatrillon" : "cuatrillones";
			case 5:
				return singular ? "quintillon" : "quintillones";
			case 6:
				return singular ? "sextillon" : "sextillones";
			case 7:
				return singular ? "septillon" : "septillones";
			case 8:
				return singular ? "octillon" : "octillones";
			case 9:
				return singular ? "nonillon" : "nonillones";
			case 10:
				return singular ? "decillon" : "decillones";
			default:
				return "";
		}
	}

	#initEntero(e) {
		if (typeof e.singular !== "string" || !e.singular) e.singular = "";
		e.singular = e.singular.trim();
		if (typeof e.plural !== "string" || !e.plural) e.plural = e.singular;
		e.plural = e.plural.trim();
		return e;
	}

	#crearCopia(e, campos = []) {
		let copiar = {};
		if (campos.length === 0) campos = Object.keys(e);
		campos.forEach((k) => (copiar[`${k}`] = e[`${k}`]));
		return JSON.parse(JSON.stringify(copiar));
	}

	#juntar(a, b, separador = "") {
		if (typeof separador !== "string") separador = separador.toString();
		separador = separador.trim();
		separador = separador ? ` ${separador} ` : " ";
		return [a, b].filter((r) => r).join(separador);
	}
}

export default Descriptor;
