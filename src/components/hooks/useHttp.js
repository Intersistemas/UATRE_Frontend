import { useCallback, useState } from 'react';
import getStoredToken from '../../store/getSoredToken';

const useHttp = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)

    const sendRequest = useCallback(async (configRequest, applyData, takeError = (error) => {}) => {
        setIsLoading(true);
        setError(null)
        const storedTokenData = getStoredToken()
        let url = ''

        switch (configRequest.baseURL) {
            case "Comunes":
                url = "http://intersistemas.net:8202/api";
                //url = "https://localhost:7032/api";
                break;

            case "Afiliaciones":
                url = 'http://intersistemas.net:8200/api';
                //url = "http://localhost:5165/api";
                break;

            case "SIARU":
                url = 'http://intersistemas.net:8201/api';
                break;
            case "SiaruTest":
                url = 'http://svr-test:8202/api'
                break;

            case 'Seguridad':
                url = 'http://intersistemas.net:8800/api'
                break;

            default:
                break;
        }

        //Agrego Token
        let headers = { ...configRequest.headers }
        if (headers.Authorization === true) {
            headers = {
                ...headers,
                Authorization: "Bearer " + storedTokenData.token
            }
        }
<<<<<<< HEAD

=======
        
				let err;
>>>>>>> 31587e623d00b79ed4b93ad88f5075ff0379d889
        try {
            const response = await fetch(
                url + configRequest.endpoint,
                {
                    method: configRequest.method ? configRequest.method : 'GET',
                    headers: headers,
                    body: configRequest.body ? JSON.stringify(configRequest.body) : null
                }
            )
<<<<<<< HEAD

            if (!response.ok) {
                let errorMessage = 'Error ' + response.status + '-' + response.statusText;
                const errorResponse = await response.json();
                if (errorResponse.statusCode && errorResponse.mensaje) {
                    errorMessage = 'Error ' + errorResponse.statusCode + '-' + errorResponse.mensaje
=======
            if(!response.ok)
            {
                let errorMessage = 'Error ' + response.status + '-' + response.statusText;                
                const errorResponse = await response.json();
                if(errorResponse.statusCode && errorResponse.mensaje)
                {
									errorMessage = 'Error ' + errorResponse.statusCode + '-' + errorResponse.mensaje
									err = {
										type: "Body",
										code: errorResponse.statusCode,
										message: errorResponse.mensaje,
									};
>>>>>>> 31587e623d00b79ed4b93ad88f5075ff0379d889
                }
								else
								{
									err = {
										type: "Response",
										code: response.status,
										message: response.statusText,
									};
								}
                throw new Error(errorMessage);
            }

            const data = await response.json();
            applyData(data);

        } catch (error) {
					if (!err) {
						err = {
							type: "Error",
							message: error.message,
						};
					}
					takeError(err);
					setError(error.message || "Error");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        sendRequest,
    };
};

export default useHttp;
