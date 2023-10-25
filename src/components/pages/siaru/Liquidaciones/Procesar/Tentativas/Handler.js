import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import useQueryQueue from "components/hooks/useQueryQueue";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import DDJJList from "./DDJJList";
import LiquidacionList from "./LiquidacionList";
import LiquidacionesForm from "../../formulario/Form";
import DDJJForm from "./DDJJForm";
import CalcularCampos from "../../formulario/CalcularCampos";
import LiquidacionForm from "./LiquidacionForm";
import LiquidacionPDF from "../../impresion/Handler";

const Handler = ({ periodo, tentativas = [] }) => {
	const navigate = useNavigate();

	const empresa = useSelector((state) => state.empresa);
	const [redirect, setRedirect] = useState({ to: "", options: null });
	if (redirect.to) navigate(redirect.to, redirect.options);
	useEffect(() => {
		if (!empresa?.id) setRedirect({ to: "Siaru" });
	}, [empresa]);

	const [formRender, setFormRender] = useState();

	//#region Trato queries a APIs
	const pushQuery = useQueryQueue((action, params) => {
		switch (action) {
			case "GetLiquidacionTipoPago":
				return {
					config: {
						baseURL: "SIARU",
						method: "GET",
						endpoint: `/LiquidacionesTiposPagos`,
					},
				};
			case "CreateListLiquidacion":
				return {
					config: {
						baseURL: "SIARU",
						endpoint: "/Liquidaciones/List",
						method: "POST",
					},
				};
			case "GetEstablecimientosByEmpresa":
				return {
					config: {
						baseURL: "Comunes",
						method: "GET",
						endpoint: `/EmpresaEstablecimientos/GetByEmpresa`,
					},
				};
			case "GetParameter": {
				const { paramName, ...paramOthers } = params;
				return {
					config: {
						baseURL: "Comunes",
						endpoint: `/Parametros/${paramName}`,
						method: "GET",
					},
					params: paramOthers,
				};
			}
			default:
				return null;
		}
	});
	//#endregion

	//#region Cargo parametros
	const [params, setParams] = useState({
		loading: "Cargando...",
		data: {
			InteresesDiariosPosteriorVencimiento: 0,
		},
		error: {},
	});
	useEffect(() => {
		if (!params.loading) return;
		const pending = Object.keys(params.data);
		const result = {...params.data};
		const errors = {};
		const formatParamValue = (param, value) => {
			switch (param) {
				case "InteresesDiariosPosteriorVencimiento":
					return Formato.Decimal(value ?? 0);
				default:
					return value;
			}
		};
		const queryParam = (param) =>
			pushQuery({
				action: "GetParameter",
				params: { paramName: param },
				onOk: async (res) => {
					result[param] = formatParamValue(param, res.valor);
				},
				onError: async (err) => {
					errors[param] = err;
				},
				onFinally: async () => {
					pending.splice(pending.indexOf(param), 1);
					if (pending.length === 0) {
						setParams({
							data: result,
							error: Object.keys(errors).length ? errors : null,
						});
					}
				},
			});
		pending.forEach((param) => queryParam(param));
	}, [pushQuery, params]);
	//#endregion

	//#region declaracion y carga de tipos de liquidacion
	const [tiposPagos, setTiposPagos] = useState({
		loading: "Cargando...",
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!tiposPagos.loading) return;
		pushQuery({
			action: "GetLiquidacionTipoPago",
			onOk: (res) => setTiposPagos((old) => ({
				...old,
				loading: null,
				data: res,
				error: null,
			})),
			onError: (err) => setTiposPagos((old) => ({
				...old,
				loading: null,
				data: null,
				error: err,
			})),
		});
	}, [pushQuery, tiposPagos]);
	//#endregion

	//#region declaración y carga de esablecimientos
	const [establecimientos, setEstablecimientos] = useState({
		loading: "Cargando...",
		params: { empresaId: empresa.id, pageSize: 5000 },
		data: null,
		error: null,
	});
	useEffect(() => {
		if (!establecimientos.loading) return;
		pushQuery({
			action: "GetEstablecimientosByEmpresa",
			params: establecimientos.params,
			onOk: (res) =>
				setEstablecimientos((old) => ({
					...old,
					loading: null,
					data: res.data,
					error: null,
				})),
			onError: (err) =>
				setEstablecimientos((old) => ({
					...old,
					loading: null,
					data: null,
					error: err,
				})),
		});
	}, [pushQuery, establecimientos]);
	//#endregion

	//#region declaración y carga de ddjj y liquidaciones
	const [ddjjList, setDDJJList] = useState({ loading: true, data: [] });
	const ddjjListSinEstab = ddjjList.data?.filter((r) => !r.empresaEstablecimientoId) ?? [];
	const [ddjjSelected, setDDJJSelected] = useState([]);
	const [liqList, setLiqList] = useState({ loading: true, data: []});
	const [liqSelected, setLiqSelected] = useState([]);
	useEffect(() => {
		if (params.loading) return;
		if (!ddjjList.loading) return;
		const newliqList = [];
		const newDDJJ = [];
		tentativas.forEach((tent) => {
			// Si tiene establecimiento y tipo de pago, entonces es una sugerencia de liquidacion válida
			// En caso contrario, es solo a modo informativo de nomina
			const { nominas, ...liq } = tent;
			if (liq.empresaEstablecimientoId && liq.liquidacionTipoPagoId) {
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
				const newLiq = CalcularCampos(liq, params.data);
				newLiq.index = newliqList.length;
				newliqList.push(newLiq);
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
		setLiqList({ data: newliqList });
	}, [tentativas, params, ddjjList]);
	//#endregion

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
					afiliadoId: ddjjRecord.afiliadoId,
					esRural: ddjjRecord.esRural ?? false,
				},
			],
		};
		ret.interesPorcentaje =
			tiposPagos.data?.find((r) => r.id === ret.liquidacionTipoPagoId)
				?.porcentaje ?? 0;
		ret.interesNeto = ret.totalRemuneraciones * (ret.interesPorcentaje / 100);
		return CalcularCampos(ret, params.data);
	};

	const calcLiqListDesdeDDJJList = () => {
		let newLiqList = [];
		if (!ddjjList.data.length) return setLiqList({ data: newLiqList });
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

	const handleLiqOnSelect = (isSelected, records) => {
		setLiqSelected((oldLiqSelected) => {
			const newLiqSelected = [...oldLiqSelected];
			records.forEach((record) => {
				const recordIx = newLiqSelected.findIndex(
					(r) => r.index === record.index
				);
				const isFound = recordIx > -1;
				if (isSelected && !isFound) newLiqSelected.push(record);
				else if (!isSelected && isFound) newLiqSelected.splice(recordIx, 1);
			});
			return newLiqSelected;
		});
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
		if (!ddjjList.data.length) return; // sin datos a cambiar en origen
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

	let liquidacionListRender;
	if (tiposPagos.loading) {
		liquidacionListRender = <h4>Cargando tipos de pagos...</h4>;
	} else if (params.loading) {
		liquidacionListRender = <h4>Cargando parametros...</h4>;
	} else {
		liquidacionListRender = (
			<Grid col full="width">
				<Grid full="width">
					<LiquidacionList
						records={liqList.data}
						tiposPagos={tiposPagos.data}
						loading={liqList.loading}
						noData={getNoData(liqList)}
						selected={liqSelected}
						onSelect={handleLiqOnSelect}
						onSelectAll={(isSelect) =>
							handleLiqOnSelect(isSelect, liqList.data)
						}
						onOpenForm={(record) => {
							// Deshabilitar controles de datos que ya se cargaron.
							const disabled = {};
							Object.keys(record).forEach((k) => (disabled[`${k}`] = true));
							disabled.fechaPagoEstimada = false;
							disabled.cantidadTrabajadores = false;
							disabled.totalRemuneraciones = false;
							setFormRender(
								<LiquidacionesForm
									request="M"
									record={record}
									empresa={empresa}
									titulo={<h3>Generando liquidación</h3>}
									disabled={disabled}
									onConfirm={(newRecord, _request) => {
										// Actualizo lista
										newRecord = CalcularCampos(newRecord, params.data);
										setLiqList((oldLiqList) => {
											const data = [...oldLiqList.data];
											data[record.index] = {
												...newRecord,
												index: record.index,
											};
											setLiqSelected((oldLiqSelected) =>
												data.filter((r) =>
													oldLiqSelected.find((s) => s.index === r.index)
												)
											);
											return { ...oldLiqList, data: data };
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
						pagination={{ index: 1, size: 4 }}
					/>
				</Grid>
				<LiquidacionForm
					records={liqSelected}
					onChange={(changes) => {
						setLiqSelected((oldSelected) => {
							const newLiqSelected = [];
							setLiqList((oldLiqList) => {
								const data = [...oldLiqList.data];
								oldSelected.forEach((r) => {
									let newRecord = CalcularCampos(
										{ ...r, ...changes },
										params.data
									);
									newRecord.index = r.index;
									data[r.index] = newRecord;
									newLiqSelected.push(newRecord);
								});
								return { ...oldLiqList, data: data };
							});
							return newLiqSelected;
						});
					}}
					onConfirm={() =>
						pushQuery({
							action: "CreateListLiquidacion",
							config: {
								body: {
									liquidaciones: liqSelected.map((r) => {
										let { index, ...liquidacion } = r;
										return liquidacion;
									}),
								},
							},
							onOk: async (res) => {
								console.log({ res: res });
								setFormRender(
									<LiquidacionPDF
										empresa={empresa}
										liquidaciones={[...res]}
										onClose={() => setRedirect({ to: "Liquidaciones" })}
									/>
								);
							},
							onError: async (err) => {
								///ToDo: informe de error
								console.log({ errores: err });
							},
						})
					}
				/>
			</Grid>
		);
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
							selected={ddjjSelected}
							onSelect={handleDDJJOnSelect}
							onSelectAll={(isSelect) =>
								handleDDJJOnSelect(isSelect, ddjjList.data)
							}
							pagination={{ index: 1, size: 4 }}
						/>
					</Grid>
					<Grid full="width">
						<DDJJForm
							records={ddjjSelected}
							establecimientos={establecimientos.data}
							disabled={ddjjFormDisabled}
							onChange={handleDDJJFormOnChange}
						/>
					</Grid>
					{ddjjListSinEstab.length ? (
						<Grid width="full" style={{ color: "red" }}>
							Trabajadores sin establecimiento asignado que por consecuencia
							serán excluidos de la liquidación: {ddjjListSinEstab.length}
						</Grid>
					) : null}
					<Grid col full="width">
						{liquidacionListRender}
					</Grid>
				</Grid>
			</Grid>
			{formRender}
		</>
	);
};

export default Handler;
