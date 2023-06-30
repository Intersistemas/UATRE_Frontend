import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import Formato from '../../../../../helpers/Formato';
import useHttp from '../../../../../hooks/useHttp';
import Grid from '../../../../../ui/Grid/Grid';
import DDJJList from './DDJJList';
import LiquidacionList from './LiquidacionList';
import LiquidacionesForm from "../../Formulario/Form";
import DDJJForm from './DDJJForm';

const Handler = ({
	empresa,
	periodo,
	tentativas = [],
}) => {
	// const dispatch = useDispatch();
	const [formRender, setFormRender] = useState();
	const { sendRequest: request } = useHttp();

	//#region declaracion y carga de tipos de liquidacion
	const [tiposPagos, setTiposPagos] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "SIARU",
				endpoint: `/LiquidacionesTiposPagos`,
				method: "GET",
			},
			async (res) => setTiposPagos({ data: res }),
			async (err) => setTiposPagos({ error: err })
		);
	}, [request]);
	//#endregion

	//#region declaración y carga de esablecimientos
	const [establecimientos, setEstablecimientos] = useState({ loading: true });
	useEffect(() => {
		request(
			{
				baseURL: "Comunes",
				endpoint: `/EmpresaEstablecimientos/GetByEmpresa?EmpresaId=${empresa.id}&PageSize=5000`,
				method: "GET",
			},
			async (resp) => setEstablecimientos({ data: resp.data }),
			async (error) => setEstablecimientos({ error: error })
		);
	}, [empresa.id, request]);
	//#endregion

	//#region declaración y carga de ddjj y liquidaciones
	const [ddjjList, setDDJJList] = useState({ loading: true });
	const [ddjjSelected, setDDJJSelected] = useState([]);
	const [liqList, setLiqList] = useState({ loading: true });
	useEffect(() => {
		const rta = [...tentativas];
		let newLiquidaciones = [];
		let newDDJJ = [];
		rta.forEach((tent, index) => {
			// Si tiene establecimiento y tipo de pago, entonces es una sugerencia de liquidacion válida
			// En caso contrario, es solo a modo informativo de nomina
			const { nominas, ...liq } = tent;
			if (liq.empresaEstablecimientoId && liq.liquidacionTipoPagoId) {
				liq.id = 0; // El ws me informa el id de liquidacion cuando existe. Este Id lo estoy usando de marca para cuando confirmo una generación.
				liq.nominas = [];
				if (nominas?.length) {
					nominas.forEach((nomina) =>
						liq.nominas.push({
							cuil: nomina.cuil,
							nombre: nomina.nombre,
							condicionRural: nomina.condicionRural,
							remuneracionImponible: nomina.remuneracionImponible,
							esRural: nomina.esRural ?? false,
						})
					);
				}
				newLiquidaciones.push({ index: newLiquidaciones.length, ...liq });
			}
			nominas.forEach((nom) => {
				newDDJJ.push({
					...nom,
					esRural: nom.esRural ?? false,
					empresaEstablecimientoId: tent.empresaEstablecimientoId,
					empresaEstablecimiento_Nombre: tent.empresaEstablecimiento_Nombre,
				});
			});
		});
		setDDJJList({ data: newDDJJ });
		setLiqList({ data: newLiquidaciones });
	}, [tentativas]);
	//#endregion

	/** Retorna información de error o mensaje "sin datos" */
	const getNoData = (rq) => {
		if (rq?.loading) return <h4>Cargando...</h4>;
		if (!rq?.error) return <h4>No hay informacion a mostrar</h4>;
		switch (rq.error.code ?? 0) {
			case 0:
				return <h4>{rq.error.message}</h4>;
			default:
				return (
					<h4 style={{ color: "red" }}>
						{"Error "}
						{rq.error.code ? `${rq.error.code} - ` : ""}
						{rq.error.message}
					</h4>
				);
		}
	};

	/** Retorna ddjjList aplicando filtro */
	const filtrarDDJJList = () => {
		if (ddjjList.loading) return [];
		if (ddjjList.error) return [];
		let ret = [...ddjjList.data];
		///ToDo: Aplicar filtros;
		return ret;
	};

	/** Retorna liqList aplicando filtro */
	const filtrarLiqList = () => {
		if (liqList.loading) return [];
		if (liqList.error) return [];
		let ret = [...liqList.data];
		///ToDo: Aplicar filtros;
		return ret;
	};

	// //#region despachar Informar Modulo
	// const moduloInfo = {
	// 	nombre: "SIARU",
	// 	acciones: [{ name: `Empresas` }, { name: `Procesar liquidaciones` }],
	// };
	// dispatch(handleModuloSeleccionar(moduloInfo));
	// const moduloAccion = useSelector((state) => state.moduloAccion);
	// useEffect(() => {
	// 	switch (moduloAccion) {
	// 		case `Empresas`:
	// 			navigate("/siaru", { state: { empresa: empresa } });
	// 			break;
	// 		case `Procesar liquidaciones`:
	// 			navigate("/siaru/liquidaciones/procesar", {
	// 				state: { empresa: empresa },
	// 			});
	// 			break;
	// 		default:
	// 			break;
	// 	}
	// 	dispatch(handleModuloEjecutarAccion("")); //Dejo el estado de ejecutar Accion LIMPIO!
	// }, [moduloAccion, empresa, navigate, dispatch]);
	// // #endregion

	const newLiq = (ddjjRecord, index) => {
		if (ddjjRecord.empresaEstablecimientoId === 0) return null;
		if (!ddjjRecord.esRural) return null;
		const ret = {
			index: index,
			empresaEstablecimientoId: ddjjRecord.empresaEstablecimientoId,
			periodo: periodo,
			fecha: dayjs().format("YYYY-MM-DD") ?? null,
			cantidadTrabajadores: 1,
			totalRemuneraciones: ddjjRecord.remuneracionImponible,
			tipoLiquidacion: 0,
			refMotivoBajaId: 0,
			liquidacionTipoPagoId: ddjjRecord.afiliadoId ? 1 : 3, ///ToDo: Parametrizar tipos de pago Sindical y Solidario
			empresaEstablecimiento_Nombre: ddjjRecord.empresaEstablecimiento_Nombre,
			nominas: [
				{
					cuil: ddjjRecord.cuil,
					nombre: ddjjRecord.nombre,
					condicionRural: ddjjRecord.condicionRural,
					remuneracionImponible: ddjjRecord.remuneracionImponible,
					esRural: ddjjRecord.esRural ?? false,
				},
			],
		};
		ret.interesPorcentaje =
			tiposPagos.data?.find((r) => r.id === ret.liquidacionTipoPagoId)
				?.porcentaje ?? 0;
		ret.interesNeto = ret.totalRemuneraciones * (ret.interesPorcentaje / 100);
		return ret;
	};

	const calcLiqListDesdeDDJJList = () => {
		let newLiqList = [];
		if (!ddjjList.data) return setLiqList({ data: newLiqList });
		ddjjList.data.forEach((ddjj) => {
			if (ddjj.empresaEstablecimientoId === 0) return;
			if (!ddjj.esRural) return;
			const estab = establecimientos.data?.find(
				(r) => r.id === ddjj.empresaEstablecimientoId
			);
			if (!estab) return;

			const liqCalc = newLiq(ddjj, newLiqList.length);
			let liq = newLiqList.find(
				(r) =>
					r.empresaEstablecimientoId === liqCalc.empresaEstablecimientoId &&
					r.liquidacionTipoPagoId === liqCalc.liquidacionTipoPagoId
			);
			if (liq) {
				liq.cantidadTrabajadores += liqCalc.cantidadTrabajadores;
				liq.nominas.push(...liqCalc.nominas);
				liq.totalRemuneraciones =
					Math.round(
						(liq.totalRemuneraciones +
							liqCalc.totalRemuneraciones +
							Number.EPSILON) *
							100
					) / 100;
				liq.interesNeto =
					Math.round(
						(liq.interesNeto + liqCalc.interesNeto + Number.EPSILON) * 100
					) / 100;
			} else {
				newLiqList.push(liqCalc);
			}
		});
		return setLiqList({ data: newLiqList });
	};

	const handleDDJJOnSelect = (isSelected, records) => {
		const newDDJJSelected = [...ddjjSelected];
		records.forEach((record) => {
			const recordIx = newDDJJSelected.findIndex((r) => r.cuil === record.cuil);
			const isFound = recordIx > -1;
			if (isSelected && !isFound) newDDJJSelected.push(record);
			else if (!isSelected && isFound) newDDJJSelected.splice(recordIx, 1);
		});
		setDDJJSelected(newDDJJSelected);
	};

	const handleDDJJFormOnChange = (records, changes) => {
		if (!ddjjList.data) return; // sin datos a cambiar en origen
		records.forEach((record, ix) => {
			const recordIx = ddjjList.data.findIndex((r) => r.cuil === record.cuil);
			if (recordIx < 0) return; // No se encuentra el registro seleccionado en origen
			const ddjj = ddjjList.data[recordIx];
			records[ix] = { ...ddjj, ...changes }; // aplico los cambios en seleccionado
			ddjjList.data[recordIx] = records[ix]; // aplico los cambios en origen
		});
		calcLiqListDesdeDDJJList();
		setDDJJSelected(records);
	};
	const [ddjjFormDisabled, setDDJJFormDisabled] = useState(false);

	let liquidacionListRender
	if (tiposPagos.loading) {
		liquidacionListRender = (<h4>Cargando tipos de pagos</h4>);
	} else {
		liquidacionListRender = (<LiquidacionList
			records={filtrarLiqList()}
			tiposPagos={tiposPagos.data ?? []}
			loading={liqList.loading || tiposPagos.loading}
			noData={getNoData(liqList)}
			onOpenForm={(record) => {
				// Deshabilitar controles de datos que ya se cargaron.
				const disabled = {};
				Object.keys(record).forEach((k) => (disabled[`${k}`] = true));
				disabled.totalRemuneraciones = false;
				setFormRender(
					<LiquidacionesForm
						request={record.id ? "C" : "A"}
						record={record}
						empresa={empresa}
						titulo={
							<span>
								{record.id ? "Consultando" : "Generando"} liqudacion
							</span>
						}
						disabled={disabled}
						onConfirm={(newRecord, request) => {
							// Actualizo lista
							setLiqList((old) => {
								const data = [...old.data];
								data[record.index] = {
									...newRecord,
									index: record.index,
								};
								return { ...old, data: data };
							});
							// Inhabilitar cambio en DDJJList
							setDDJJFormDisabled(true);
							// Oculto formulario
							setFormRender(null);
						}}
						onCancel={() => setFormRender(null)}
					/>
				);
			}}
			pagination={{ index: 1, size: 5 }}
		/>);
	}

	return (
		<>
			<Grid col full gap="5px">
				<Grid full="width">
					<h2 className="subtitulo">
						Liquidar periodo {Formato.Periodo(periodo)} de
						{` ${Formato.Cuit(empresa.cuit)} ${empresa.razonSocial ?? ""}`}
					</h2>
				</Grid>
				<Grid col full="width">
					<Grid full="width">
						<DDJJList
							records={filtrarDDJJList()}
							loading={ddjjList.loading}
							noData={getNoData(ddjjList)}
							onSelect={handleDDJJOnSelect}
							pagination={{ index: 1, size: 5 }}
						/>
					</Grid>
					<Grid full="width">
						{liquidacionListRender}
					</Grid>
					<Grid full="width">
						<DDJJForm
							records={ddjjSelected}
							establecimientos={establecimientos.data}
							disabled={ddjjFormDisabled}
							onChange={handleDDJJFormOnChange}
						/>
					</Grid>
				</Grid>
			</Grid>
			{formRender}
		</>
	);
};

export default Handler;