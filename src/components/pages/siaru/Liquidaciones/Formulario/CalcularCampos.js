import Formato from "components/helpers/Formato";
import dayjs from "dayjs";

const CalcularCampos = ({
	periodo = 0,
	vencimientoFecha = null,
	fechaPagoEstimada = null,
	interesImporte = 0,
	interesNeto = 0,
	...x
}) => {
	const r = {
		periodo: periodo,
		vencimientoFecha: vencimientoFecha,
		fechaPagoEstimada: fechaPagoEstimada,
		interesImporte: interesImporte,
		interesNeto: interesNeto,
		...x
	};

	if (periodo > 100) {
		r.vencimientoFecha = dayjs(Formato.Mascara(periodo, "####-##-15"))
			.add(1, "month")
			.format("YYYY-MM-DD");

		if (fechaPagoEstimada != null) {
			let d = dayjs(fechaPagoEstimada).diff(r.vencimientoFecha, "days");
			if (d > 0) r.vencimientoDias = d;
		}
	} else {
		periodo = 0
	}

	r.importeTotal = r.interesImporte + r.interesNeto;
	r.importeTotal = Math.round((r.importeTotal + Number.EPSILON) * 100) / 100;

	return r;
};

export default CalcularCampos;