import React, { useState, useContext } from 'react';

import LoginCard from '../ui/LoginCard/LoginCard';
import classes from './login.module.css';
import Button from '../ui/Button/Button';
import useHttp from '../hooks/useHttp';
import urlAPI from '../api/apiSeguridad';
import AuthContext from '../../store/authContext';
import { useNavigate  } from 'react-router-dom';
import logo from '../../media/UATRE_Logo.jpg';
import Form from 'react-bootstrap/Form';

const Login = () => {
	{console.log('Login')};
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
		"Rol": null
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
	<div className={classes.container}>
		<LoginCard className={classes.login}>
		<img src={logo} width="200" height="200" />
		<Form onSubmit={submitHandler}>

			<Form.Group className="mb-3" controlId="formCUIT">
        		<Form.Label><strong>CUIT/CUIL</strong></Form.Label>
	
        		<Form.Control type="text" placeholder="CUIT/CUIL"
					id="cuit"
					value={enteredCUIT}
					onChange={cuitChangeHandler}
					onBlur={validateCUITHandler}/>
			</Form.Group>

			<Form.Group className="mb-3" controlId="formClave">
				<Form.Label><strong>Clave</strong></Form.Label>
				<Form.Control type="password" placeholder="Clave"
				id="password"
				value={enteredPassword}
				onChange={passwordChangeHandler}
				onBlur={validatePasswordHandler} />
			</Form.Group>

			<div className={classes.actions}>
				{!isLoading ?
				<div>
					<Button type="submit" className="botonAzul">
						Ingresar
					</Button>
					<p/>
					<Button className="botonBlanco">
						Registrar
					</Button>
				</div>
				:
					<p>Cargando...</p>
				}
			</div>
			<div>{error !== null ? <p>Error: {error}</p> : null}</div>
		</Form>
		</LoginCard>
	</div>
  );
};

export default Login;