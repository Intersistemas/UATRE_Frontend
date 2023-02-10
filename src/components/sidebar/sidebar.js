import React, { useState, useContext } from 'react';

import {
    FaTh,
    FaBars,
    FaUserAlt,
    FaRegChartBar,
    FaCommentAlt,
    FaShoppingBag,
    FaThList
} from "react-icons/fa";
import { BsFillXCircleFill } from "react-icons/bs";
import { NavLink } from 'react-router-dom';
import AuthContext from '../../store/authContext';
import "./sidebar.css"


const Sidebar = ({children}) => {
    const authContext = useContext(AuthContext)
    console.log('authContext-SideBar',authContext)
    const logoutHandler = authContext.logout;
    const isLoggedIn = authContext.isLoggedIn;
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
               <div className="top_section">
                   <h1 style={{display: isOpen ? "block" : "none"}} className="logo">UATRE</h1>
                   <div style={{marginLeft: isOpen ? "50px" : "0px"}} className="bars">
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
           </div>
           <main>{children}</main>
        </div>
        )}
     </>
    )
    ;
};

export default Sidebar;