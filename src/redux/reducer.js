import {
	MODULO_SELECCIONAR,
	AFILIADO_SELECCIONAR,
	EMPRESA_SELECCIONAR,
	LIQUIDACION_PROCESAR_SELECCIONAR,
	MODULO_EJECUTARACCION,
	USUARIO_LOGUEADO,
	SET_NAV_FUNCTION,
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
	nav: {},
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
		case SET_NAV_FUNCTION:
			return {
				...state,
				nav: {...state.nav, [`${action.payload.location}`]:action.payload.fn}
			};

		default:
			return state;
	}
};

export default reducer;
