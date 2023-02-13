import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux'

import {
    FaTh,
    FaBars,
    FaUserAlt,
    FaRegChartBar,
    FaCommentAlt,
    FaShoppingBag,
    FaThList,
    FaRegUser,
    FaChevronRight
}from "react-icons/fa";
import { BsFillXCircleFill } from "react-icons/bs";
import { NavLink } from 'react-router-dom';
import AuthContext from '../../store/authContext';
import logo from '../../media/Logo1_sidebar.png';
import { Routes, Route, Navigate } from "react-router-dom";
import Inicio from '../../components/pages/inicio/Inicio';
import InicioHandler from '../../components/pages/inicio/InicioHandler';
import  AfiliadosHandler from '../../components/pages/afiliados/AfiliadosHandler';
import { useDispatch } from "react-redux";
import store from '../../redux/store';
import Button from '../ui/Button/Button';
import clases from "./sidebar.module.css";


const Sidebar = ({children}) => {

    const { modulo } = useSelector(state => state)

    console.log('modulo-REDUX',modulo)
    
    const dispatch = useDispatch();  //Ver acciones a pasar
    const authContext = useContext(AuthContext)
    const logoutHandler = authContext.logout;
    const isLoggedIn = authContext.isLoggedIn;
    const CUIT = authContext.usuario;
    const[botones ,setBotones] = useState([]);

    const[isOpen ,setIsOpen] = useState(false);
    const toggle = () => setIsOpen (!isOpen);
    const menuItem=[
        {
            path:"/inicio",
            name:"Inicio",
            icon:<FaTh/>
        }
    ]


    useEffect(() => {
        console.log('modulo en useEffect:',modulo);

                let array = [];

                if (modulo == "Afiliados") {
                    array = [
                        {
                            nombre:"Agregar Afiliado",
                            accion:"Agregar",
                            //icono:<FaTh/>
                        },
                        {
                            nombre:"Modif. Afiliado",
                            accion:"Modificar",
                            //icono:<FaRegChartBar/>
                        },
                        {
                            nombre:"Resol. Solicitud",
                            accion:"Autorizar",
                            //icono:<FaTh/>
                        }
                    ]
                };

                if (modulo == "Pagos") {
                    array = [
                        {
                            nombre:"Agregar Afiliado",
                            accion:"Agregar",
                            //icono:<FaTh/>
                        },
                        {
                            nombre:"Modif. Afiliado",
                            accion:"Modificar",
                            //icono:<FaRegChartBar/>
                        },
                        {
                            nombre:"Aut. Solicitud",
                            accion:"Autorizar",
                            //icono:<FaTh/>
                        }
                    ]
                };



                setBotones(array);
            
        
    },[modulo])


    const setActionButtons = (modulo) =>{
        let array = [];
        if (modulo == "Afiliados") {
            array = [
                {
                    nombre:"Agregar Afiliado",
                    accion:"Agregar",
                    icono: "FaTh"
                },
                {
                    nombre:"Modificar Afiliado",
                    accion:"Modificar",
                    icono: "FaRegChartBar"
                },
                {
                    nombre:"Autorizar Solicitud",
                    accion:"Autorizar",
                    icono: "FaTh"
                }
            ]
        } ;
        return array;
    }

    
    const accionButton = () =>{
        console.log('accion del boton');
    }

    console.log('**botones',botones)

    return (
        <>     
        {isLoggedIn && (
        <div className={clases.container}>
           <div style={{width: isOpen ? "200px" : "50px"}} className={clases.sidebar}>
                <div className={clases.sidebar_opciones}>
                    <div className={clases.top_section}>
                        <h1 style={{display: isOpen ? "block" : "none"}} className={clases.logo}>
                            <img src={logo} width="70" height="70" onClick={toggle}/>
                            <text> UATRE</text>
                        </h1>
                        <div  style={{display: !isOpen ? "block" : "none", marginLeft: isOpen ? "50px" : "0px"}} className={clases.bars}>
                            <FaBars onClick={toggle}/>
                        </div>
                        
                    </div>
                    
                        {
                        menuItem.map((item, index)=>(
                            <NavLink to={item.path} key={index} className={clases.link} activeclassName={clases.active}>
                                <div className={clases.icon}>{item.icon}</div>
                                <div style={{display: isOpen ? "block" : "none"}} className={clases.link_text}>{item.name}</div>
                            </NavLink>
                        ))
                        }

                        <div>
                        { botones.length === 0 ? null :
                            botones.map((item, index)=>(
                            
                            <div className={clases.actionButtons}>
                                <FaChevronRight/>
                                <Button key={index} onClick={accionButton}> 
                                    {(isOpen && <div onClick={accionButton} >{item.nombre}</div>)}
                                </Button>
                            </div>
                            ))
                        }
                        </div>
                    <div>
                        <NavLink to="/login" className={clases.link} activeclassName={clases.active} onClick={logoutHandler}>
                            <div onClick={logoutHandler} className={clases.icon}><BsFillXCircleFill/></div>
                            {(isOpen && <div onClick={logoutHandler} className={clases.link_text}>Cerrar Sesión</div>)}
                        </NavLink>
                    </div>

                    <div>
                        <div className={clases.icon}><FaRegUser/></div>
                        {(isOpen && <div className={clases.link_text}>{CUIT}</div>)}
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