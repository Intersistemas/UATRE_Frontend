

import React, { useCallback, useEffect, useState, useContext } from "react";
import PreguntasTable from "./PreguntasTable";
//.............................................................>
import dayjs from "dayjs";
import useQueryQueue from "components/hooks/useQueryQueue";
import AuthContext from "store/authContext";
import PreguntasForm from "./PreguntasForm";
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::>


const usePreguntas = () => {
	

	// Definición inicial de la selección
		const selectionDef = {
		
			edit: null, // Indica si hay una encuesta en edición
            request: "", // Tipo de solicitud (A = Crear)
            action: "",  // Acción a mostrar en el formulario
            errors: null, // Errores de validación
			index: null,
			record: null,

		};


		//::::::::::::::::::::::::::::::::::::>
		const Usuario = useContext(AuthContext).usuario;
		const pushQuery = useQueryQueue();
//::::::::::::::::::::::::::::::::::::::::::::::>	
  //# Declaración de estados y carga de datos
  const [list, setList] = useState({
    loading: null,
    params: {},
    cargos: [],  
    data: [],
    error: null,
    selection: { ...selectionDef },
  });




  
  //# Manejo de cambios
  const requestChanges = useCallback((type, payload = {}) => {
    console.log("Datos usePreguntas Data -> ", payload.data);	
		

    switch (type) {
      case "selected": {
        return setList((o) => ({
          ...o,
          selection: {
            ...o.selection,
            request: payload.request,
            action: payload.action,

          },
        }));
      }
      case "list": {
        if (payload.clear) {
          return setList((o) => ({
            ...o,
            loading: null,
            data: payload.data,
            error: null,
            selection: { ...selectionDef },
          }));
        }
        return setList((o) => ({
          ...o,
          loading: "Cargando...",
          params: { ...payload.params },
          data: payload.data,
        }));
      }
	 
      default:
        return;

		
    } 

  }, []);


  useEffect(()=> {

	console.log("list_usePreguntas de USE_PREGUNTAS:",list.params)
		},[list.params]
	)


	  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::>
      // Función para iniciar la creación de una nueva encuesta
	  const crearEncuesta = () => {
        setList((prev) => ({
            ...prev,
            selection: {
                ...prev.selection,
                request: "A", // A de "Agregar"
                action: "Agregar Pregunta",
                edit: {
                    fechaCreacion: dayjs().format("DD-MM-YYYY"),
                    creadoPor: Usuario.nombre,
                    tipoPregunta: "",
                    enunciado: "",
                },
                errors: null,
            },
        }));
    };
	//::::::::::::::::::::::::::::::::::::::::::::::::::::::::>


//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::>
const enviarEncuesta = () => {
	if (!list.selection.edit.tipoPregunta) {
		setList((prev) => ({
			...prev,
			selection: {
				...prev.selection,
				errors: { tipoPregunta: "El tipoPregunta es obligatorio" },
			},
		}));
		return;
	}

	pushQuery({
		action: "Create",
		config: {
			baseURL: "App",
			endpoint: `/Encuestas`,
			method: "POST",
			body: list.selection.edit,
		},
		onOk: async (response) => {
			console.log("Encuesta creada con éxito:", response);
			setList((prev) => ({
				...prev,
				selection: { ...prev.selection, edit: null }, // Cierra el formulario
			}));
		},
		onError: async (error) => alert("Error al crear la encuesta: " + error.message),
	});
};

// Definir el formulario si se está creando una nueva encuesta
let form = null;
if (list.selection.edit) {
	form = (
		<PreguntasForm
			request={list.selection.request}
			data={list.selection.edit}
			title={list.selection.action}
			errors={list.selection.errors}
			loading={false}
			onChange={(edit) => {
				setList((prev) => ({
					...prev,
					selection: { ...prev.selection, edit },
				}));
			}}
			onClose={() => {
				setList((prev) => ({
					...prev,
					selection: { ...prev.selection, edit: null }, // Cierra el formulario
				}));
			}}
			onSave={enviarEncuesta} // Guarda la encuesta en la API
		/>
	);
}

//::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::>



//>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>------------------<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
//#Preguntas Renderizado
const render = () => {
	const hasData = list.data && list.data.length > 0;
  
	return (
	  <div>
		{/* Validación para mostrar la tabla principal */}
		{hasData ? (
			<>
		  <PreguntasTable
			data={list.data}
			loading={!!list.loading}
			noDataIndication={
			  list.loading ?? list.error?.message ?? "No existen datos para mostrar"
			}
			pagination={{
			  ...list.pagination,
			  onChange: ({ index, size }) =>
				setList((o) => ({
				  ...o,
				  loading: "Cargando...",
				  pagination: { index, size },
				  data: [],
				})),
			}}
			selection={{
			  selected: [list.selection.record?.id].filter((r) => r),
			  onSelect: (record, isSelect, index, e) =>
				setList((o) => ({
				  ...o,
				  selection: {
					...selectionDef,
					index,
					record,
				  },
				})),
			}}

			
		  />

		  {/* //::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::> */}
		  <div>
         {/* <button onClick={crearEncuesta} style={{ marginBottom: "10px" }}>
		 		Agregar Pregunta
         </button> */}
         {form} {/* Renderiza el formulario cuando `list.selection.edit` no es null */}
        </div>
		  {/* //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::> */}
		  </>
		) : (
		  <p style={{ textAlign: "center", color: "gray" }}>
			No hay datos disponibles para mostrar.
		  </p>
		)}
  
		{/* Tabla detalles */}
		{hasData && list.selection.record && (
		  <div style={{ marginTop: "20px" }}>
			<h3 style={{ textAlign: "center", marginBottom: "10px" }}>
			  Detalles de la pregunta seleccionada
			</h3>
  
			{/* Validación para mostrar detalles */}
			{list.selection.record.detalles &&
			list.selection.record.detalles.length > 0 ? (
			  <table
				style={{
				  width: "100%",
				  borderCollapse: "collapse",
				  marginTop: "10px",
				}}
			  >
				<tbody>
				  {list.selection.record.detalles.map((detalle, index) => (
					<tr key={index}>
					  <td
						style={{
						  border: "1px solid rgb(53, 149, 210)",
						  padding: "3px",
						  textAlign: "center",
						  backgroundColor: "#f2f2f2",
						}}
					  >
						{/* <text style={{fontWeight: "bold"}}>{detalle.texto ? detalle.texto : "Sin dato"}</text> */}
						{detalle.texto ? detalle.texto : "Sin dato"}
					  </td>
					</tr>
				  ))}
				</tbody>
			  </table>
			) : (
			  <p style={{ textAlign: "center", color: "red" }}>
				No hay detalles disponibles para esta selección.
			  </p>
			)}
		  </div>
		)}
	  </div>
	);
  };
  
  

  return [render, requestChanges, list.selection.record];
};

export default usePreguntas;




//------------------------------------------------------------------------------------------------>
//------------------------------------------------------------------------------------------------>









//     return {
//         render: () => (
//             <div>
//                 <button onClick={crearEncuesta} style={{ marginBottom: "10px" }}>
//                     Crear Nueva Encuesta
//                 </button>
//                 {form} {/* Renderiza el formulario cuando `list.selection.edit` no es null */}
//             </div>
//         ),
//     };
// };
