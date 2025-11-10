import React, { useEffect, useState, useCallback, useMemo, useContext } from "react";
import Formato from "components/helpers/Formato";
import Grid from "components/ui/Grid/Grid";
import IM from "components/ui/Input/InputMaterial";
import styles from "./DenunciaDetails.module.css";
import useHttp from "components/hooks/useHttp";
import AuthContext from "store/authContext";
import useTareasUsuario from "components/hooks/useTareasUsuario";

const InputMaterial = (p) => <IM variant="standard" size="small" {...p} />;

const DenunciaDetails = (props) => {
    const config = props.config;
    const data = useMemo(() => config.data ?? {}, [config.data]);
    const tab = config.tab ?? 0;
    const [hotField, setHotField] = useState();
    const [derivacionInfo, setDerivacionInfo] = useState(null);
    const [delegacionInfo, setDelegacionInfo] = useState(null);
    const { sendRequest } = useHttp();

    // Context y hooks para permisos
    const { usuario } = useContext(AuthContext);
    const tareasManager = useTareasUsuario();

  // Verificar si el usuario puede ver todos los datos
  const puedeVerTodosLosDatos = useMemo(() => {
    if (!usuario) {
      console.log(" Sin usuario - permisos denegados para detalles");
      return false;
    }
    
    // Verificar si es Administrador
    const esAdministrador = usuario.roles?.includes("Administrador");
    
    // Verificar si tiene la tarea "Denuncias_Datos"
    const tieneTareaDenunciasDatos = tareasManager.hasTarea("Denuncias_Datos");
    
    const resultado = esAdministrador || tieneTareaDenunciasDatos;
    
    console.log(" Verificación de permisos para detalles (ACTUALIZADA):", {
      timestamp: new Date().toLocaleTimeString(),
      esAdministrador,
      tieneTareaDenunciasDatos,
      puedeVerTodos: resultado,
      usuarioRoles: usuario.roles,
      tareasUsuario: usuario.modulosTareas?.map(t => t.nombreTarea),
      usuarioId: usuario.id || usuario.userId,
      cambioDetectado: "Recalcular permisos para detalles"
    });
    
    return resultado;
  }, [usuario, tareasManager]);    const _ = require('lodash');
 
    const validar = useCallback((value) =>{
        if (value === "Empresa no existente") return "EMPRESA NO REGISTRADA";
        if (!value) return "";
        if (_.includes(value, "-") && _.includes(value, ":")) {
            return Formato.Fecha(value);
        }
        if (_.isString(value)){
            if (value.trim() === "") {
                return " ";
            } else return value;
        } 
        return value;
    }, [_]);

    const fetchDerivacionInfo = useCallback(async (derivadoAId) => {
        if (!derivadoAId) {
            setDerivacionInfo(null);
            return;
        }

        try {
            // Usamos RefLocalidadId con mayúscula inicial para mantener consistencia con otros usos en el proyecto
            await sendRequest(
                {
                    baseURL: "Afiliaciones",
                    method: "GET",
                    endpoint: `/SeccionalLocalidad/GetSeccionalLocalidadByRefLocalidadId?RefLocalidadId=${derivadoAId}&SoloActivos=true`,
                },
                (response) => {
                    if (Array.isArray(response) && response.length > 0) {
                        setDerivacionInfo(response[0]);
                    } else {
                        setDerivacionInfo(null);
                    }
                },
                (error) => {
                    setDerivacionInfo(null);
                }
            );
        } catch (error) {
            setDerivacionInfo(null);
        }
    }, [sendRequest]);

    const fetchDelegacionInfo = useCallback(async (delegacionId) => {
        if (!delegacionId) {
            setDelegacionInfo(null);
            return;
        }

        try {
            await sendRequest(
                {
                    baseURL: "Comunes",
                    method: "GET",
                    endpoint: `/RefDelegacion/GetById?Id=${delegacionId}`,
                },
                (response) => {
                    if (response && response.nombre) {
                        setDelegacionInfo(response);
                    } else {
                        setDelegacionInfo(null);
                    }
                },
                (error) => {
                    console.error("Error al obtener información de delegación:", error);
                    setDelegacionInfo(null);
                }
            );
        } catch (error) {
            console.error("Error al obtener información de delegación:", error);
            setDelegacionInfo(null);
        }
    }, [sendRequest]);

    useEffect(() => {
        if (tab === "denuncia" && data.derivadoAId && data.derivadoATipo) {
            // Normalizamos el tipo para comparar sin tildes/diacríticos
            const tipoDerivacionRaw = data.derivadoATipo ?? "";
            const tipoDerivacion = tipoDerivacionRaw
                .toString()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();

            if (tipoDerivacion === "delegacion") {
                fetchDelegacionInfo(data.derivadoAId);
                setDerivacionInfo(null);
            } else if (tipoDerivacion === "seccional") {
                fetchDerivacionInfo(data.derivadoAId);
                setDelegacionInfo(null);
            } else {
                setDerivacionInfo(null);
                setDelegacionInfo(null);
            }
        } else {
            setDerivacionInfo(null);
            setDelegacionInfo(null);
        }
    }, [data.derivadoAId, data.derivadoATipo, tab, fetchDerivacionInfo, fetchDelegacionInfo]);

    const getDerivacionDescripcion = useCallback(() => {
        // Normalizamos el tipo para comparar sin tildes/diacríticos (p.ej. "delegación" -> "delegacion")
        const tipoDerivacionRaw = data.derivadoATipo ?? "";
        const tipoDerivacion = tipoDerivacionRaw
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

        if (tipoDerivacion === "delegacion") {
            if (delegacionInfo && delegacionInfo.nombre) {
                return delegacionInfo.nombre;
            } else {
                return validar(data.derivadoAId);
            }
        } else if (tipoDerivacion === "seccional") {
            if (derivacionInfo) {
                return derivacionInfo.seccionalDescripcion || 'Seccional no disponible';
            } else {
                return validar(data.derivadoAId);
            }
        } else {
            // Tipo no reconocido, mostrar el ID original
            return validar(data.derivadoAId);
        }
    }, [derivacionInfo, delegacionInfo, data.derivadoAId, data.derivadoATipo, validar]);

    useEffect(() => {
        switch (tab) {
            case `denuncia`:
                setHotField(
                    <Grid className={`${styles.fondo} ${styles.grupo}`} col>
                        <Grid className={`${styles.contenido} ${styles.titulo}`} gap="1rem">
                            <Grid>Información Detallada de la Denuncia:</Grid>
                        </Grid>
                        
                        {puedeVerTodosLosDatos ? (
                            // USUARIOS CON PERMISOS COMPLETOS (Administrador o Denuncias_Datos)
                            // Detalles: empresa, cuit, ubicación, detalle de la denuncia, derivación
                            // (teléfono y provincia ahora están en la tabla principal)
                            <>
                                <Grid className={styles.grupo} col full>
                                    <Grid className={styles.contenido} col>
                                        <Grid className={styles.titulo}>Información de la Empresa:</Grid>
                                        <Grid width>
                                            <Grid grow><InputMaterial label="Empresa" value={validar(data.empleadorNombre)}/></Grid>
                                            <Grid grow><InputMaterial label="CUIT" value={Formato.Cuit(data.empleadorCUIT) ?? validar(data.empleadorCUIT)} /></Grid>
                                        </Grid>
                                        <Grid width>
                                            <Grid grow><InputMaterial label="Ubicación" value={validar(data.ubicacion)}/></Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid className={styles.grupo} col full>
                                    <Grid className={styles.contenido} col>
                                        <Grid className={styles.titulo}>Detalle de la Denuncia:</Grid>
                                        <Grid>
                                            <Grid grow><InputMaterial label="Detalle de la Denuncia" value={validar(data.texto)} multiline /></Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid className={styles.grupo} col full>
                                    <Grid className={styles.contenido} col>
                                        <Grid className={styles.titulo}>Derivación:</Grid>
                                        <Grid width>
                                            <Grid grow><InputMaterial label="Derivado A Tipo" value={validar(data.derivadoATipo)}/></Grid>
                                            <Grid grow><InputMaterial label="Derivado A" value={getDerivacionDescripcion()}/></Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </>
                        ) : (
                            // USUARIOS CON PERMISOS LIMITADOS (sin rol Administrador ni tarea Denuncias_Datos)
                            // Detalles: detalle de la denuncia, nombre de la empresa, cuit, ubicación
                            // (teléfono ahora está en la tabla principal)
                            <>
                                <Grid className={styles.grupo} col full>
                                    <Grid className={styles.contenido} col>
                                        <Grid className={styles.titulo}>Detalle de la Denuncia:</Grid>
                                        <Grid>
                                            <Grid grow><InputMaterial label="Detalle de la Denuncia" value={validar(data.texto)} multiline /></Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>

                                <Grid className={styles.grupo} col full>
                                    <Grid className={styles.contenido} col>
                                        <Grid className={styles.titulo}>Información de la Empresa:</Grid>
                                        <Grid width>
                                            <Grid grow><InputMaterial label="Nombre de la Empresa" value={validar(data.empleadorNombre)}/></Grid>
                                            <Grid grow><InputMaterial label="CUIT" value={Formato.Cuit(data.empleadorCUIT) ?? validar(data.empleadorCUIT)} /></Grid>
                                        </Grid>
                                        <Grid width>
                                            <Grid grow><InputMaterial label="Ubicación" value={validar(data.ubicacion)}/></Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </>
                        )}
                    </Grid>
                );
                break;
            default:
                setHotField();
                break;
        }
    }, [config, data, tab, validar, getDerivacionDescripcion, puedeVerTodosLosDatos]);

    return <>{hotField}</>;
};

export default DenunciaDetails;
