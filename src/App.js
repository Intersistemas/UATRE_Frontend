import React, { useContext } from 'react';
import './App.css';
import Login from './components/auth/Login';
import SideBar from './components/sidebar/sidebar'
import {Routes, Route, Navigate } from "react-router-dom";
import AuthContext from './store/authContext';
import InicioHandler from './components/pages/inicio/InicioHandler';
import  AfiliadosHandler from './components/pages/afiliados/AfiliadosHandler';
import SiaruHandler from './components/pages/siaru/SiaruHandler';
import EstablecimientosHandler from './components/pages/siaru/Establecimientos/EstablecimientosHandler';
import Afiliado from './components/pages/afiliados/Afiliado';
import LiquidacionesHandler from './components/pages/siaru/Liquidaciones/LiquidacionesHandler';
import LiquidacionesProcesarHandler from './components/pages/siaru/Liquidaciones/Procesar/LiquidacionesProcesarHandler';
import LiquidacionesProcesarExistenteHandler from './components/pages/siaru/Liquidaciones/Procesar/Existente/Handler';

const App = () => {
  const authContext = useContext(AuthContext); 
  const isLoggedIn = authContext.isLoggedIn;

  return (

    <div className="App">
     
        <Routes>
              {
                  !isLoggedIn 
                  && (<Route path="/*" element={<Login/>} />)
              }
        </Routes> 

        <SideBar>
          
          <Routes>
            <Route path="/inicio" element={<InicioHandler/>} />
            <Route path="/inicio" element={<InicioHandler/>} />
            <Route path="/afiliaciones" element={<AfiliadosHandler/>} />
            <Route path="/afiliaciones/:id" element={<Afiliado/>} />
						<Route path="/siaru" element={<SiaruHandler/>} />
						<Route path="/siaru/establecimientos" element={<EstablecimientosHandler/>} />
						<Route path="/siaru/liquidaciones" element={<LiquidacionesHandler/>} />
						<Route path="/siaru/liquidaciones/procesar" element={<LiquidacionesProcesarHandler/>} />
						<Route path="/siaru/liquidaciones/procesar/existente" element={<LiquidacionesProcesarExistenteHandler/>} />
            <Route path="/inicio" element={<InicioHandler />} />
            <Route path="/inicio" element={<InicioHandler  />} />
            <Route path="/inicio" element={<InicioHandler />} />
            <Route path="/inicio" element={<InicioHandler />} />
          </Routes>
         
        </SideBar>

    </div>

  );
}

export default App;
