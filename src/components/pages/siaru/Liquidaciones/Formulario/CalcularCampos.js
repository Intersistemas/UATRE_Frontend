import Formato from "components/helpers/Formato";
import dayjs from "dayjs";

const CalcularCampos = (
	record = {
		periodo: 0,
		vencimientoFecha: null,
		fechaPagoEstimada: null,
		interesImporte: 0,
		interesNeto: 0,
		totalRemuneraciones: 0,
		interesPorcentaje: 0,
	},
	params = { InteresesDiariosPosteriorVencimiento: 0 }
) => {
	const r = { ...record };
	r.periodo ??= 0;
	r.vencimientoFecha ??= null;
	r.fechaPagoEstimada ??= null;
	r.interesImporte ??= 0;
	r.interesNeto ??= 0;
	r.totalRemuneraciones ??= 0;
	r.interesPorcentaje ??= 0;

	const p = { ...params };
	p.InteresesDiariosPosteriorVencimiento ??= 0;

	if (r.periodo > 100) {
		r.vencimientoFecha = dayjs(Formato.Mascara(r.periodo, "####-##-15"))
			.add(1, "month")
			.format("YYYY-MM-DD");

		if (r.fechaPagoEstimada != null) {
			let d = dayjs(r.fechaPagoEstimada).diff(r.vencimientoFecha, "days");
			if (d > 0) r.vencimientoDias = d;
		}
	} else {
		r.periodo = 0;
	}

	r.interesNeto =
		Math.round(
			(r.totalRemuneraciones * (r.interesPorcentaje / 100) + Number.EPSILON) *
				100
		) / 100;
	r.interesImporte =
		Math.round(
			(r.totalRemuneraciones *
				(p.InteresesDiariosPosteriorVencimiento / 100) *
				(r.vencimientoDias ?? 0) +
				Number.EPSILON) *
				100
		) / 100;
	r.importeTotal =
		Math.round((r.interesImporte + r.interesNeto + Number.EPSILON) * 100) / 100;

	return r;
};

export default CalcularCampos;
