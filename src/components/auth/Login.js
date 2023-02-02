import React, { useState, useContext } from 'react';

import LoginCard from '../ui/LoginCard/LoginCard';
import classes from './Login.module.css';
import Button from '../ui/Button/Button';
import useHttp from '../hooks/useHttp';
import urlAPI from '../api/apiSeguridad';
import AuthContext from '../../store/authContext';
import { useNavigate  } from 'react-router-dom';
import logo from '../../media/UATRE_Logo.jpg';

const Login = () => {
  const authContext = useContext(AuthContext)
  const { isLoading, error, sendRequest: sendLoginRequest} = useHttp()
  //const [userLoggedIn, setUserLoggedIn] = useState(null)

  const [enteredCUIT, setEnteredCUIT] = useState('');
  const [cuitIsValid, setCUITIsValid] = useState();
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordIsValid, setPasswordIsValid] = useState();

  const history = useNavigate ();

  const cuitChangeHandler = (event) => {
	setEnteredCUIT(event.target.value);
  };

  const passwordChangeHandler = (event) => {
	setEnteredPassword(event.target.value);
  };

  const validateCUITHandler = () => {
	setCUITIsValid(enteredCUIT.trim().length === 11);
  };

  const validatePasswordHandler = () => {
	setPasswordIsValid(enteredPassword.trim().length > 6);
  };

  const processLogIn = async (userObject) => {
	  console.log('userObject1', userObject)
	  await authContext.login(userObject.token.tokenId, userObject.token.validTo.toString(), userObject.rol, userObject.usuario)
	  console.log('logged')
	  history.replace("/")
  }

  const sendLoginHandler = async() => {
	sendLoginRequest({
	  url: urlAPI + "Usuario/login",
	  method: "POST",
	  headers: {
		"Content-Type": "application/json",
		"Accept": "*/*"
	  },
	  body: {
		"CUIT": enteredCUIT,
		"Password": enteredPassword,
		"Rol": "Empleador"
	  }
	},processLogIn);
  }

  const submitHandler = (event) => {
	  event.preventDefault();
	  //props.onLogin(enteredCUIT, enteredPassword);
	  sendLoginHandler()
	  console.log('submitHandler');
  };

  return (
	<LoginCard className={classes.login}>
	  <form onSubmit={submitHandler}>
		<div
		  className={`${classes.control} ${
			cuitIsValid === false ? classes.invalid : ''
		  }`}
		>
		  <img src={logo} width="200" height="200" />
		  <label htmlFor="email">CUIT</label>
		  <input
			type="cuit"
			id="cuit"
			value={enteredCUIT}
			onChange={cuitChangeHandler}
			onBlur={validateCUITHandler}
		  />
		</div>
		<div
		  className={`${classes.control} ${
			passwordIsValid === false ? classes.invalid : ''
		  }`}
		>
		  <label htmlFor="password">Clave</label>
		  <input
			type="password"
			id="password"
			value={enteredPassword}
			onChange={passwordChangeHandler}
			onBlur={validatePasswordHandler}
		  />
		</div>
		<div className={classes.actions}>
		  {!isLoading ?
		  <div>
            <Button type="submit" className={classes.btn}>
                Ingresar
            </Button>
            <p/>
            <Button className={classes.btn2}>
                Registrar
            </Button>
		  </div>
		  :
			<p>Cargando...</p>
		  }
		</div>
		<div>{error !== null ? <p>Error: {error}</p> : null}</div>
	  </form>
	</LoginCard>
  );
};

export default Login;