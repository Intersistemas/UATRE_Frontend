import React, { useEffect,useState } from "react";
import modalCss from "components/ui/Modal/Modal.module.css";
import Grid from "components/ui/Grid/Grid";
import Button from "components/ui/Button/Button";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Modal} from 'react-bootstrap';
import UseKeyPress from "components/helpers/UseKeyPress";
import InputMaterial from "components/ui/Input/InputMaterial";
import useHttp from "../../../../hooks/useHttp";
import SearchSelectMaterial from "components/ui/Select/SearchSelectMaterial";

const onChangeDef = (changes = {}) => {};
const onCloseDef = (confirm = false) => {};
 

const UsuarioAmbitoForm = ({
	data = {},
	title = "",
	disabled = {},
	hide = {},
	errors = {},
	onChange = onChangeDef,
	onClose = onCloseDef,
	loading = false,

}) => {
	data ??= {}; 
	loading ??= false
	console.log('Form_ambito_data:',data)
	 //console.log('data_ambito:',data)
	 //console.log('delegaciones_ambito:',delegaciones)
	//console.log('Form_ambito_errors:',errors)
	//console.log('Form_ambito_disabled:',disabled)
	
	disabled ??= {};
	hide ??= {};
	errors ??= {};
	onChange ??= onChangeDef;
	onClose ??= onCloseDef;

	const [procesando, setProcesando] = useState(loading);

	//#region TRAIGO TODOS LOS MODULOS DE UNA VEZ
		
	const ambitosTipoTodos =
	[
		{value: "T", label: "Todos"},
		{value: "S", label: "Seccionales"},
		{value: "D", label: "Delegaciones"},
		{value: "P", label: "Provincias"},			
	]

	//#endregion


	const [ambitosTipo, setAmbitosTipo] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: ambitosTipoTodos,
		selected: {value:data.ambitoTipo, label: ambitosTipoTodos.find((a)=> a.value === data?.ambitoTipo)?.label} 
	});

	const [ambitos, setAmbitos] = useState({
		loading: "Cargando...",
		params: {},
		data: [],
		error: null,
		buscar: "",
		buscado: "",
		options: [],
		selected: {value:data.ambitoId, label: data.nombreAmbito},
	});

	const { isLoading, error, sendRequest: request } = useHttp();	

	

	 //#region Capturo errores
	 useEffect(() => {
		if (error) {
		  setProcesando(false);
		  return;
		}    
	  }, [error]);
	//#endregion

	 //#region Capturo errores
	 useEffect(() => {
	
		  setProcesando(loading);
		  return;
		 
	  }, [loading]);
	//#endregion


	//#region TRAIGO TODOS LOS AMBITOS DEL TIPO DE AMBITO
	useEffect(() => {

			
			const query = {
				baseURL: "",
				endpoint: ``,
				method: ""
			}
			if (data?.ambitoTipo == "T"){
				setAmbitos((o)=>({...o,options:[{value: 0, label:"Todos"}],selected: {value:0, label:"Todos"},}));
				return
			 }

			setAmbitos((o)=>({...o, loading:"Cargando..."}))
			switch (data?.ambitoTipo) {
				case "T":
					query.baseURL = "";
					query.endpoint = "";
					query.method = "";
					break; 
				case "S":
					query.baseURL = "Afiliaciones"; 
					query.endpoint = `/Seccional?SoloActivos=true&verSeccionalesLocalidades=false`;
					query.method = `Get`;
					break;
				case "D":
					query.baseURL = "Comunes";
					query.endpoint = `/RefDelegacion/GetAll`;
					query.method = `Get`;
					break;
				case "P":
					query.baseURL = "Afiliaciones";
					query.endpoint = `/Provincia`;
					query.method = `Get`;
					break;
				default:
					break;
			}

		console.log('query_0',query)
		const processAmbitos = async (ambitosObj) => {
			const ambitos = ambitosObj?.map((ambito) => {
				return { value: ambito?.id, label: `(${ambito?.id}) ${ambito?.nombre ? ambito?.nombre : ambito?.codigo+"-"+ambito?.descripcion}`};
			});
			console.log('ambitos',ambitos)	
			setAmbitos((o)=>({...o,options:ambitos, selected: {value:data?.ambitoId, label: ambitos?.find((a)=> a.value === data?.ambitoId)?.label}}))
			
		};
		request(
			{
				
				baseURL: query.baseURL,
				endpoint: query.endpoint,
				method: query.method,
			},
			
			
			async (ok) => (processAmbitos(ok)),
			async (error) => ((console.log('GetAmbitos?ModulosId_error',error))),
			async () => (setAmbitos((o)=>({...o,loading:null}))),
		);
	},[data?.ambitoTipo]);
	//#endregion

	// Buscador
	useEffect(() => {
		if (ambitos.loading) return;
		if (ambitos.buscar === ambitos.buscado) return;
		const options = ambitos.data.filter((r) =>
			ambitos.buscar !== ""
				? r.label
						.toLocaleLowerCase()
						.includes(ambitos.buscar.toLocaleLowerCase())
				: true
		);
		setAmbitos((o) => ({ ...o, options, buscado: o.buscar }));
	}, [ambitos]);

	UseKeyPress(['Escape'], () => onClose());
	UseKeyPress(['Enter'], () => onClose(true), 'AltKey');
 
	return (
		<div>
			<Modal
			show
			onHide={() => onClose()}
			size="lg"
			centered
			>
				<Modal.Header className={modalCss.modalCabecera} closeButton><h3>{title}</h3></Modal.Header>
				<Modal.Body>
					<Grid col full gap="15px">
						<Grid width="full" gap="inherit">
							<Grid width="50%">
								<SearchSelectMaterial
									id="ambitoTipo"
									name="ambitoTipo"
									label="Ambitos"
									error={errors.ambitoTipo} 
									helperText={errors.ambitoTipo ?? ""}
									value={ambitosTipo.selected}
									disabled={disabled.ambitoTipo ?? false}
									onChange={(selected) => (
											setAmbitos((o) => ({ ...o, selected:{} })),
											setAmbitosTipo((o) => ({ ...o, selected })),
											onChange({ambitoTipo: selected.value}),
											onChange({ambitoId: 0})
										)									
									}
									options={ambitosTipo.options}
									required
								/>     
							</Grid>
							<Grid width="50%">
								<SearchSelectMaterial
									id="ambitoId"
									name="ambitoId"
									label="Cod. Ambito"
									error={errors.ambitoId} 
									helperText={errors.ambitoId ?? ambitos.loading ?? ""}
									value={ambitos.selected}
									disabled={disabled.ambitoId ?? ambitos.loading ?? data?.ambitoTipo == "T" ? true : false}
									onChange={(selected) =>
										(
											setAmbitos((o) => ({ ...o, selected })),
											onChange({ambitoId: selected.value})
										)
									}
									//defaultValue="Afilia"
									options={ambitos.options}
									onTextChange={( buscar ) =>
										setAmbitos((o) => ({ ...o, buscar }))
									}
									required
								/>     
							</Grid>
						</Grid>
					
					{!hide.deletedObs && (
						<Grid width gap="inherit" col>
							<Grid width gap="inherit">
								<Grid width="50%">
									<InputMaterial
										id="deletedDate"
										label="Fecha Baja"
										error={!!errors.deletedDate}
										helperText={errors.deletedDate ?? ""}
										value={data.deletedDate}
										disabled={disabled.deletedDate ?? false}
										onChange={(value, _id) => onChange({ deletedDate: value })}
									/>
								</Grid>
								<Grid width="50%">
									<InputMaterial
										id="deletedBy"
										label="Usuario Baja"
										error={!!errors.deletedBy}
										helperText={errors.deletedBy ?? ""}
										value={data.deletedBy}
										disabled={disabled.deletedBy ?? false}
										onChange={(value, _id) => onChange({ deletedBy: value })}
									/>
								</Grid>
							</Grid>
							<Grid width="full" gap="inherit">
								<InputMaterial 
									id="deletedObs"
									label="Observaciones Baja"
									error={!!errors.deletedObs}
									helperText={errors.deletedObs ?? ""}
									value={data.deletedObs}
									disabled={disabled.deletedObs ?? false}
									onChange={(value, _id) => onChange({ deletedObs: value })}
								/>
							</Grid>
						</Grid>
						)}
					</Grid>
			</Modal.Body>
			<Modal.Footer>
				<Button
					className="botonAzul"
					width={25}
					onClick={() => (
						setProcesando(true),
						onClose(true)
					)}
					disabled ={errors?.ambitoExiste || procesando}
					loading={procesando}
				>
					CONFIRMA
				</Button>

				<Button className="botonAmarillo" width={25} onClick={()=>onClose()}>
					CIERRA
				</Button>
			</Modal.Footer>
		</Modal>
		</div>
	);
};

export default UsuarioAmbitoForm;
