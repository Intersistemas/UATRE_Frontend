import {
	MODULO_SELECCIONAR,
	AFILIADO_SELECCIONAR,
	EMPRESA_SELECCIONAR,
	MODULO_EJECUTARACCION,
	USUARIO_LOGUEADO, //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
	LIQUIDACION_PROCESAR_SELECCIONAR,
	SET_NAV_FUNCTION,
} from "./actionTypes";

const Item = (k) => `redux_${k}`;

export const limpiarReducer = () => {
	localStorage.removeItem(Item(MODULO_SELECCIONAR));
	localStorage.removeItem(Item(AFILIADO_SELECCIONAR));
	localStorage.removeItem(Item(EMPRESA_SELECCIONAR));
	localStorage.removeItem(Item(USUARIO_LOGUEADO)); //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
	localStorage.removeItem(Item(LIQUIDACION_PROCESAR_SELECCIONAR));
};

const escribirReducer = (k, v) =>
	localStorage.setItem(Item(k), typeof v === "string" ? v : JSON.stringify(v));

const liquidacionProcesarDef = {
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
};
const leerReducer = (k) => {
	const v = localStorage.getItem(Item(k));
	switch (k) {
		case MODULO_SELECCIONAR:
			return v ? JSON.parse(v) : {};
		case AFILIADO_SELECCIONAR:
			return v ? JSON.parse(v) : {};
		case EMPRESA_SELECCIONAR:
			return v ? JSON.parse(v) : null;
		// case MODULO_EJECUTARACCION:
		// 	return v;
		case USUARIO_LOGUEADO: //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
			return v ? JSON.parse(v) : {};
		case LIQUIDACION_PROCESAR_SELECCIONAR:
			return v ? JSON.parse(v) : liquidacionProcesarDef;
		default:
			return v;
	}
};

const initialState = {
	modulo: leerReducer(MODULO_SELECCIONAR),
	afiliado: leerReducer(AFILIADO_SELECCIONAR),
	empresa: leerReducer(EMPRESA_SELECCIONAR),
	moduloAccion: "",
	usuarioLogueado: leerReducer(USUARIO_LOGUEADO), //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
	liquidacionProcesar: leerReducer(LIQUIDACION_PROCESAR_SELECCIONAR),
	nav: {},
};

const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case MODULO_SELECCIONAR: {
			escribirReducer(MODULO_SELECCIONAR, payload);
			return { ...state, modulo: payload };
		}
		case AFILIADO_SELECCIONAR: {
			escribirReducer(AFILIADO_SELECCIONAR, payload);
			return { ...state, afiliado: payload };
		}
		case EMPRESA_SELECCIONAR: {
			escribirReducer(EMPRESA_SELECCIONAR, payload);
			return { ...state, empresa: payload };
		}
		case MODULO_EJECUTARACCION: {
			return { ...state, moduloAccion: payload };
		}
		case USUARIO_LOGUEADO: {
			escribirReducer(USUARIO_LOGUEADO, payload);
			return { ...state, usuarioLogueado: payload };
		}
		case LIQUIDACION_PROCESAR_SELECCIONAR: {
			const liquidacionProcesar = payload
				? { ...state.liquidacionProcesar, ...payload }
				: liquidacionProcesarDef;
			escribirReducer(LIQUIDACION_PROCESAR_SELECCIONAR, liquidacionProcesar);
			return { ...state, liquidacionProcesar };
		}
		case SET_NAV_FUNCTION: {
			return {
				...state,
				nav: {
					...state.nav,
					[payload.location]: payload.fn,
				},
			};
		}
		default: {
			return state;
		}
	}
};

export default reducer;
