import {
	MODULO_SELECCIONAR,
	AFILIADO_SELECCIONAR,
	EMPRESA_SELECCIONAR,
	LIQUIDACION_PROCESAR_SELECCIONAR,
	MODULO_EJECUTARACCION,
	USUARIO_LOGUEADO,
} from "./actionTypes";

const initialState = {
	modulo: {},
	moduloAccion: "",
	afiliado: {},
	empresa: null,
	liquidacionProcesar: {
		existente: {
			periodo: null,
		},
		desdeArchivo: {
			periodo: null,
			archivo: null,
		},
		manual: {
			periodo: null,
		},
	},
};
const reducer = (state = initialState, action) => {
	switch (action.type) {
		case MODULO_SELECCIONAR:
			return {
				...state,
				modulo: action.payload,
			};

		case AFILIADO_SELECCIONAR:
			return {
				...state,
				afiliado: action.payload,
			};

		case EMPRESA_SELECCIONAR:
			return {
				...state,
				empresa: action.payload
			}

		case LIQUIDACION_PROCESAR_SELECCIONAR:
			return {
				...state,
				liquidacionProcesar: action.payload
			}

		case MODULO_EJECUTARACCION:
			return {
				...state,
				moduloAccion: action.payload,
			};

		case USUARIO_LOGUEADO:
			return {
				...state,
				usuarioLogueado: action.payload,
			};

		default:
			return state;
	}
};

export default reducer;
