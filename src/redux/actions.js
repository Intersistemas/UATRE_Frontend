import { 
    MODULO_SELECCIONAR,
    AFILIADO_SELECCIONAR, 
    MODULO_EJECUTARACCION
} from './actionTypes'

export const handleModuloSeleccionar = (payload) => ({
  type: MODULO_SELECCIONAR,
  payload,
});

export const handleAfiliadoSeleccionar = (payload) => ({
  type: AFILIADO_SELECCIONAR,
  payload,
});

export const handleModuloEjecutarAccion = (payload) => ({
  type: MODULO_EJECUTARACCION,
  payload,
});