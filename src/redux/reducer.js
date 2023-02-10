import { MODULO_SELECCIONAR, AFILIADO_SELECCIONAR } from "./actionTypes";

const initialState = {
  modulo: "",
  afiliado: {},
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

    default:
      return state;
  }
};

export default reducer;
