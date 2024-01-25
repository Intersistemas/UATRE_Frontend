import React, { useContext } from 'react';
import './App.css';

import Login from './components/auth/Login';
import Registro from './components/auth/Registro';
import ConfirmaEmail from './components/auth/ConfirmaEmail';
import Contacto from './components/pages/contacto/Contacto';



import SideBar from './components/sidebar/sidebar'
import {Routes, Route, Navigate } from "react-router-dom";
import AuthContext from './store/authContext';

import InicioHandler from './components/pages/inicio/InicioHandler';

//---Siaru---
import SiaruHandler from './components/pages/siaru/SiaruHandler';
import LiquidacionesHandler from './components/pages/siaru/liquidaciones/LiquidacionesHandler';
import LiquidacionesProcesarHandler from './components/pages/siaru/liquidaciones/procesar/LiquidacionesProcesarHandler';
import LiquidacionesProcesarExistenteHandler from './components/pages/siaru/liquidaciones/procesar/existente/Handler';
import LiquidacionesProcesarArchivoHandler from './components/pages/siaru/liquidaciones/procesar/archivo/Handler';
import LiquidacionesProcesarManualHandler from './components/pages/siaru/liquidaciones/procesar/manual/Handler';

//---ADMINISTRACION---
import AdministracionHandler from './components/pages/administracion/AdministracionHandler';
import SeccionalesHandler from "./components/pages/administracion/seccionales/SeccionalesHandler";
import EmpresasHandler from "./components/pages/administracion/empresas/EmpresasHandler";
import AccesosHandler from "./components/pages/administracion/accesos/UsuariosHandler";


//---AFILIADOS---
import AfiliadosHandler from './components/pages/afiliados/AfiliadosHandler';
import Afiliado from './components/pages/afiliados/Afiliado';
import EstablecimientosHandler from './components/pages/siaru/establecimientos/EstablecimientosHandler';

import PantallaEnDesarrollo from './components/pages/pantallaEnDesarrollo/PantallaEnDesarrollo'

import fondo from './media/Background/color3.png';
import DelegacionesHandler from 'components/pages/administracion/delegaciones/DelegacionesHandler';
/*import "./components/fonts/SantanderLight.ttf";
import "./components/fonts/SantanderRegular.ttf";
import "./components/fonts/SantanderLogoRegular.ttf";*/


const App = () => {
  const authContext = useContext(AuthContext); 
  const isLoggedIn = authContext.isLoggedIn;

  return (

    <div className="App">
        
        <Routes>
        
              {
                  !isLoggedIn 
                  && (<Route path="/ingreso" element={<Login/>} />)
              }
              {
                  !isLoggedIn 
                  && (<Route path="/" element={<Login/>} />)
              }
              {
                  !isLoggedIn 
                  && (<Route path="/registro" element={<Registro/>} />)
              }
              {
                  !isLoggedIn 
                  && (<Route path="/confirmaEmail*" element={<ConfirmaEmail/>} />)
              }
              {
                  !isLoggedIn 
                  && (<Route path="/*" element={<PantallaEnDesarrollo/>} />)
              }
              {
                  !isLoggedIn 
                  && (<Route path="/contacto" element={<Contacto/>} />)
              }

        </Routes> 
        <img src={fondo} alt="fondo" class="bg-image" />
        {isLoggedIn &&
         (<SideBar>
            <Routes>
              <Route path="/" element={<InicioHandler/>} />
              <Route path="Inicio" element={<InicioHandler/>} />
              <Route path="Inicio/Afiliaciones" element={<AfiliadosHandler/>} />
              <Route path="Inicio/Afiliaciones/:id" element={<Afiliado/>} />
              <Route path="Inicio/Siaru" element={<SiaruHandler/>} />
              <Route path="Inicio/Siaru/Establecimientos" element={<EstablecimientosHandler/>} />
              <Route path="Inicio/Siaru/Liquidaciones" element={<LiquidacionesHandler/>} />
              <Route path="Inicio/Siaru/Liquidaciones/Procesar" element={<LiquidacionesProcesarHandler/>} />
              <Route path="Inicio/Siaru/Liquidaciones/Procesar/Existente" element={<LiquidacionesProcesarExistenteHandler/>} />
              <Route path="Inicio/Siaru/Liquidaciones/Procesar/Archivo" element={<LiquidacionesProcesarArchivoHandler/>} />
              <Route path="Inicio/Siaru/Liquidaciones/Procesar/Manual" element={<LiquidacionesProcesarManualHandler/>} />

              <Route path="Inicio/Administracion" element={<AdministracionHandler />}/>
              <Route path="Inicio/Administracion/Seccionales" element={<SeccionalesHandler />} />
              <Route path="Inicio/Administracion/Empresas" element={<EmpresasHandler />} />
              <Route path="Inicio/Administracion/Delegaciones" element={<DelegacionesHandler />} />
              <Route path="Inicio/Administracion/Accesos" element={<AccesosHandler />} />


              <Route path="/*" element={<PantallaEnDesarrollo/>} />
            </Routes>
         
        </SideBar>)}

    </div>

  );
}

export default App;
