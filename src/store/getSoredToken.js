const getStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpirationTime = localStorage.getItem('expirationTime');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    //const usuario = localStorage.getItem('usuario');

    return {
        token: storedToken,
        expirationTime: storedExpirationTime,
        usuario: usuario
    }
}

export default getStoredToken;