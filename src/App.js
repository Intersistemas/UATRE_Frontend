import React, { useContext, useState } from 'react';
import './App.css';
import Login from './components/auth/Login';
import SideBar from './components/sidebar/sidebar'
import { Routes, Route, Navigate } from "react-router-dom";
import AuthContext from './store/authContext';
import Inicio from './components/pages/inicio/Inicio';
import InicioHandler from './components/pages/inicio/InicioHandler';
import  AfiliadosHandler from './components/pages/afiliados/AfiliadosHandler';

const App = () => {
  const authContext = useContext(AuthContext); 
  const isLoggedIn = authContext.isLoggedIn;
  const usuario = authContext.usuario;

  //console.log('app.js- -Logeado?',isLoggedIn)
 //const [arrayBotones, setArrayBotones] = useState([]);

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
          <Route path="/inicio" element={<InicioHandler />} />
          <Route path="/inicio" element={<InicioHandler />} />
          <Route path="/inicio" element={<InicioHandler />} />
          <Route path="/inicio" element={<InicioHandler />} />
      </Routes>

       </SideBar>
  
    </div>
  );
}

export default App;
