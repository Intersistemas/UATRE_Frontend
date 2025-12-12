
import React, { useEffect, useState } from "react";
import Table from "components/ui/Table/Table";
import useHttp from "../../../../hooks/useHttp";

const TareaTable = ({ columns: columnsInit = [], ...x }) => {
    const cs = {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
    };

    const [ambitosData, setAmbitosData] = useState({});
    const [loading, setLoading] = useState(true); // Estado para controlar la carga
    const [completedQueries, setCompletedQueries] = useState(0); // Contador de peticiones completadas
    const { sendRequest } = useHttp();

    useEffect(() => {
        const fetchAmbitos = async () => {
            const queries = [
                {
                    baseURL: "Afiliaciones",
                    endpoint: "/Seccional?SoloActivos=true&verSeccionalesLocalidades=false",
                    method: "GET",
                    type: "seccional",
                },
                {
                    baseURL: "Comunes",
                    endpoint: "/RefDelegacion/GetAll",
                    method: "GET",
                    type: "delegacion",
                },
                {
                    baseURL: "Afiliaciones",
                    endpoint: "/Provincia",
                    method: "GET",
                    type: "provincia",
                },
            ];

            // Resetear contador al iniciar
            setCompletedQueries(0);
            setAmbitosData({});

            queries.forEach((query) => {
                sendRequest(
                    query,
                    (response) => {
                        console.log(`Response ${query.type}`, response);

                        let newData = {};

                        if (query.type === "seccional") {
                            newData = response.reduce((acc, ambito) => {
                                const key = `seccional_${ambito.id}`;
                                acc[key] = {
                                    seccionalesId: ambito.id,
                                    descripcion: ambito.descripcion,	
                                };
                                return acc;
                            }, {});
                        }

                        if (query.type === "delegacion") {
                            newData = response.reduce((acc, ambito) => {
                                const key = `delegacion_${ambito.id}`;
                                acc[key] = {
                                    refDelegacionId: ambito.id,
                                    refDelegacionDescripcion: ambito.nombre,
                                };
                                return acc;
                            }, {});
                        }

                        if (query.type === "provincia") {
                            newData = response.reduce((acc, ambito) => {
                                const key = `provincia_${ambito.id}`;
                                acc[key] = {
                                    provinciaId: ambito.id,
                                    provinciaDescripcion: ambito.nombre,
                                };
                                return acc;
                            }, {});
                        }

                        setAmbitosData((prev) => {
                            const merged = {
                                ...prev,
                                ...newData,
                            };
                            console.log(`Merged ambitosData for ${query.type}:`, merged);
                            return merged;
                        });

                        // Incrementar contador y verificar si todas las peticiones han terminado
                        setCompletedQueries((prev) => {
                            const newCount = prev + 1;
                            if (newCount >= queries.length) {
                                setLoading(false);
                            }
                            return newCount;
                        });
                    },
                    (error) => {
                        console.error(`Error al obtener ${query.type}:`, error);
                        
                        // Incrementar contador incluso si hay errores
                        setCompletedQueries((prev) => {
                            const newCount = prev + 1;
                            if (newCount >= queries.length) {
                                setLoading(false);
                            }
                            return newCount;
                        });
                    }
                );
            });
        };

        fetchAmbitos();
    }, [sendRequest]);

	//ver todos los datos de ambitosData
	console.log("Ambitos Data:", ambitosData);

    const columns = [
        {
            dataField: "usuarioId",
            text: "Id",
            hidden: true,
        },
        {
            dataField: "ambitoTipo",
            text: "Ámbito",
            headerStyle: { width: "100px" },
            style: cs,
            formatter: (v) => {
                switch (v) {
                    case "S": return "Seccional";
                    case "P": return "Provincia";
                    case "D": return "Delegación";
                    case "T": return "Todos";
                    default: return v;
                }
            },
        },
        {
            dataField: "ambitoId",
            text: "Nombre. Ámbito",
            headerStyle: { width: "100px" },
            style: cs,
            formatter: (ambitoId) => {
                console.log('Buscando ambitoId:', ambitoId);
                console.log('ambitosData disponible:', ambitosData);
                
                const ambito = Object.values(ambitosData).find(
                    (a) =>
                        a.seccionalesId === ambitoId ||
                        a.refDelegacionId === ambitoId ||
                        a.provinciaId === ambitoId
                );

                console.log('Ambito encontrado:', ambito);

                if (ambito) {
                    if (ambito?.seccionalesId === ambitoId) {
                        console.log('Retornando descripción seccional:', ambito?.descripcion);
                        return `${ambito?.descripcion}`;
                    } else if (ambito?.refDelegacionId === ambitoId) {
                        console.log('Retornando descripción delegación:', ambito?.refDelegacionDescripcion);
                        return `${ambito?.refDelegacionDescripcion}`;
                    } else if (ambito?.provinciaId === ambitoId) {
                        console.log('Retornando descripción provincia:', ambito?.provinciaDescripcion);
                        return `${ambito?.provinciaDescripcion}`;
                    }
                }

                console.log('No se encontró descripción, retornando ID:', ambitoId);
                return ambitoId;
            },
        },
    ];

    // Mostrar un mensaje de carga mientras se obtienen los datos
    if (loading) {
        return <div>Cargando datos...</div>;
    }

    return <Table keyField="id" columns={columns} {...x} />;
};

export default TareaTable;