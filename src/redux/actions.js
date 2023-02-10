import { 
    MODULO_SELECCIONAR,
    AFILIADO_SELECCIONAR, 
} from './actionTypes'

export const handleModuloSeleccionar = (payload) => ({
  type: MODULO_SELECCIONAR,
  payload,
});

export const handleAfiliadoSeleccionar = (payload) => ({
  type: AFILIADO_SELECCIONAR,
  payload,
});

