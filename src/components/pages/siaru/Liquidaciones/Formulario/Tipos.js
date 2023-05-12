class Tipos {
	static Liquidacion = new Tipos("Liquidacion");
	static Tentativa = new Tipos("Tentativa");

	constructor(name) {
		this.name = name
	}
}

export default Tipos;
