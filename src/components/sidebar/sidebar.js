import React, { useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux'
import {
    FaTh,FaBars,FaRegUser, FaChevronRight, FaAngleUp
}from "react-icons/fa";

import { BsFillXCircleFill } from "react-icons/bs";
import { NavLink,useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../store/authContext';
import logo from '../../media/Logo1_sidebar.png';
import { useDispatch } from "react-redux";
import Button from '../ui/Button/Button';
import clases from "./sidebar.module.css";
import { handleModuloEjecutarAccion, handleModuloSeleccionar } from '../../redux/actions';
import UseKeyPress from '../helpers/UseKeyPress';
import Action from 'components/helpers/Action';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Grid } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


const StyledMenu = styled((props) => (
    <Menu
      elevation={0}

      anchorOrigin={{
        vertical: 'buttom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      {...props}
    />
  ))(({ theme }) => ({

    /*fontFamily: 'var(--fuente)',
            fontSize: '1.1rem',
            fontWeight: 'bold',  */
            
    '& .MuiPaper-root': {
        borderRadius: 6,
        marginTop: theme.spacing(1),
        minWidth: 180,
        color:
        theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
        backgroundColor: 'var(--amarillo1)',
        marginLeft: '50px',
        marginTop: '-30px',
      '& .MuiMenu-list': {
            padding: '4px 0',
            color: 'var(--color1)',
            background: 'var(--amarillo1)',
            textShadow: '1px 1px 5px white',
      },
      '& .MuiMenuItem-root': {
        fontFamily: 'var(--fuente)',
        fontSize: '1.1rem',
        fontWeight: 'bold',

        '& .MuiSvgIcon-root': {
          color: theme.palette.text.secondary,
          marginRight: theme.spacing(1.5),
        },
        '&:active': {
            color: 'white',
            background: 'var(--color2)',
            textShadow: '0px 0px 0px white',
        },
        '&:hover': {
            color: 'white',
            background: 'var(--color2)',
            textShadow: '0px 0px 0px white',
        },
      },
    },
  }));

const Sidebar = ({children}) => {

    const navigate = useNavigate();
    const location = useLocation();

    const moduloActual = useSelector(state => state.modulo)
    const afiliadoSeleccionado = useSelector(state => state.afiliado)
    
    const dispatch = useDispatch();  //Ver acciones a pasar

    const authContext = useContext(AuthContext)
    const logoutHandler = authContext.logout;
    const isLoggedIn = authContext.isLoggedIn;
    const Usuario = authContext.usuario;
    const[botones ,setBotones] = useState([]);
    const[menuItems ,setMenuItems] = useState([]);

    const [anchorEl, setAnchorEl] = React.useState(null);
    let open = Boolean(anchorEl);
    
    const handleClickBtn = (event, menuItems) => {

        console.log("handleClickBtn_event",event)
        console.log("handleClickBtn_event2",event.currentTarget)
        console.log("handleClickBtn_menuItems",menuItems)


        setAnchorEl(event.currentTarget);
        setMenuItems(menuItems)
    };
    
  
    const handleCloseBtn = () => {
      setAnchorEl(null);
    };


    const[isOpen ,setIsOpen] = useState(true);
    const toggle = () => setIsOpen (!isOpen);
    
    const navFunction = useSelector(state => state.nav[location.pathname]);

		const limpiarModulo = (path) => {
			if (location.pathname === path) return;
			dispatch(handleModuloSeleccionar({}));
		}
    
    let currentLink = [];

    const migas = location.pathname.split('/')
    .filter(miga => miga !== '')
    .map(miga => {
        currentLink.push(`/${miga}`)
        
        const path = currentLink.join('');
        const nav = {
					key: miga,
					to: path,
					className: clases.link,
					activeClassName: clases.active,
					onClick: () => limpiarModulo(path),
				};
        if (navFunction != null) {
					nav.to = "#";
					nav.onClick = () =>
						navFunction({
							go: ({ to = path, delta = null, options = null } = {}) => {
								limpiarModulo(to);
								delta == null && options == null
									? navigate(to)
									: options == null
									? navigate(delta)
									: navigate(to, options);
							},
							to: path,
						});
				}
        return(
            <NavLink {...nav}>
                <div className={clases.icon}> {miga == "Inicio" ? <FaTh/> : <FaAngleUp/>}</div>
                <div style={{display: isOpen ? "block" : "none"}} className={clases.link_text}>{miga}</div>
            </NavLink>    
        ) 

    })


    const logout = () =>{
         logoutHandler();
         navigate("ingreso");
    }

    UseKeyPress(['i'], ()=>navigate("/Inicio"), 'AltKey');
    UseKeyPress(['c'], ()=>logout(), 'AltKey');
    
    useEffect(() => {
                setBotones(moduloActual.acciones ?? '');

    },[moduloActual, afiliadoSeleccionado])

    //Despacho/actualizo el estado global de acciones, el componente que creo las acciones capturará el estado y sabrá qué hacer
    const despacharAcciones = (accion)=>{
        dispatch(handleModuloEjecutarAccion(accion));
    }

    return (
        <>     
        {isLoggedIn && (
        <div className={clases.sidebar_container}>
           <div style={{width: isOpen ? "200px" : "50px"}} className={clases.sidebar}>
                <div className={clases.sidebar_opciones}>
                    <div className={clases.top_section}>
                        <h1 style={{display: isOpen ? "block" : "none"}} className={clases.logo}>
                            <img src={logo} width="100" height="100" onClick={toggle}/>
                            <a>UATRE</a>
                        </h1>
                        {process.env.REACT_APP_URL_BASE != "uatre" && <h5 style={{textShadow: '1px 1px 15px yellow'}}>Ambiente: {process.env.REACT_APP_URL_BASE.toUpperCase()}</h5>}
                        <div  style={{display: !isOpen ? "block" : "none", marginLeft: isOpen ? "50px" : "0px"}} className={clases.bars}>
                            <FaBars onClick={toggle}/>
                        </div> 

                         <div>
                            <div className={clases.icon}><FaRegUser/></div>
                        </div>
                            {(isOpen && <div> <div className={clases.link_text}>{Usuario.cuit}</div> <p>{Usuario.nombre}</p></div>)}
                    </div>
                        <div>
                        { migas/*
                            menuItem.map((item, index)=>(
                                <NavLink to={item.path} key={index} className={clases.link} activeClassName={clases.active}>
                                    <div className={clases.icon}>{item.icon}</div>
                                    <div style={{display: isOpen ? "block" : "none"}} className={clases.link_text}>{item.name}</div>
                                </NavLink>
                            ))
                            */}
                        </div>
                        <div className={clases.actionButtons}>
                            { botones.length === 0 ? null :
                                botones.map((item, index)=>(   
                                    <div  key={index} className='d-flex align-items-center'>
                                        <FaChevronRight/>

                                        {item.ariaHaspopu ? 
                                        <>
                                            <Button 
                                                className="botonAmarillo" 
                                                underlineindex={item.underlineindex} 
                                                tarea={item.tarea}
                                                ellipsis={item.ellipsis}
                                                disabled={item.disabled}
                                                key={index} 

                                                id="basic-button"
    
                                                aria-controls={open ? 'basic-menu' : undefined}
                                                aria-haspopup= "true"
                                                aria-expanded={open ? 'true' : undefined}
                                                onClick={(e)=>handleClickBtn(e, item.menuItems)}> 
                                                {item.name}
                                                <KeyboardArrowRightIcon />
                                            </Button>
                                           {menuItems.length > 0 &&
                                            <StyledMenu
                                                id="basic-menu"
                                                anchorEl={anchorEl}
                                                open={open}
                                                onClose={handleCloseBtn}
                                                anchorOrigin={{
                                                    vertical: 'top',
                                                    horizontal: 'center',
                                                }}
                                            >
                                        
                                                {
                                                menuItems?.map((o,i)=>(
                                                    <MenuItem
                                                        key={i} 
                                                        onClick={o.onExecute}
                                                        disabled={o.disabled}
                                                    >{o.label}</MenuItem>
                                                )) 
                                                }
                                            
                                            </StyledMenu>
                                            }
                                        </>
                                        :
                                            (<Button 
                                                className="botonAmarillo" 
                                                underlineindex={item.underlineindex} 
                                                tarea={item.tarea}
                                                ellipsis={item.ellipsis}
                                                disabled={item.disabled}
                                                key={index} 

                                                onClick={() => item instanceof Action ? item.execute() : despacharAcciones(item)}> 
                                                {item.name}
                                            </Button>)
                                        }
                                    </div>
                                ))
                            }
                           
                        </div>
                    <div>
                        <NavLink to="/ingreso" className={clases.link} activeClassName={clases.active} onClick={logoutHandler}>
                            <div onClick={logoutHandler} className={clases.icon}><BsFillXCircleFill/></div>
                            {(isOpen && <div onClick={logoutHandler} className={clases.link_text}><text className={clases.underline} >C</text>errar Sesión</div>)}
                        </NavLink>
                    </div>
                </div>
           </div>
            
           <main className= "container">

                <>{children}</>
                
            </main>
           
        </div>
        )}
     </>
    )
    ;
};

export default Sidebar;