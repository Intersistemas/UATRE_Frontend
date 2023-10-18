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

//---SIARU---
import SiaruHandler from './components/pages/siaru/SiaruHandler';
import LiquidacionesHandler from './components/pages/siaru/Liquidaciones/LiquidacionesHandler';
import LiquidacionesProcesarHandler from './components/pages/siaru/Liquidaciones/Procesar/LiquidacionesProcesarHandler';
import LiquidacionesProcesarExistenteHandler from './components/pages/siaru/Liquidaciones/Procesar/Existente/Handler';
import LiquidacionesProcesarArchivoHandler from './components/pages/siaru/Liquidaciones/Procesar/Archivo/Handler';
import LiquidacionesProcesarManualHandler from './components/pages/siaru/Liquidaciones/Procesar/Manual/Handler';

//---ADMINISTRACION---
import AdministracionHandler from './components/pages/administracion/AdministracionHandler';
import SeccionalesHandler from "./components/pages/seccionales/SeccionalesHandler";
import EmpresasHandler from "./components/pages/empresas/EmpresasHandler";


//---AFILIADOS---
import AfiliadosHandler from './components/pages/afiliados/AfiliadosHandler';
import Afiliado from './components/pages/afiliados/Afiliado';
import EstablecimientosHandler from './components/pages/siaru/Establecimientos/EstablecimientosHandler';

import PantallaEnDesarrollo from './components/pages/pantallaEnDesarrollo/PantallaEnDesarrollo'

import fondo from './media/Background/color3.png';
import DelegacionesHandler from 'components/pages/delegaciones/DelegacionesHandler';
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
              <Route path="inicio" element={<InicioHandler/>} />
              <Route path="inicio/afiliaciones" element={<AfiliadosHandler/>} />
              <Route path="inicio/afiliaciones/:id" element={<Afiliado/>} />
              <Route path="inicio/siaru" element={<SiaruHandler/>} />
              <Route path="inicio/siaru/establecimientos" element={<EstablecimientosHandler/>} />
              <Route path="inicio/siaru/liquidaciones" element={<LiquidacionesHandler/>} />
              <Route path="inicio/siaru/liquidaciones/procesar" element={<LiquidacionesProcesarHandler/>} />
              <Route path="inicio/siaru/liquidaciones/procesar/existente" element={<LiquidacionesProcesarExistenteHandler/>} />
              <Route path="inicio/siaru/liquidaciones/procesar/archivo" element={<LiquidacionesProcesarArchivoHandler/>} />
              <Route path="inicio/siaru/liquidaciones/procesar/manual" element={<LiquidacionesProcesarManualHandler/>} />

              <Route path="inicio/administracion" element={<AdministracionHandler />}/>
              <Route path="inicio/administracion/seccionales" element={<SeccionalesHandler />} />
              <Route path="inicio/administracion/empresas" element={<EmpresasHandler />} />
              <Route path="inicio/administracion/delegaciones" element={<DelegacionesHandler />} />

              <Route path="/*" element={<PantallaEnDesarrollo/>} />
            </Routes>
         
        </SideBar>)}

    </div>

  );
}

export default App;
