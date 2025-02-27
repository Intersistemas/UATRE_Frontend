import { useSelector } from "react-redux";

/**
 * Clase de ayuda para verificar ambitos
 */
export class AmbitosManager {
	#user;
	#ambito;

	constructor(user) {
		this.#user = user;
		this.#ambito = {tipo: String, ids: []};
	}

	/**
	 * @returns {Object} devuelvo un objeto con el ambito del usuario logeado
	 */

	
	ambitoUser() {

		const{
			ambitoTodos,
			ambitoSeccionales,
			ambitoDelegaciones,
			ambitoProvincias,
		} = this.#user
		
		if (ambitoTodos){
			this.#ambito.tipo = 'Todos';
			this.#ambito.ids = ambitoTodos.ids;
			return this.#ambito;
		} 

		if (ambitoDelegaciones){
			this.#ambito.tipo = 'Delegaciones';
			this.#ambito.ids = ambitoDelegaciones.ids;
			return this.#ambito;
		} 

		if (ambitoProvincias){
			this.#ambito.tipo = 'Provincias';
			this.#ambito.ids = ambitoProvincias.ids
			return this.#ambito;
		} 

		if (ambitoSeccionales){
			this.#ambito.tipo = 'Seccionales';
			this.#ambito.ids = ambitoSeccionales.ids
			return this.#ambito;
		} 

		return {tipo: 'Ambito No definido', ids: []};
	}
}

/**
 * Hook para consulta de ambitos del usuario logeado
@returns {AmbitosManager}
 */
export default function useAmbitosUsuario() {
	const usuarioLogueado = useSelector((state) => state.usuarioLogueado);

	return new AmbitosManager (
		usuarioLogueado ?? {}
	);
}
