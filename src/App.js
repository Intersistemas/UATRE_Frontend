import React, { useContext } from 'react';
import './App.css';
import Login from './components/auth/login';
import SideBar from './components/sidebar/sidebar'
import { Routes, Route, Navigate } from "react-router-dom";
import AuthContext from './store/authContext';
import Home from './components/pages/home'

const App = () => {
  const authContext = useContext(AuthContext); 
  const isLoggedIn = authContext.isLoggedIn;
  const usuario = authContext.usuario;

  console.log('app.js- -Logeado?',isLoggedIn)
  console.log('usuario: ',usuario);
  
  return (
    <div className="App">
       <SideBar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </SideBar>
        
       <Routes>
            {
                !isLoggedIn 
                && (<Route path="/*" element={<Login/>} />)
            }

            {/* <Route path='*' element={<Navigate to='/login' replace />} /> */}

        </Routes>   
    </div>
  );
}

export default App;
