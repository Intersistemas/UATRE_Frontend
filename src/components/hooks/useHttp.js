import { useCallback, useState } from 'react';
import getStoredToken from '../../store/getSoredToken';

const useHttp = () => {   
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null)

    const sendRequest = useCallback(
			async (
				configRequest,
				takeOk = (data) => {},
				takeError = (error) => {},
				takeFinally = () => {}
			) => {
        setIsLoading(true);
        setError(null)
        const storedTokenData = getStoredToken()
        let url = ''

        switch (configRequest.baseURL) {
          case "Comunes":
            url = "http://uatretest.intersistemas.net:8202/api";
            // url = "http://uatre.intersistemas.net:8202/api";
            //url = "https://localhost:7032/api";
            break;
          case "Afiliaciones":
            url = 'http://uatretest.intersistemas.net:8200/api';
            // url = "http://uatre.intersistemas.net:8200/api";
            //url = "http://localhost:5165/api";
            break;
          case "DDJJ":
              url = 'http://uatretest.intersistemas.net:8203/api';
              //url = "http://uatre.intersistemas.net:8203/api";
              //url = "http://localhost:5165/api";
              break;

          case "SIARU":
            url = 'http://uatretest.intersistemas.net:8201/api/v1';
            // url = "http://uatre.intersistemas.net:8201/api/v1";
            break;
            
          case 'Seguridad':
                url = 'http://uatretest.intersistemas.net:8800/api'
                // url = "http://uatre.intersistemas.net:8800/api";
                break;
	
            default:
                break;

        }

				configRequest.bodyToJSON ??= true;
        //Agrego Token
        let headers = {...configRequest.headers}
        if(headers.Authorization === true)
        {
            headers = {...headers,
                Authorization: "Bearer " + storedTokenData.token
            }
        }
        
				if (configRequest.body && configRequest.bodyToJSON)
					headers["Content-Type"] ??= "application/json";

				try {
					const response = await fetch(url + configRequest.endpoint, {
						method: configRequest.method ? configRequest.method : "GET",
						headers: headers,
						body: configRequest.body
							? configRequest.bodyToJSON
								? JSON.stringify(configRequest.body)
								: configRequest.body
							: null,
					});

					const data = await response.json();
					if (!response.ok) {
						throw Object.assign(new Error(data.Message || data.Mensaje || data.message || data.mensaje || data.errors), {
							type: response.statusText,
							code: response.status,
							data: data,
						});
					}
					takeOk(data);
				} catch (error) {
					error.type ??= "Error";
					error.code ??= 0;
					error.message ??= "Error";
					takeError(error);
					setError(error);
				} finally {
					takeFinally();
					setIsLoading(false);
				}
			},
			[]
		);

    return {
        isLoading, 
        error,
        sendRequest,
    };
};

export default useHttp;
