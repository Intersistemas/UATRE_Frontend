import React, { useContext, useEffect, useState } from "react";
import "./App.css";

import Login from "./components/auth/Login";
import Registro from "./components/auth/Registro";
import ConfirmaEmail from "./components/auth/ConfirmaEmail";
import RecuperarClave from "./components/auth/RecuperarClave";
import Contacto from "./components/pages/contacto/Contacto";

import SideBar from "./components/sidebar/sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthContext from "./store/authContext";

import InicioHandler from "./components/pages/inicio/InicioHandler";

//---Siaru---
import SiaruHandler from "./components/pages/siaru/SiaruHandler";
import LiquidacionesHandler from "./components/pages/siaru/liquidaciones/LiquidacionesHandler";
import LiquidacionesProcesarHandler from "./components/pages/siaru/liquidaciones/procesar/LiquidacionesProcesarHandler";
import LiquidacionesProcesarExistenteHandler from "./components/pages/siaru/liquidaciones/procesar/existente/Handler";
import LiquidacionesProcesarArchivoHandler from "./components/pages/siaru/liquidaciones/procesar/archivo/Handler";
import LiquidacionesProcesarManualHandler from "./components/pages/siaru/liquidaciones/procesar/manual/Handler";
import ProcesosEntRecaudadorasHandler from "./components/pages/siaru/procesosEntRecaudadoras/ProcesosEntRecaudadorasHandler";

//---ADMINISTRACION---
import AdministracionHandler from "./components/pages/administracion/AdministracionHandler";
import SeccionalesHandler from "./components/pages/administracion/seccionales/SeccionalesHandler";
import EmpresasHandler from "./components/pages/administracion/empresas/EmpresasHandler";
import AccesosHandler from "./components/pages/administracion/accesos/UsuariosHandler";

//---ADMINISTRACION APP---
import AppHandler from "./components/pages/app/AppHandler";
import EncuestasHandler from "./components/pages/app/encuestas/EncuestasHandler";

//DENUNCIAS
import DenunciasHandler from "./components/pages/app/denuncias/DenunciasHandler";

//METRICA
import MetricaHandler from "./components/pages/app/metricas/MetricaHandler";

//---AFILIADOS---
import AfiliadosHandler from "./components/pages/afiliados/AfiliadosHandler";
import Afiliado from "./components/pages/afiliados/Afiliado";
import EstablecimientosHandler from "./components/pages/siaru/establecimientos/EstablecimientosHandler";

import PantallaEnDesarrollo from "./components/pages/pantallaEnDesarrollo/PantallaEnDesarrollo";

import fondo from "./media/Background/color3.png";
import DelegacionesHandler from "components/pages/administracion/delegaciones/DelegacionesHandler";
import LocalidadesHandler from "components/pages/administracion/localidades/LocalidadesHandler";
import InformesHandler from "components/pages/informes/InformesHandler";

import ConsultasHandler from "components/pages/consultas/ConsultasHandler";
import AfiliacionesPorEmpresaHandler from 'components/pages/consultas/afiliacionesPorEmpresa/AfiliacionesPorEmpresaHandler';
import GestionOspreraHandler from "components/pages/osprera/FormularioOspreraHandler";

import AuditoriasHandler from "components/pages/auditorias/AuditoriasHandler";

import TasasARCAHandler from "components/pages/administracion/tasasARCA/TasasARCAHandler";
import AnuncioModal from "components/pages/inicio/AnuncioModal";
import UsuarioPerfilHandler from "./components/pages/administracion/usuarioPerfil/usuarioPerfilHandler";
import DesvincularUsuarioEmpresasHandler from "components/pages/siaru/usuarioEmpresas/usuarioEmpresasHandler";
import { useSelector } from "react-redux";

/*import "./components/fonts/SantanderLight.ttf";
import "./components/fonts/SantanderRegular.ttf";
import "./components/fonts/SantanderLogoRegular.ttf";*/

const App = () => {
  const authContext = useContext(AuthContext);
  const isLoggedIn = authContext.isLoggedIn;
  const Usuario = authContext.usuario;
  const showUsuarioPerfilForm = useSelector((state) => state.usuarioPerfil.show);

  console.log("Usuario?.verAnuncio", Usuario?.verAnuncio);

  const [showModal, setShowModal] = useState(
    Usuario?.verAnuncio ? true : false
  );

  const handleShowModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    if (Usuario?.verAnuncio) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [Usuario?.verAnuncio]);

  return (
    <div className="App">
      <Routes>
        {!isLoggedIn && <Route path="/ingreso" element={<Login />} />}
        {!isLoggedIn && <Route path="/" element={<Login />} />}
        {!isLoggedIn && <Route path="/registro" element={<Registro />} />}
        {!isLoggedIn && (
          <Route path="/recuperarClave" element={<RecuperarClave />} />
        )}
        {!isLoggedIn && (
          <Route path="/confirmaEmail*" element={<ConfirmaEmail />} />
        )}
        {!isLoggedIn && <Route path="/*" element={<Login />} />}
        {!isLoggedIn && <Route path="/contacto" element={<Contacto />} />}
      </Routes>
      <img src={fondo} alt="fondo" class="bg-image" />
      {isLoggedIn && (
        <SideBar>
          <Routes>
            <Route path="/" element={<InicioHandler />} />
            <Route path="Inicio" element={<InicioHandler />} />
            <Route path="Inicio/Afiliaciones" element={<AfiliadosHandler />} />
            <Route path="Inicio/Afiliaciones/:id" element={<Afiliado />} />
            <Route path="Inicio/Empresas" element={<SiaruHandler />} />
            <Route
              path="Inicio/Empresas/Establecimientos"
              element={<EstablecimientosHandler />}
            />
            <Route
              path="Inicio/Empresas/Establecimientos/Liquidaciones"
              element={<LiquidacionesHandler />}
            />
            <Route
              path="Inicio/Empresas/Liquidaciones"
              element={<LiquidacionesHandler />}
            />
            <Route
              path="Inicio/Empresas/Liquidaciones/Procesar"
              element={<LiquidacionesProcesarHandler />}
            />
            <Route
              path="Inicio/Empresas/Liquidaciones/Procesar/Existente"
              element={<LiquidacionesProcesarExistenteHandler />}
            />
            <Route
              path="Inicio/Empresas/Liquidaciones/Procesar/Archivo"
              element={<LiquidacionesProcesarArchivoHandler />}
            />
            <Route
              path="Inicio/Empresas/Liquidaciones/Procesar/Manual"
              element={<LiquidacionesProcesarManualHandler />}
            />
            <Route
              path="Inicio/Empresas/Liquidaciones/Establecimientos"
              element={<EstablecimientosHandler />}
            />
            <Route
              path="Inicio/Empresas/Liquidaciones/Procesar/Establecimientos"
              element={<EstablecimientosHandler />}
            />
            <Route
              path="Inicio/Empresas/ProcesosEntRecaudadoras"
              element={<ProcesosEntRecaudadorasHandler />}
            />
            <Route
              path="Inicio/Empresas/DesvincularUsuarioEmpresa"
              element={<DesvincularUsuarioEmpresasHandler />}
            />
            <Route
              path="Inicio/UsuarioPerfil"
              element={<UsuarioPerfilHandler />}
            />

            <Route
              path="Inicio/Administracion"
              element={<AdministracionHandler />}
            />
            <Route
              path="Inicio/Administracion/Seccionales"
              element={<SeccionalesHandler />}
            />
            <Route
              path="Inicio/Administracion/Empresas"
              element={<EmpresasHandler />}
            />
            <Route
              path="Inicio/Administracion/Delegaciones"
              element={<DelegacionesHandler />}
            />
            <Route
              path="Inicio/Administracion/Accesos"
              element={<AccesosHandler />}
            />
            <Route
              path="Inicio/Administracion/Localidades"
              element={<LocalidadesHandler />}
            />
            <Route
              path="Inicio/Administracion/Tasas"
              element={<TasasARCAHandler />}
            />

            <Route path="Inicio/Informes" element={<InformesHandler />} />

            <Route path="Inicio/Consultas" element={<ConsultasHandler />} />
            <Route
              path="Inicio/Consultas/Afiliaciones"
              element={<AfiliacionesPorEmpresaHandler />}
            />

            <Route path="Inicio/Auditorias" element={<AuditoriasHandler />} />

            <Route
              path="Inicio/GestionOsprera"
              element={<GestionOspreraHandler />}
            />

            <Route path="Inicio/App" element={<AppHandler />} />
            <Route path="Inicio/App/Encuestas" element={<EncuestasHandler />} />
            <Route
              path="Inicio/App/EncuestaRespuestas"
              element={<EncuestasHandler />}
            />
            <Route path="Inicio/App/Denuncias" element={<DenunciasHandler />} />
            <Route path="Inicio/App/Metrica" element={<MetricaHandler />} />

            <Route path="/*" element={<PantallaEnDesarrollo />} />
          </Routes>
        </SideBar>
      )}
      {isLoggedIn && showModal && (
        <AnuncioModal onClose={() => handleShowModal()} />
      )}
      {showUsuarioPerfilForm && <UsuarioPerfilHandler />}
    </div>
  );
};

export default App;