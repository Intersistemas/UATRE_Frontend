import React, { useState, useContext } from 'react';

import {
    FaTh,
    FaBars,
    FaUserAlt,
    FaRegChartBar,
    FaCommentAlt,
    FaShoppingBag,
    FaThList,
    FaRegUser
}from "react-icons/fa";
import { BsFillXCircleFill } from "react-icons/bs";
import { NavLink } from 'react-router-dom';
import AuthContext from '../../store/authContext';
import "./sidebar.css";
import logo from '../../media/Logo1_sidebar.png';
import { Routes, Route, Navigate } from "react-router-dom";
import Inicio from '../../components/pages/inicio/Inicio';
import InicioHandler from '../../components/pages/inicio/InicioHandler';
import  AfiliadosHandler from '../../components/pages/afiliados/AfiliadosHandler';


const Sidebar = ({children}) => {

    console.log('children',children);
    console.log('children',{children});

    console.log('href:',window.location.pathname)
    const authContext = useContext(AuthContext)
    console.log('authContext-SideBar',authContext)
    const logoutHandler = authContext.logout;
    const isLoggedIn = authContext.isLoggedIn;
    const CUIT = authContext.usuario
   // const logoutHandler = authContext.logout; //se usuario si quieren agregar una X para salir al navVar


    const[isOpen ,setIsOpen] = useState(false);
    const toggle = () => setIsOpen (!isOpen);
    const menuItem=[
        {
            path:"/inicio",
            name:"Inicio",
            icon:<FaTh/>
        }
    ]

    return (
        <>     
        {console.log('SideBar')}
        {isLoggedIn && (
        <div className="container">
           <div style={{width: isOpen ? "200px" : "50px"}} className="sidebar">
                <div className="sidebar-opciones">
                    <div className="top_section">
                        <h1 style={{display: isOpen ? "block" : "none"}} className="logo">
                            <img src={logo} width="70" height="70" onClick={toggle}/>
                        </h1>
                        <div  style={{display: !isOpen ? "block" : "none", marginLeft: isOpen ? "50px" : "0px"}} className="bars">
                            <FaBars onClick={toggle}/>
                            
                        </div>
                        
                    </div>
                    
                    {
                        menuItem.map((item, index)=>(
                            <NavLink to={item.path} key={index} className="link" activeclassName="active">
                                <div className="icon">{item.icon}</div>
                                <div style={{display: isOpen ? "block" : "none"}} className="link_text">{item.name}</div>
                            </NavLink>
                        ))
                    }
                    <div>
                        <NavLink to="/login" className="link" activeclassName="active" onClick={logoutHandler}>
                            <div onClick={logoutHandler} className="icon"><BsFillXCircleFill/></div>
                            {(isOpen && <div onClick={logoutHandler} className="link_text">Cerrar Sesión</div>)}
                        </NavLink>
                    </div>

                    <div>
                        <div className="icon"><FaRegUser/></div>
                        {(isOpen && <div className="link_text">{CUIT}</div>)}
                    </div>
                </div>
           </div>

            
           <main>{children}</main>
           
        </div>
        )}
     </>
    )
    ;
};

export default Sidebar;