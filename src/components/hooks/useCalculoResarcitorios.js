import { useEffect, useState } from "react";
import useQueryState from "./useQueryState";
import Round from "components/helpers/Round";

function sTOd(fec2) {
	if (esFecha(fec2)) {
		let f3 = fec2.slice(0, 10).split("-");
		return parseInt(f3[0]+""+f3[1]+""+f3[2],10);
	} else return 0;
}

function dTOs(fec3) {
	let f4 = ""+fec3;
	let a4 = f4.slice(0,4);
	let m4 = f4.slice(4,6);
	let d4 = f4.slice(6,8);
	let f5 = a4+"-"+m4+"-"+d4;
	if (esFecha(f5)) return f5;
	else return "";
}

function esEntero(num1) {
	let dig;
	for (let x=0; x<num1.length; x++){
		dig = num1.charAt(x);
		if (dig < "0" || dig > "9") return false;
	}
	return true;
}

function esFecha(fec1) {
	fec1 ??= "";
	if (fec1.indexOf("-") == -1) return false;
	let f1 = fec1.slice(0, 10).split("-");
	if (!f1[0] || !f1[1] || !f1[2]) return false;
	if (!esEntero(f1[0]) || !esEntero(f1[1]) || !esEntero(f1[2])) return false;
	let d1 = f1[2]*1;
	let m1 = f1[1]*1-1;
	let a1 = f1[0]*1;
	let f2 = new Date(a1,m1,d1);
	let d2 = f2.getDate();
	let m2 = f2.getMonth();
	let a2 = f2.getFullYear();
	if (d1==d2 && m1==m2 && a1==a2) {
		return true;
	} else return false;
}

function diaMas(fec5) {
	let f7 = "" + fec5;
	let a6 = f7.slice(0,4)*1;
	let m6 = f7.slice(4,6)*1;
	let d6 = f7.slice(6,8)*1+1;
	if (!esFecha(dTOs(a6*10000+m6*100+d6))) {
		d6 = 1;
		m6 += 1;
		if (m6 > 12) {
			m6 = 1;
			a6 += 1;
		}
	}
	return a6*10000+m6*100+d6;
}

function sumMeses(fec8,mes8) {
	let xf8 = "" + fec8;
	let xm8 = mes8;
	let ax8 = xf8.slice(0,4)*1;
	let mx8 = xf8.slice(4,6)*1;
	let dx8 = xf8.slice(6,8)*1;
	ax8 += parseInt(xm8/12);
	mx8 += xm8 % 12;
	if (mx8 > 12) {
		mx8 -= 12;
		ax8 += 1;
	}
	while (!esFecha(dTOs(ax8*10000+mx8*100+dx8))) {
		dx8 -= 1;
	}
	return ax8*10000+mx8*100+dx8;
}

function difDias(fec0,fec9) {
	let xf0 = "" + fec0;
	let xf9 = "" + fec9;
	let ax0 = xf0.slice(0,4)*1;
	let mx0 = xf0.slice(4,6)*1;
	let dx0 = xf0.slice(6,8)*1;
	let ax9 = xf9.slice(0,4)*1;
	let mx9 = xf9.slice(4,6)*1;
	let dx9 = xf9.slice(6,8)*1;
	let mes9 = (ax0-ax9)*12+mx0-mx9;
	let dia9 = 0;
	if (mes9 = 0) dia9 = dx0-dx9;
	if (mes9 = 1) {
		dia9 += 1;
		dx9 += 1;
		while (esFecha(dTOs(ax9*10000+mx9*100+dx9))) {
			dia9 += 1;
			dx9 += 1;
		}
		mx9 += 1;
		if (mx9 > 12) {
			ax9 += 1;
			mx9 -= 12;
		}
		dx9 = 1;
		let fecn = ax9*10000+mx9*100+dx9;
		while (fec0 > fecn) {
			dia9 += 1;
			dx9 += 1;
			fecn = ax9*10000+mx9*100+dx9;
		}
	}
	if (mes9 > 1) {
		dia9 += (mes9-1)*30;
		dia9 += difDias(fec0,sumMeses(fec9,mes9-1));
	}
	return dia9;
}

function difFecha(fec7,fec6) {
	let xf7 = "" + fec7;
	let xf6 = "" + fec6;
	let ax7 = xf7.slice(0,4)*1;
	let mx7 = xf7.slice(4,6)*1;
	let dx7 = xf7.slice(6,8)*1;
	let ax6 = xf6.slice(0,4)*1;
	let mx6 = xf6.slice(4,6)*1;
	let dx6 = xf6.slice(6,8)*1;
	let meses = (ax7-ax6)*12+mx7-mx6;
	let dias = 0;
	if (dx6 > dx7) {
		meses -= 1;
		dias = difDias(fec7,sumMeses(fec6,meses));
	} else dias = dx7 - dx6;
	return [meses,dias];
}

export default function useCalculoResarcitorios() {
	const { setState: setTasasInteresQuery } = useQueryState(
		() => ({
			config: {
				baseURL: "Comunes",
				endpoint: `/ARCATasasInteres`,
				method: "GET",
			},
		}),
		{ query: {
			config: { errorType: "response" },
			params: {
				deleted: false,
				sort: "desdeFecha,hastaFecha"
			}
		} }
	);

	const [state, setState] = useState({
		ready: false,
		/** @type {{ desde: number, hasta: number, tasa: number }[]} */
		data: []
	})

	useEffect(() => {
		if (state.ready) return;
		if (state.loading) return;
		setState((o) => ({ ...o, loading: true }));
		setTasasInteresQuery((o) => ({
			...o,
			onLoad: ({ ok }) => {
				let rData = [];
				if (Array.isArray(ok)) {
					rData = ok.sort((a, b) => (a?.desdeFecha < b?.desdeFecha) ? -1
						: (a?.desdeFecha > b?.desdeFecha) ? 1
						: 0
					);
				}
				const data = [];
				let previo = null;
				rData.forEach(r => {
					const tasa = {
						desde: sTOd(r?.desdeFecha),
						hasta: sTOd(r?.hastaFecha),
						tasa: Number(r?.resarcitorioMensual ?? 0)
					};
					if (previo) tasa.desde = previo.hasta;
					data.push(tasa);
					previo = tasa;
				})
				if (previo) previo.hasta = 20991231;
				setState((o) => ({ ...o, ready: true, loading: false, data }));
			}
		}))
	}, [state, setTasasInteresQuery]);

	/**
	 * @param {string} vencimiento Fecha de vencimiento ("YYYY-MM-DD")
	 * @param {string} pago Fecha de pago ("YYYY-MM-DD")
	 * @param {number} importe importe del pago
	 * @returns {{
	 * 	desde: string
	 * 	hasta: string
	 * 	tasa: number
	 * 	interes: number
	 * 	dias: number
	 * }[]}
	 */
	const calculo = (vencimiento, pago, importe) => {
		/** @type {{ desde: string, hasta: string, tasa: number, interes: number, dias: number }[]} */
		const retorno = [];
		if (!state.ready) return retorno;
		if (!esFecha(vencimiento)) return retorno;
		if (!esFecha(pago)) return retorno;
		let mini = false;
		let maxi = false;
		let f001 = sTOd(vencimiento);
		let f002 = sTOd(pago);
		const data = state.data ?? [];
		let linx = 0;
		/** @type {data} */
		const cArr = [];
		let calc = {};
		for (let x = 0; x < data.length; x++) {
			let todo = true;
			if (!mini) {
				if ((f001 >= data[x].desde) && (f001 <= data[x].hasta)) {
					calc.desde = f001;
					mini = true;
					todo = false;
				}
			}
			if (mini) {
				if (f002 <= data[x].hasta) {
					if (todo) calc.desde = data[x].desde;
					calc.hasta = f002;
					maxi = true;
				}
				else {
					if (!todo) {
						calc.hasta = data[x].hasta;
					}
					else {
						calc.desde = data[x].desde;
						calc.hasta = data[x].hasta;
					}
				}
				calc.tasa = data[x].tasa;
				cArr.push(calc);
				calc = {};
				linx += 1;
			}
			if (mini && maxi) break;
		}

		for (let x = 0; x < linx; x++) {
			const [mmm,ddd] = cArr[x].desde > cArr[x].hasta
				? [0,0]
				: difFecha(cArr[x].hasta, cArr[x].desde);
			const valor = {
				desde: dTOs(diaMas(cArr[x].desde)),
				hasta: dTOs(cArr[x].hasta),
				dias: mmm * 30 + ddd,
				interes: Round((mmm + (ddd / 30)) * cArr[x].tasa * importe / 100, 2),
				tasa: Round(cArr[x].tasa / 30, 6)
			};
			retorno.push(valor);
		}
		return retorno;
	}

	/**
	 * @param {{ desde: string, hasta: string, tasa: number, interes: number, dias: number }[]} calc
	 * @returns {{ desde: string, hasta: string, tasa: number, interes: number, dias: number }}
	 **/
	const resumen = (calc) => {
		let retorno = {
			desde: undefined,
			hasta: undefined,
			tasa: 0,
			interes: 0,
			dias: 0
		};
		if (calc.length === 0) return retorno;
		retorno = calc.reduce((a, b) => ({
			desde: a.desde < b.desde ? a.desde : b.desde,
			hasta: a.hasta > b.hasta ? a.hasta : b.hasta,
			tasa: a.tasa + b.tasa,
			interes: a.interes + b.interes,
			dias: a.dias + b.dias,
		}));
		retorno.tasa = Round(retorno.tasa / calc.length, 6);
		retorno.interes = Round(retorno.interes, 2);
		return retorno;
	}

	/**
	 * @param {string} vencimiento Fecha de vencimiento ("YYYY-MM-DD")
	 * @param {string} pago Fecha de pago ("YYYY-MM-DD")
	 * @param {number} importe importe del pago
	 * @returns {{ desde: string, hasta: string, tasa: number, interes: number, dias: number }}
	 **/
	const calculoResumen = (vencimiento, pago, importe) => resumen(calculo(vencimiento, pago, importe))

	return { ready: !!state.ready, calculo, resumen, calculoResumen };
}