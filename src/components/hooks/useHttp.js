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


        //DONDE HARÄ EL DEPLOY??
        //const servidor =  process.env.SERVIDOR;
        const servidor = 
        //'uatredesa';
        'uatretest';
        //'uatre';

        switch (configRequest.baseURL) {
          case "Comunes":
              url = `http://${servidor}.intersistemas.net:8202/api`;
              break;
          case "Afiliaciones":
              url = `http://${servidor}.intersistemas.net:8200/api`;
              break;
          case "DDJJ":
              url = `http://${servidor}.intersistemas.net:8203/api`;
              break;
          case "SIARU":
              url = `http://${servidor}.intersistemas.net:8201/api/v1`;
              break;
            
          case 'Seguridad':
              url = `http://${servidor}.intersistemas.net:8800/api`;
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

				const errorBase = {};
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
						errorBase.type = response.statusText;
						errorBase.code = response.status;
						errorBase.message = data.Message || data.Mensaje || data.message || data.mensaje || data.errors;
						errorBase.data = data;
						throw Object.assign(new Error(errorBase.message), errorBase);
					}
					takeOk(data);
				} catch (error) {
					error = { ...errorBase, ...error };
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
