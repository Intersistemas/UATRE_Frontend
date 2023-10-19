import {
	MODULO_SELECCIONAR,
	AFILIADO_SELECCIONAR,
	EMPRESA_SELECCIONAR,
	LIQUIDACION_PROCESAR_SELECCIONAR,
	MODULO_EJECUTARACCION,
	USUARIO_LOGUEADO,
	SET_NAV_FUNCTION,
} from "./actionTypes";

export const handleModuloSeleccionar = (payload) => ({
	type: MODULO_SELECCIONAR,
	payload,
});

export const handleAfiliadoSeleccionar = (payload) => ({
	type: AFILIADO_SELECCIONAR,
	payload,
});

export const handleEmpresaSeleccionar = (payload) => ({
	type: EMPRESA_SELECCIONAR,
	payload,
});

export const handleLiquidacionProcesarSeleccionar = (payload) => ({
	type: LIQUIDACION_PROCESAR_SELECCIONAR,
	payload,
});

export const handleModuloEjecutarAccion = (payload) => ({
	type: MODULO_EJECUTARACCION,
	payload,
});

//Usuario Logueado
export const handleUsuarioLogueado = (payload) => ({
	type: USUARIO_LOGUEADO,
	payload,
});

//SETEO LA FUNCION QUE PASARÁ EL COMPONENTE ANTES DE NAVEGAR A OTRO COMP.
const handleSetNavFunctionFnDef = (to) => {};
export const handleSetNavFunction = (
	fn = handleSetNavFunctionFnDef,
	location = window.location.pathname
) => ({
	type: SET_NAV_FUNCTION,
	payload: { location, fn: fn === handleSetNavFunctionFnDef ? null : fn },
});
