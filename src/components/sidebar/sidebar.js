import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux'
import {
    FaTh,FaBars,FaRegUser, FaChevronRight
}from "react-icons/fa";
import { BsFillXCircleFill } from "react-icons/bs";
import { Link, NavLink } from 'react-router-dom';
import AuthContext from '../../store/authContext';
import logo from '../../media/Logo1_sidebar.png';
import { useDispatch } from "react-redux";
import store from '../../redux/store';
import Button from '../ui/Button/Button';
import clases from "./sidebar.module.css";
import { handleModuloEjecutarAccion } from '../../redux/actions';
import fondo from '../../media/Background/color3.png';


const Sidebar = ({children}) => {

    const  moduloActual = useSelector(state => state.modulo)
    
    const dispatch = useDispatch();  //Ver acciones a pasar

    const authContext = useContext(AuthContext)
    const logoutHandler = authContext.logout;
    const isLoggedIn = authContext.isLoggedIn;
    const Usuario = authContext.usuario;

    const[botones ,setBotones] = useState([]);

    const[isOpen ,setIsOpen] = useState(true);
    const toggle = () => setIsOpen (!isOpen);
    const menuItem=[
        {
            path:"/inicio",
            name:"Inicio",
            icon:<FaTh/>
        }
    ]

    useEffect(() => {
                let array = [];

                if (moduloActual.nombre === "Afiliados") {
                    array = moduloActual.acciones;
                };

                if (moduloActual.nombre === "SIARU") {
                    array = moduloActual.acciones;
                };

                if (moduloActual.nombre === "Pagos") {
                    array = moduloActual.acciones;
                };
                setBotones(array);
    },[moduloActual])

    //Despacho/actualizo el estado global de acciones, el componente que creo las acciones capturará el estado y sabrá qué hacer
    const despacharAcciones = (accion)=>{
        dispatch(handleModuloEjecutarAccion(accion));
    }

    return (
        <>     
        {isLoggedIn && (
        <div className={clases.container}>
           <div style={{width: isOpen ? "200px" : "50px"}} className={clases.sidebar}>
                <div className={clases.sidebar_opciones}>
                    <div className={clases.top_section}>
                        <h1 style={{display: isOpen ? "block" : "none"}} className={clases.logo}>
                            <img src={logo} width="70" height="70" onClick={toggle}/>
                            <a> UATRE</a>
                        </h1>
                        <div  style={{display: !isOpen ? "block" : "none", marginLeft: isOpen ? "50px" : "0px"}} className={clases.bars}>
                            <FaBars onClick={toggle}/>
                        </div> 

                         <div>
                            <div className={clases.icon}><FaRegUser/></div>
                        </div>
                            {(isOpen && <div> <div className={clases.link_text}>{Usuario.cuit}</div> <p>{Usuario.nombre}</p></div>)}
                    </div>
                        {/*
                        menuItem.map((item, index)=>(
                            <NavLink to={item.path} key={index} className={clases.link} activeClassName={clases.active}>
                                <div className={clases.icon}>{item.icon}</div>
                                <div style={{display: isOpen ? "block" : "none"}} className={clases.link_text}>{item.name}</div>
                            </NavLink>
                        ))
                        */}

                        <div>
                        { botones.length === 0 ? null :
                            botones.map((item, index)=>(
                            
                            <div className={clases.actionButtons}>
                               
                                <FaChevronRight/>
                                
                                <Button key={index} onClick={ () => despacharAcciones(item.nombre)}> 
                                    {(isOpen && <div onClick={ () => despacharAcciones(item.nombre)}>{item.nombre}</div>)}
                                </Button>
                            </div>
                            ))
                        }
                        </div>
                    <div>
                        <NavLink to="/login" className={clases.link} activeClassName={clases.active} onClick={logoutHandler}>
                            <div onClick={logoutHandler} className={clases.icon}><BsFillXCircleFill/></div>
                            {(isOpen && <div onClick={logoutHandler} className={clases.link_text}>Cerrar Sesión</div>)}
                        </NavLink>
                    </div>
                </div>
           </div>

            
           <main className= "container">

                <img src={fondo} alt="fondo" class="bg-image" />
                <div style={{position: 'fixed', padding: '2%'}}>{children}</div>
                
            </main>
           
        </div>
        )}
     </>
    )
    ;
};

export default Sidebar;