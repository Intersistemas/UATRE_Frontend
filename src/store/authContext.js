import React, { useEffect, useState } from 'react';
import getStoredToken from './getSoredToken';

let logoutTimer;

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    rol: null,
    usuario: {},
    login: async (token, expiresIn, rol, usuario) => {},
    logout: () => {}
})



const calculateTokenExpiracy = (expiresIn) => {
    const currentTime = new Date().getTime();
    const adjExpiresIn = new Date(expiresIn).getTime(); //expiresIn > milisegundos
    //console.log("adjExpiresIn", adjExpiresIn)
    //console.log("currentTime", currentTime)
    const remainingDuration = adjExpiresIn - currentTime;

    return remainingDuration;
}

const retrieveStoredToken = () => {
    const storedTokenData = getStoredToken();
    console.log("storedTokenData", storedTokenData)
    const remainingTime = calculateTokenExpiracy(storedTokenData.expirationTime)

    if(remainingTime <= 60000){
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        localStorage.removeItem('usuario');
        return null;
    }

    return {
        token: storedTokenData.token,
        expirationTime: remainingTime,
        usuario: storedTokenData.usuario
    }
}

export const AuthContextProvider = (props) => {
    const tokenData = retrieveStoredToken();
    let initialToken;
    let user;
    if(tokenData){
        initialToken = tokenData.token;
        user = tokenData.usuario
    }
    
    const [token, setToken] = useState(initialToken)
    const [rol, setRol] = useState(null)
    const [usuario, setUsuario] = useState(user)

    const userIsLoggedIn = !!token

    const logoutHandler = () => {
        setToken(null);
        setRol(null);
        setUsuario(null);
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        if(logoutTimer){
            clearTimeout(logoutTimer)
        }
    }

    const loginHandler = async (token, expiresIn, rol, usuario) => {
        setToken(token);
        setRol(rol);
        setUsuario(usuario);
        localStorage.setItem('token', token)
        localStorage.setItem('expirationTime', expiresIn)
        localStorage.setItem('usuario', JSON.stringify(usuario))
        //console.log("loginHandler - expiresIn", expiresIn)
        const remainingDuration = calculateTokenExpiracy(expiresIn)

        logoutTimer = setTimeout(logoutHandler, remainingDuration)
    }

    useEffect(() => {
        if(tokenData){
            //console.log("expiration", tokenData.expirationTime);
            logoutTimer = setTimeout(logoutHandler, tokenData.expirationTime)
        }
    },[tokenData])

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        rol: rol,
        usuario: usuario,
        login: loginHandler,
        logout: logoutHandler
    }

    return <AuthContext.Provider value={contextValue}>
        {props.children}
    </AuthContext.Provider>;
};

export default AuthContext;