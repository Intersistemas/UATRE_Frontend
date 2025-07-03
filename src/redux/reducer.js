import {
	MODULO_SELECCIONAR,
	AFILIADO_SELECCIONAR,
	EMPRESA_SELECCIONAR,
	MODULO_EJECUTARACCION,
	USUARIO_LOGUEADO, //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
	LIQUIDACION_PROCESAR_SELECCIONAR,
	SET_NAV_FUNCTION,
	TASAS_ARCA,
	USUARIO_PERFIL,
} from "./actionTypes";

const Item = (k) => `redux_${k}`;

export const limpiarReducer = () => {
	localStorage.removeItem(Item(AFILIADO_SELECCIONAR));
	localStorage.removeItem(Item(EMPRESA_SELECCIONAR));
	localStorage.removeItem(Item(USUARIO_LOGUEADO)); //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
	localStorage.removeItem(Item(LIQUIDACION_PROCESAR_SELECCIONAR));
	localStorage.removeItem(Item(TASAS_ARCA));
};

const escribirReducer = (k, v) =>
	localStorage.setItem(Item(k), typeof v === "string" ? v : JSON.stringify(v));

const liquidacionProcesarDef = {
	existente: {
		periodoDesde: null,
		periodoHacia: null,
	},
	desdeArchivo: {
		periodo: null,
		archivo: null,
	},
	manual: {
		periodo: null,
	},
};
const tasasARCADef = [];
const leerReducer = (k) => {
	//console.log('leerReducer_K:',k);
	const v = localStorage.getItem(Item(k));
	//console.log('leerReducer_v:',v);

	try{
		switch (k) {
			case AFILIADO_SELECCIONAR:
				return v ? JSON.parse(v) : {};
			case EMPRESA_SELECCIONAR:
				return v ? JSON.parse(v) : null;
			case USUARIO_LOGUEADO: //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
				return v ? JSON.parse(v) : {};
			case LIQUIDACION_PROCESAR_SELECCIONAR:
				return v ? JSON.parse(v) : liquidacionProcesarDef;
			case TASAS_ARCA:
				return v ? JSON.parse(v) : tasasARCADef;
			default:
				return v;
		}
	}
	catch(error){
		console.error(error)
		return v;
	}

};

const initialState = {
	modulo: {},
	afiliado: leerReducer(AFILIADO_SELECCIONAR),
	empresa: leerReducer(EMPRESA_SELECCIONAR),
	moduloAccion: "",
	usuarioLogueado: leerReducer(USUARIO_LOGUEADO), //ToDo: Cambiar para obtener este dato mediante consulta al api y almacenarlo en un estado en authContext
	liquidacionProcesar: leerReducer(LIQUIDACION_PROCESAR_SELECCIONAR),
	tasasInteresARCA: leerReducer(TASAS_ARCA),
	nav: {},
	usuarioPerfil: { show: false },
};

const reducer = (state = initialState, { type, payload }) => {
	switch (type) {
		case MODULO_SELECCIONAR: {
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
		case TASAS_ARCA: {
			const tasasARCA = payload
				? [...payload]
				: tasasARCADef;
			escribirReducer(TASAS_ARCA, tasasARCA);
			return { ...state, tasasARCA };
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
		case USUARIO_PERFIL: {
			return { ...state, usuarioPerfil: payload };
		}
		default: {
			return state;
		}
	}
};

export default reducer;
